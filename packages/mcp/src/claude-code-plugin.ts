#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { OpZeroClient, AuthManager } from '@opzero/core'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative, extname, resolve } from 'path'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClient(): OpZeroClient {
  if (!AuthManager.isAuthenticated()) {
    throw new Error(
      'Not authenticated. Run `opzero login` to set up credentials, or set the OPZERO_API_KEY environment variable.',
    )
  }
  return new OpZeroClient()
}

function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

const TEXT_EXTENSIONS = new Set([
  '.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.mdx',
  '.txt', '.xml', '.svg', '.yml', '.yaml', '.toml', '.csv', '.ico',
  '.webmanifest', '.map', '.mjs', '.cjs',
])

function readFilesRecursive(dir: string, base?: string): Record<string, string> {
  base ??= dir
  const files: Record<string, string> = {}
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist' || entry === 'build' || entry === '.next') continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      Object.assign(files, readFilesRecursive(full, base))
    } else if (TEXT_EXTENSIONS.has(extname(entry).toLowerCase())) {
      files[relative(base, full)] = readFileSync(full, 'utf-8')
    }
  }
  return files
}

type ProjectType = 'nextjs' | 'vite-react' | 'react-esm' | 'static' | 'markdown' | 'generic'

interface DetectionResult {
  type: ProjectType
  framework: string
  buildDir?: string
}

function detectProjectType(dir: string): DetectionResult {
  const has = (file: string) => existsSync(join(dir, file))
  const readJson = (file: string) => {
    try { return JSON.parse(readFileSync(join(dir, file), 'utf-8')) } catch { return null }
  }

  // Next.js
  if (has('next.config.js') || has('next.config.ts') || has('next.config.mjs')) {
    return { type: 'nextjs', framework: 'Next.js', buildDir: '.next' }
  }

  // Vite + React
  if ((has('vite.config.ts') || has('vite.config.js')) && readJson('package.json')?.dependencies?.react) {
    return { type: 'vite-react', framework: 'Vite + React', buildDir: 'dist' }
  }

  // React (ESM / no bundler)
  const pkg = readJson('package.json')
  if (pkg?.dependencies?.react && !has('vite.config.ts') && !has('vite.config.js')) {
    return { type: 'react-esm', framework: 'React (ESM)' }
  }

  // Pure markdown
  const entries = readdirSync(dir).filter(e => !e.startsWith('.'))
  const allMd = entries.length > 0 && entries.every(e => e.endsWith('.md') || e.endsWith('.mdx'))
  if (allMd) {
    return { type: 'markdown', framework: 'Markdown' }
  }

  // Static HTML
  if (has('index.html')) {
    return { type: 'static', framework: 'Static HTML' }
  }

  // Generic
  return { type: 'generic', framework: 'Static files' }
}

// ---------------------------------------------------------------------------
// Server instructions — teaches Claude how to use OpZero effectively
// ---------------------------------------------------------------------------

const INSTRUCTIONS = `You are connected to OpZero, a deployment platform that lets you deploy websites and web applications instantly.

## Key capabilities
- Deploy any static site, React app, Next.js project, or markdown content
- Deploy to Cloudflare Pages, Netlify, or Vercel
- Manage projects, custom domains, and rollbacks
- View build logs and deployment status

## Deployment workflow
When a user asks to deploy a project:
1. Use opzero_deploy with the project's directory path
2. The tool auto-detects the framework (Next.js, Vite, React, static HTML, etc.)
3. It reads all deployable files and pushes them to production
4. Returns the live URL

## Tips
- Always confirm the directory path with the user if uncertain
- Use opzero_status to check if the user is authenticated before deploying
- Use opzero_preview for staging deployments the user wants to review first
- Use opzero_logs if a deployment fails to diagnose the issue
- The default deploy target is Cloudflare Pages unless the user specifies otherwise`

// ---------------------------------------------------------------------------
// Register the focused tool set
// ---------------------------------------------------------------------------

