import chalk from 'chalk'
import { AuthManager } from '@opzero/core'

export async function logout() {
  AuthManager.clear()
  console.log(chalk.green('Logged out. Credentials cleared.'))
}
