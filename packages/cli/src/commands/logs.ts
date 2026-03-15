import chalk from 'chalk'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function logs(args: string[], _flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }
  const id = args[0]
  if (!id) {
    console.error(chalk.red('Usage: opzero logs <deployment-id|project-name>'))
    process.exit(1)
  }
  const client = new OpZeroClient()
  // Try as deployment ID first, fall back to project name
  const isUUID = /^[0-9a-f]{8}-/.test(id)
  const result = await client.getBuildLogs(
    isUUID ? { deployment_id: id } : { project_name: id }
  )
  console.log(result)
}
