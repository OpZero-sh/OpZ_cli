import chalk from 'chalk'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function redeploy(args: string[], _flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const name = args[0]
  if (!name) {
    console.error(chalk.red('Usage: opzero redeploy <project-name>'))
    process.exit(1)
  }
  const client = new OpZeroClient()
  console.log(chalk.dim(`Redeploying ${name}...`))
  const result = await client.redeploy({ name })
  console.log(result)
}
