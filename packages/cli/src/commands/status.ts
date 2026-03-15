import chalk from 'chalk'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function status(_args: string[], _flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const client = new OpZeroClient()
  console.log(chalk.dim('Fetching status...'))
  const result = await client.getSystemStatus()
  console.log(result)
}
