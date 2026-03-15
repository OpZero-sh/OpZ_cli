import chalk from 'chalk'
import * as p from '@clack/prompts'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function rollback(args: string[], _flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const deploymentId = args[0]
  if (!deploymentId) {
    console.error(chalk.red('Usage: opzero rollback <deployment-id>'))
    process.exit(1)
  }
  const confirm = await p.confirm({ message: `Rollback to deployment ${deploymentId}?` })
  if (p.isCancel(confirm) || !confirm) { p.cancel('Cancelled.'); return }
  const client = new OpZeroClient()
  console.log(chalk.dim('Rolling back...'))
  const result = await client.rollback(deploymentId)
  console.log(result)
}