function registerClaudeCodeTools(server: McpServer) {

  // ---- 1. opzero_deploy ----
  server.tool(
    'opzero_deploy',
    'Deploy a project directory to production. Auto-detects framework (Next.js, Vite, React, static HTML, markdown). Reads files from the given path and deploys them, returning the live URL.',
    {
      path: z.string().describe('Absolute path to project directory to deploy'),
      name: z.string().optional().describe('Project name (auto-generated from directory name if omitted)'),
      target: z.enum(['cloudflare', 'netlify', 'vercel']).optional().describe('Hosting provider (defaults to user preference, usually Cloudflare)'),
      force_new: z.boolean().optional().describe('Force create a new project even if name matches an existing one'),
    },
    async (args) => {
      const dir = resolve(args.path)
      if (!existsSync(dir)) {
        return textResult(`Error: Directory not found: ${dir}`)
      }

      const detection = detectProjectType(dir)
      const files = readFilesRecursive(dir)
      const count = Object.keys(files).length
      if (count === 0) {
        return textResult(`Error: No deployable files found in ${dir}. If this is a build-based project (${detection.framework}), you may need to run the build step first.`)
      }

      const client = getClient()
      const projectName = args.name || dir.split('/').pop() || 'my-site'

      const result = await client.deploy({
        name: projectName,
        target: args.target,
        files,
        force_new: args.force_new,
      })

      return textResult(`Framework detected: ${detection.framework}\nFiles deployed: ${count}\n\n${result}`)
    },
  )

  // ---- 2. opzero_preview ----
  server.tool(
    'opzero_preview',
    'Create a preview deployment for reviewing changes before going to production. Returns a unique preview URL.',
    {
      path: z.string().describe('Absolute path to project directory'),
      name: z.string().optional().describe('Project name'),
      target: z.enum(['cloudflare', 'netlify', 'vercel']).optional().describe('Hosting provider'),
    },
    async (args) => {
      const dir = resolve(args.path)
      if (!existsSync(dir)) {
        return textResult(`Error: Directory not found: ${dir}`)
      }

      const files = readFilesRecursive(dir)
      const count = Object.keys(files).length
      if (count === 0) {
        return textResult(`Error: No deployable files found in ${dir}`)
      }

      const client = getClient()
      const baseName = args.name || dir.split('/').pop() || 'preview'
      const previewName = `preview-${Date.now().toString(36)}-${baseName}`

      const result = await client.deploy({
        name: previewName,
        target: args.target,
        files,
        force_new: true,
      })

      return textResult(`Preview deployment (${count} files):\n\n${result}`)
    },
  )

  // ---- 3. opzero_status ----
  server.tool(
    'opzero_status',
    'Check deployment status, account overview, and usage stats. Optionally check a specific project or deployment.',
    {
      project_name: z.string().optional().describe('Check status of a specific project'),
      deployment_id: z.string().optional().describe('Check status of a specific deployment'),
    },
    async (args) => {
      const client = getClient()
      const parts: string[] = []

      // Always include system status
      const status = await client.getSystemStatus()
      parts.push('=== Account Status ===')
      parts.push(status)

      // Specific deployment
      if (args.deployment_id) {
        const dep = await client.getDeployment(args.deployment_id)
        parts.push('\n=== Deployment Details ===')
        parts.push(dep)
      }

      // Specific project — list its recent deployments
      if (args.project_name) {
        const projects = await client.listProjects({ name_contains: args.project_name, limit: 1 })
        parts.push(`\n=== Project: ${args.project_name} ===`)
        parts.push(projects)
      }

      return textResult(parts.join('\n'))
    },
  )

  // ---- 4. opzero_projects ----
  server.tool(
    'opzero_projects',
    'List all projects. Filter by status or search by name.',
    {
      status: z.enum(['active', 'archived', 'all']).optional().describe('Filter by project status (default: active)'),
      search: z.string().optional().describe('Search projects by name'),
      limit: z.number().optional().describe('Max results to return (default: 20)'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.listProjects({
        status: args.status === 'all' ? 'all' : args.status,
        name_contains: args.search,
        limit: args.limit,
      })
      return textResult(result)
    },
  )

  // ---- 5. opzero_logs ----
  server.tool(
    'opzero_logs',
    'View build and deployment logs. Useful for diagnosing failed deployments.',
    {
      project_name: z.string().optional().describe('Project name to get logs for'),
      deployment_id: z.string().optional().describe('Specific deployment ID'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.getBuildLogs({
        project_name: args.project_name,
        deployment_id: args.deployment_id,
      })
      return textResult(result)
    },
  )

  // ---- 6. opzero_domains ----
  server.tool(
    'opzero_domains',
    'View or set custom domains for a project. Omit the domain parameter to view the current domain configuration.',
    {
      project_name: z.string().optional().describe('Project name'),
      project_id: z.string().optional().describe('Project UUID'),
      domain: z.string().optional().describe('Custom domain to set (e.g. example.com). Omit to view current.'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.setCustomDomain({
        name: args.project_name,
        project_id: args.project_id,
        domain: args.domain,
      })
      return textResult(result)
    },
  )

  // ---- 7. opzero_rollback ----
  server.tool(
    'opzero_rollback',
    'Rollback a project to a previous deployment. If no deployment_id is given, rolls back to the most recent previous deployment.',
    {
      project_name: z.string().optional().describe('Project name to rollback'),
      deployment_id: z.string().optional().describe('Specific deployment ID to rollback to'),
    },
    async (args) => {
      const client = getClient()

      if (args.deployment_id) {
        const result = await client.rollback(args.deployment_id)
        return textResult(result)
      }

      // If only project_name given, try to find previous deployment and redeploy
      if (args.project_name) {
        const result = await client.redeploy({ name: args.project_name })
        return textResult(result)
      }

      return textResult('Error: Provide either a project_name or deployment_id to rollback.')
    },
  )

  // ---- 8. opzero_init ----
  server.tool(
    'opzero_init',
    'Initialize a new project from a template. Scaffolds files into the given directory.',
    {
      template: z.enum(['landing', 'portfolio', 'blog', 'static', 'vite-react', 'react-esm', 'opzero']).describe('Template type'),
      path: z.string().describe('Absolute path to directory to scaffold into'),
    },
    async (args) => {
      const { writeFileSync, mkdirSync } = await import('fs')
      const { join: joinPath } = await import('path')
      const dir = resolve(args.path)
      const client = getClient()
      const result = await client.getTemplate(args.template)

      try {
        const data = JSON.parse(result)
        const files = data.files || data
        mkdirSync(dir, { recursive: true })
        const created: string[] = []
        for (const [filePath, content] of Object.entries(files)) {
          const fullPath = joinPath(dir, filePath)
          mkdirSync(joinPath(fullPath, '..'), { recursive: true })
          writeFileSync(fullPath, content as string)
          created.push(filePath)
        }
        return textResult(
          `Scaffolded ${args.template} template in ${dir}:\n${created.map((f) => '  ' + f).join('\n')}`,
        )
      } catch {
        return textResult(result)
      }
    },
  )

  // ---- 9. opzero_update ----
  server.tool(
    'opzero_update',
    'Incrementally update specific files in a deployed project without re-uploading everything.',
    {
      project_name: z.string().optional().describe('Project name'),
      project_id: z.string().optional().describe('Project UUID'),
      files: z.record(z.string()).describe('Map of file paths to their new content'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.updateDeployment({
        project_name: args.project_name,
        project_id: args.project_id,
        files: args.files,
      })
      return textResult(result)
    },
  )

  // ---- 10. opzero_whoami ----
  server.tool(
    'opzero_whoami',
    'Show current authentication status, account info, plan, and usage statistics.',
    {},
    async () => {
      if (!AuthManager.isAuthenticated()) {
        return textResult(
          'Not authenticated. Run `opzero login` to set up credentials, or set the OPZERO_API_KEY environment variable.',
        )
      }

      const creds = AuthManager.getCredentials()
      const source = process.env.OPZERO_API_KEY
        ? 'environment variable (OPZERO_API_KEY)'
        : 'config file (~/.opzero/config.json)'
      const authMethod = creds.token ? 'OAuth token' : creds.apiKey ? 'API key' : 'unknown'

      const client = getClient()
      const result = await client.getSystemStatus()
      let userInfo: Record<string, unknown> = {}
      try {
        const data = JSON.parse(result)
        userInfo = {
          email: data.user?.email,
          plan: data.user?.plan,
          status: data.user?.status,
          deploysUsed: data.usage?.deploysUsed,
          deploysLimit: data.usage?.deploysLimit,
          projectsUsed: data.usage?.projectsUsed,
          projectsLimit: data.usage?.projectsLimit,
        }
      } catch {}

      return textResult(JSON.stringify({
        authenticated: true,
        method: authMethod,
        source,
        ...userInfo,
      }, null, 2))
    },
  )
}

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------

export async function startClaudeCodeServer() {
  const server = new McpServer(
    {
      name: 'opzero-claude-code',
      version: '0.1.0',
    },
    {
      instructions: INSTRUCTIONS,
    },
  )

  registerClaudeCodeTools(server)

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

// Auto-start if run directly
const isDirectRun =
  process.argv[1]?.includes('opzero-claude-code') ||
  process.argv[1]?.endsWith('/mcp/src/claude-code-plugin.ts') ||
  process.argv[1]?.endsWith('/mcp/dist/claude-code-plugin.js') ||
  process.argv.includes('--claude-code')

if (isDirectRun) {
  startClaudeCodeServer().catch((err) => {
    console.error('Failed to start Claude Code plugin server:', err)
    process.exit(1)
  })
}
