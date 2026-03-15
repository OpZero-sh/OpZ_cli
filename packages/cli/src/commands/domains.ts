import chalk from 'chalk'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function domains(args: string[], _flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const sub = args[0]
  if (sub !== 'set') {
    console.error(chalk.red('Usage: opzero domains set <project> <domain>'))
    process.exit(1)
  }
  const project = args[1]
  const domain = args[2]
  if (!project) {
    console.error(chalk.red('Usage: opzero domains set <project> <domain>'))
    process.exit(1)
  }
  const client = new OpZeroClient()
  console.log(chalk.dim(`Setting domain for ${project}...`))
  const result = await client.setCustomDomain({ name: project, domain })
  console.log(result)
}
