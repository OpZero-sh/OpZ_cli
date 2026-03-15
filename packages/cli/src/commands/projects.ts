import chalk from 'chalk'
import * as p from '@clack/prompts'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function projects(args: string[], flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const client = new OpZeroClient()
  const sub = args[0]

  if (sub === 'create') {
    const name = args[1] || (typeof flags.name === 'string' ? flags.name : undefined)
    if (!name) {
      console.error(chalk.red('Usage: opzero projects create <name>'))
      process.exit(1)
    }
    console.log(chalk.dim(`Creating project ${name}...`))
    const result = await client.createProject({
      name: name as string,
      target: (typeof flags.target === 'string' ? flags.target : undefined) as any,
    })
    console.log(result)
    return
  }

  if (sub === 'delete') {
    const name = args[1]
    if (!name) {
      console.error(chalk.red('Usage: opzero projects delete <name|id>'))
      process.exit(1)
    }
    const confirm = await p.confirm({ message: `Delete project "${name}"?` })
    if (p.isCancel(confirm) || !confirm) { p.cancel('Cancelled.'); return }
    const result = await client.deleteProject({ name })
    console.log(result)
    return
  }

  if (sub === 'archive') {
    const name = args[1]
    if (!name) {
      console.error(chalk.red('Usage: opzero projects archive <name|id>'))
      process.exit(1)
    }
    const result = await client.archiveProject({ name })
    console.log(result)
    return
  }

  if (sub === 'open') {
    const { default: open } = await import('open')
    const name = args[1]
    if (!name) {
      console.error(chalk.red('Usage: opzero projects open <name|id>'))
      process.exit(1)
    }
    console.log(chalk.dim(`Opening ${name} in browser...`))
    // Would need to get project URL first, for now open dashboard
    await open(`https://opzero.sh/dashboard`)
    return
  }

  if (sub === 'cleanup') {
    console.log(chalk.dim('Analyzing projects...'))
    const result = await client.cleanupProjects()
    console.log(result)
    return
  }

  // Default: list projects
  console.log(chalk.dim('Fetching projects...'))
  const result = await client.listProjects({
    status: typeof flags.status === 'string' ? flags.status as any : undefined,
    target: typeof flags.target === 'string' ? flags.target as any : undefined,
    name_contains: typeof flags.search === 'string' ? flags.search : undefined,
    limit: typeof flags.limit === 'string' ? parseInt(flags.limit) : undefined,
  })
  console.log(result)
}
