import chalk from 'chalk'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function whoami(_args: string[], flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const client = new OpZeroClient()
  console.log(chalk.dim('Fetching account info...'))
  try {
    const result = await client.getSystemStatus()
    if (flags.json) {
      console.log(result)
    } else {
      console.log(result)
    }
  } catch (err: any) {
    console.error(chalk.red(`Error: ${err.message}`))
    process.exit(1)
  }
}
