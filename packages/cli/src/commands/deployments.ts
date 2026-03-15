import chalk from 'chalk'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function deployments(args: string[], flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const client = new OpZeroClient()
  const projectId = args[0] || (typeof flags.project === 'string' ? flags.project : undefined)
  console.log(chalk.dim('Fetching deployments...'))
  const result = await client.listDeployments({
    projectId,
    limit: typeof flags.limit === 'string' ? parseInt(flags.limit) : undefined,
  })
  console.log(result)
}
