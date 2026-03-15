import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative, extname, resolve } from 'path'
import chalk from 'chalk'
import * as p from '@clack/prompts'
import { OpZeroClient, AuthManager } from '@opzero/core'

const TEXT_EXTENSIONS = new Set([
  '.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.mdx',
  '.txt', '.xml', '.svg', '.yml', '.yaml', '.toml', '.csv', '.ico',
  '.webmanifest', '.map', '.mjs', '.cjs', '.woff', '.woff2',
])

function readFilesRecursive(dir: string, base?: string): Record<string, string> {
  base ??= dir
  const files: Record<string, string> = {}
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      Object.assign(files, readFilesRecursive(full, base))
    } else if (TEXT_EXTENSIONS.has(extname(entry).toLowerCase())) {
      const rel = relative(base, full)
      files[rel] = readFileSync(full, 'utf-8')
    }
  }
  return files
}

export async function deploy(args: string[], flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }

  const client = new OpZeroClient()

  // Artifact deploy
  if (flags.artifact) {
    const file = typeof flags.artifact === 'string' ? flags.artifact : args[0]
    if (!file || !existsSync(file)) {
      console.error(chalk.red('Provide a file path: opzero deploy --artifact ./App.tsx'))
      process.exit(1)
    }
    const code = readFileSync(resolve(file), 'utf-8')
    const name = typeof flags.name === 'string' ? flags.name : undefined
    console.log(chalk.dim(`Deploying artifact ${file}...`))
    const result = await client.deployArtifact({
      code,
      name,
      title: typeof flags.title === 'string' ? flags.title : undefined,
      target: (typeof flags.target === 'string' ? flags.target : undefined) as any,
      force_new: !!flags['force-new'],
    })
    console.log(result)
    return
  }

  // Markdown deploy
  if (flags.markdown) {
    const file = typeof flags.markdown === 'string' ? flags.markdown : args[0]
    if (!file || !existsSync(file)) {
      console.error(chalk.red('Provide a file path: opzero deploy --markdown ./README.md'))
      process.exit(1)
    }
    const markdown = readFileSync(resolve(file), 'utf-8')
    const name = typeof flags.name === 'string' ? flags.name : undefined
    console.log(chalk.dim(`Deploying markdown ${file}...`))
    const result = await client.deployMarkdown({
      markdown,
      name,
      title: typeof flags.title === 'string' ? flags.title : undefined,
      target: (typeof flags.target === 'string' ? flags.target : undefined) as any,
      force_new: !!flags['force-new'],
    })
    console.log(result)
    return
  }

  // Themed deploy
  if (flags.themed) {
    const file = typeof flags.themed === 'string' ? flags.themed : args[0]
    if (!file || !existsSync(file)) {
      console.error(chalk.red('Provide a file path: opzero deploy --themed ./content.html'))
      process.exit(1)
    }
    const content = readFileSync(resolve(file), 'utf-8')
    const name = typeof flags.name === 'string' ? flags.name : undefined
    console.log(chalk.dim(`Deploying themed content ${file}...`))
    const result = await client.deployThemed({
      content,
      name,
      title: typeof flags.title === 'string' ? flags.title : undefined,
      target: (typeof flags.target === 'string' ? flags.target : undefined) as any,
      force_new: !!flags['force-new'],
    })
    console.log(result)
    return
  }

  // Standard directory deploy
  const directory = resolve(args[0] || '.')
  if (!existsSync(directory)) {
    console.error(chalk.red(`Directory not found: ${directory}`))
    process.exit(1)
  }

  let name = typeof flags.name === 'string' ? flags.name : undefined
  if (!name) {
    const input = await p.text({
      message: 'Project name:',
      placeholder: 'my-awesome-site',
      validate: (v) => !v ? 'Name is required' : undefined,
    })
    if (p.isCancel(input)) { p.cancel('Deploy cancelled.'); process.exit(0) }
    name = input as string
  }

  console.log(chalk.dim(`Reading files from ${directory}...`))
  const files = readFilesRecursive(directory)
  const count = Object.keys(files).length
  if (count === 0) {
    console.error(chalk.red('No deployable files found.'))
    process.exit(1)
  }
  console.log(chalk.dim(`Found ${count} file(s). Deploying...`))

  const target = typeof flags.target === 'string' ? flags.target : undefined
  const result = await client.deploy({
    name,
    target: target as any,
    files,
    force_new: !!flags['force-new'],
  })

  console.log('\n' + result)
}
