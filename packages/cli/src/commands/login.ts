import * as p from '@clack/prompts'
import chalk from 'chalk'
import { AuthManager } from '@opzero/core'

export async function login(_args: string[], flags: Record<string, string | boolean>) {
  p.intro(chalk.cyan.bold('OpZero Login'))

  // Direct API key flag
  if (flags['api-key'] || flags.key) {
    const key = typeof flags.key === 'string' ? flags.key : undefined
    const apiKey = key || await p.text({
      message: 'Paste your API key:',
      placeholder: 'wcd_...',
      validate: (v) => !v ? 'API key is required' : undefined,
    })
    if (p.isCancel(apiKey)) { p.cancel('Login cancelled.'); process.exit(0) }
    AuthManager.setApiKey(apiKey as string)
    p.outro(chalk.green('Logged in with API key'))
    return
  }

  // Browser OAuth
  if (flags.browser) {
    p.log.info('Browser OAuth coming soon. Use --api-key for now.')
    p.log.info(`Get your API key at ${chalk.cyan('https://opzero.sh/dashboard/api-keys')}`)
    process.exit(0)
  }

  // Interactive choice
  const method = await p.select({
    message: 'How would you like to authenticate?',
    options: [
      { value: 'api-key', label: 'API Key', hint: 'paste a key from your dashboard' },
      { value: 'browser', label: 'Browser', hint: 'sign in via browser (coming soon)' },
    ],
  })

  if (p.isCancel(method)) { p.cancel('Login cancelled.'); process.exit(0) }

  if (method === 'api-key') {
    const apiKey = await p.text({
      message: 'Paste your API key:',
      placeholder: 'wcd_...',
      validate: (v) => !v ? 'API key is required' : undefined,
    })
    if (p.isCancel(apiKey)) { p.cancel('Login cancelled.'); process.exit(0) }
    AuthManager.setApiKey(apiKey as string)
    p.outro(chalk.green('Logged in with API key'))
  } else {
    p.log.info('Browser OAuth coming soon. Use API Key for now.')
    p.log.info(`Get your API key at ${chalk.cyan('https://opzero.sh/dashboard/api-keys')}`)
  }
}
