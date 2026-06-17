import { spawn } from 'child_process'
import * as p from '@clack/prompts'
import chalk from 'chalk'
import { AuthManager, deviceLogin, DeviceAuthError } from '@opzero/core'

/** Best-effort: open a URL in the user's default browser. Never throws. */
function openBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  try {
    spawn(cmd, args, { stdio: 'ignore', detached: true }).unref()
  } catch {
    // Headless / no browser — the user can copy the URL manually.
  }
}

/**
 * RFC 8628 device-code login against AuthKit. Displays a user code + URL,
 * polls for approval, then stores the resulting token family.
 */
async function deviceFlow() {
  const s = p.spinner()
  let spinning = false

  let result
  try {
    result = await deviceLogin({
      hooks: {
        onUserCode: ({ userCode, verificationUri, verificationUriComplete, expiresIn }) => {
          const target = verificationUriComplete || verificationUri
          p.note(
            [
              `Open ${chalk.cyan(verificationUri)}`,
              `Enter code: ${chalk.bold.green(userCode)}`,
              '',
              chalk.dim(`Code expires in ${Math.round(expiresIn / 60)} min.`),
            ].join('\n'),
            'Authorize this CLI',
          )
          openBrowser(target)
          s.start('Waiting for approval in the browser...')
          spinning = true
        },
      },
    })
  } catch (err) {
    if (spinning) s.stop('Login failed', 1)
    if (err instanceof DeviceAuthError) {
      p.cancel(err.message)
      process.exit(1)
    }
    throw err
  }

  AuthManager.setOAuthTokens(result)
  if (spinning) s.stop('Authorized')
  p.outro(chalk.green('Logged in via browser'))
}

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

  // Browser OAuth (RFC 8628 device-code grant — works headless)
  if (flags.browser) {
    await deviceFlow()
    return
  }

  // Interactive choice
  const method = await p.select({
    message: 'How would you like to authenticate?',
    options: [
      { value: 'api-key', label: 'API Key', hint: 'paste a key from your dashboard' },
      { value: 'browser', label: 'Browser', hint: 'sign in via browser' },
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
    await deviceFlow()
  }
}
