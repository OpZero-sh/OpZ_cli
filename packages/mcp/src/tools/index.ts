import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { OpZeroClient, AuthManager } from '@opzero/core'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative, extname, resolve } from 'path'

function getClient(): OpZeroClient {
  if (!AuthManager.isAuthenticated()) {
    throw new Error(
      'Not authenticated. Run `opzero login` to set up credentials.',
    )
  }
  return new OpZeroClient()
}

const TEXT_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.json',
  '.md',
  '.mdx',
  '.txt',
  '.xml',
  '.svg',
  '.yml',
  '.yaml',
  '.toml',
  '.csv',
  '.ico',
  '.webmanifest',
  '.map',
  '.mjs',
  '.cjs',
])

function readFilesRecursive(
  dir: string,
  base?: string,
): Record<string, string> {
  base ??= dir
  const files: Record<string, string> = {}
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
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

function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

export function registerTools(server: McpServer) {
  // ============= Quick Start =============
  server.tool('help', 'Get help with OpZero deployment tools', {}, async () => {
    const client = getClient()
    const result = await client.help()
    return textResult(result)
  })

  server.tool(
    'quick_deploy',
    'One-click deploy. Give it HTML and get a live URL instantly.',
    {
      html: z.string().describe('HTML content to deploy'),
      name: z.string().optional().describe('Optional site name'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Hosting provider'),
      force_new: z.boolean().optional().describe('Force create new project'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.quickDeploy(args)
      return textResult(result)
    },
  )

  // ============= Deploy =============
  server.tool(
    'deploy_website',
    'Deploy a website with multiple files to production.',
    {
      name: z.string().optional().describe('Project name'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Hosting provider'),
      files: z.record(z.string()).describe('File path to content mapping'),
      projectId: z.string().optional().describe('Existing project ID'),
      force_new: z.boolean().optional().describe('Force create new project'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.deploy(args)
      return textResult(result)
    },
  )

  server.tool(
    'deploy_artifact',
    'Deploy a React component as a live website.',
    {
      code: z.string().describe('React component code (JSX/TSX)'),
      name: z.string().optional().describe('Site name'),
      title: z.string().optional().describe('Page title'),
      dependencies: z
        .record(z.string())
        .optional()
        .describe('ESM.sh dependencies'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Hosting provider'),
      force_new: z.boolean().optional().describe('Force create new project'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.deployArtifact(args)
      return textResult(result)
    },
  )

  server.tool(
    'deploy_themed',
    'Deploy content with OpZero brand theme.',
    {
      content: z.string().describe('HTML content for the page body'),
      title: z.string().optional().describe('Page title'),
      theme: z
        .enum(['dark', 'light', 'auto'])
        .optional()
        .describe('Color theme'),
      name: z.string().optional().describe('Site name'),
      style: z
        .enum(['landing', 'article', 'dashboard'])
        .optional()
        .describe('Layout style'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Hosting provider'),
      force_new: z.boolean().optional().describe('Force create new project'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.deployThemed(args)
      return textResult(result)
    },
  )

  server.tool(
    'deploy_markdown',
    'Deploy markdown as a beautiful themed page.',
    {
      markdown: z.string().describe('Raw markdown content'),
      title: z.string().optional().describe('Page title'),
      theme: z
        .enum(['dark', 'light', 'auto'])
        .optional()
        .describe('Color theme'),
      name: z.string().optional().describe('Site name'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Hosting provider'),
      force_new: z.boolean().optional().describe('Force create new project'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.deployMarkdown(args)
      return textResult(result)
    },
  )

  server.tool(
    'update_deployment',
    'Incrementally update a deployed site.',
    {
      project_name: z.string().optional().describe('Project name'),
      project_id: z.string().optional().describe('Project UUID'),
      files: z.record(z.string()).describe('Partial file map to merge'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.updateDeployment(args)
      return textResult(result)
    },
  )

  // ============= Projects =============
  server.tool(
    'list_projects',
    'List all deployed websites and projects.',
    {
      status: z
        .enum(['active', 'archived', 'deleted', 'all'])
        .optional()
        .describe('Filter by status'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Filter by provider'),
      name_contains: z.string().optional().describe('Search by name'),
      sort_by: z
        .enum(['created', 'last_deploy', 'name'])
        .optional()
        .describe('Sort order'),
      stale_days: z.number().optional().describe('Only stale projects'),
      limit: z.number().optional().describe('Max results'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.listProjects(args)
      return textResult(result)
    },
  )

  server.tool(
    'create_project',
    'Create a new project container.',
    {
      name: z.string().describe('Project name'),
      description: z.string().optional().describe('Project description'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Hosting provider'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.createProject(args)
      return textResult(result)
    },
  )

  server.tool(
    'project_delete',
    'Soft-delete projects.',
    {
      name: z.string().optional().describe('Project name'),
      project_id: z.string().optional().describe('Project UUID'),
      names: z.array(z.string()).optional().describe('Bulk delete names'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.deleteProject(args)
      return textResult(result)
    },
  )

  server.tool(
    'project_archive',
    'Archive or unarchive projects.',
    {
      name: z.string().optional().describe('Project name'),
      project_id: z.string().optional().describe('Project UUID'),
      names: z.array(z.string()).optional().describe('Bulk names'),
      action: z
        .enum(['archive', 'unarchive'])
        .optional()
        .describe('Archive or unarchive'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.archiveProject(args)
      return textResult(result)
    },
  )

  server.tool(
    'project_cleanup',
    'Analyze projects and get cleanup recommendations.',
    {},
    async () => {
      const client = getClient()
      const result = await client.cleanupProjects()
      return textResult(result)
    },
  )

  // ============= Deployments =============
  server.tool(
    'get_deployment',
    'Get deployment status, URL, and files.',
    {
      deploymentId: z.string().describe('Deployment ID'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.getDeployment(args.deploymentId)
      return textResult(result)
    },
  )

  server.tool(
    'list_deployments',
    'List recent deployments.',
    {
      projectId: z.string().optional().describe('Filter by project'),
      limit: z.number().optional().describe('Max results'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.listDeployments(args)
      return textResult(result)
    },
  )

  server.tool(
    'redeploy',
    'Redeploy a project.',
    {
      name: z.string().optional().describe('Project name'),
      project_id: z.string().optional().describe('Project UUID'),
      deployment_id: z
        .string()
        .optional()
        .describe('Specific deployment to redeploy from'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.redeploy(args)
      return textResult(result)
    },
  )

  server.tool(
    'rollback_deployment',
    'Rollback to a previous deployment.',
    {
      deployment_id: z.string().describe('Deployment ID to rollback to'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.rollback(args.deployment_id)
      return textResult(result)
    },
  )

  server.tool(
    'get_build_logs',
    'Get build logs for a deployment or project.',
    {
      deployment_id: z.string().optional().describe('Deployment ID'),
      project_name: z.string().optional().describe('Project name'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.getBuildLogs(args)
      return textResult(result)
    },
  )

  server.tool(
    'delete_deployment',
    'Permanently delete a deployment record.',
    {
      deployment_id: z.string().describe('Deployment ID to delete'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.deleteDeployment(args.deployment_id)
      return textResult(result)
    },
  )

  // ============= Templates & Domains =============
  server.tool(
    'get_template',
    'Get starter template files.',
    {
      template: z
        .enum([
          'landing',
          'portfolio',
          'blog',
          'static',
          'vite-react',
          'react-esm',
          'opzero',
        ])
        .describe('Template type'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.getTemplate(args.template)
      return textResult(result)
    },
  )

  server.tool(
    'set_custom_domain',
    'Set or remove a custom domain.',
    {
      project_id: z.string().optional().describe('Project UUID'),
      name: z.string().optional().describe('Project name'),
      domain: z.string().optional().describe('Custom domain'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.setCustomDomain(args)
      return textResult(result)
    },
  )

  // ============= Agent & Status =============
  server.tool(
    'ask_agent',
    'Ask the AI agent about your deployments.',
    {
      question: z.string().describe('Question to ask'),
      include_context: z
        .boolean()
        .optional()
        .describe('Include system context'),
    },
    async (args) => {
      const client = getClient()
      const result = await client.askAgent(args.question, args.include_context)
      return textResult(result)
    },
  )

  server.tool(
    'get_system_status',
    'Get account summary: plan, usage, projects, deployments.',
    {},
    async () => {
      const client = getClient()
      const result = await client.getSystemStatus()
      return textResult(result)
    },
  )

  // ============= LOCAL-ONLY TOOLS =============
  server.tool(
    'deploy_local_dir',
    'Deploy a local directory to OpZero.',
    {
      path: z.string().describe('Absolute path to directory'),
      name: z.string().optional().describe('Project name'),
      target: z
        .enum(['cloudflare', 'netlify', 'vercel'])
        .optional()
        .describe('Hosting provider'),
      force_new: z.boolean().optional().describe('Force create new project'),
    },
    async (args) => {
      const dir = resolve(args.path)
      const files = readFilesRecursive(dir)
      const count = Object.keys(files).length
      if (count === 0) {
        return textResult('Error: No deployable files found in ' + dir)
      }
      const client = getClient()
      const result = await client.deploy({
        name: args.name,
        target: args.target,
        files,
        force_new: args.force_new,
      })
      return textResult(result)
    },
  )

  server.tool(
    'init_project',
    'Scaffold a new project from a template into a local directory.',
    {
      template: z
        .enum([
          'landing',
          'portfolio',
          'blog',
          'static',
          'vite-react',
          'react-esm',
          'opzero',
        ])
        .describe('Template type'),
      path: z.string().describe('Directory to scaffold into'),
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

  server.tool(
    'open_project',
    'Open a project URL in the default browser.',
    {
      name: z.string().describe('Project name to open'),
    },
    async (args) => {
      const { execFile } = await import('child_process')

      // Look up the project URL
      let url = 'https://opzero.sh/dashboard'
      try {
        const client = getClient()
        const result = await client.listProjects({ name_contains: args.name, limit: 1 })
        const data = JSON.parse(result)
        const project = data?.projects?.[0]
        if (project?.url || project?.productionUrl) {
          url = project.productionUrl || project.url
        }
      } catch {}

      const cmd =
        process.platform === 'darwin'
          ? 'open'
          : process.platform === 'win32'
            ? 'start'
            : 'xdg-open'
      execFile(cmd, [url])
      return textResult(`Opened ${url}`)
    },
  )

  server.tool(
    'whoami',
    'Show current auth status and usage.',
    {},
    async () => {
      if (!AuthManager.isAuthenticated()) {
        return textResult(
          'Not authenticated. Run `opzero login` to set up credentials.',
        )
      }
      const creds = AuthManager.getCredentials()
      const source = process.env.OPZERO_API_KEY ? 'environment variable (OPZERO_API_KEY)' : 'config file (~/.opzero/config.json)'
      const authMethod = creds.token ? 'OAuth token' : creds.apiKey ? 'API key' : 'unknown'

      // Get user info from system status
      const client = getClient()
      const result = await client.getSystemStatus()
      let userInfo: Record<string, unknown> = {}
      try {
        const data = JSON.parse(result)
        userInfo = {
          email: data.user?.email,
          plan: data.user?.plan,
          status: data.user?.status,
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
