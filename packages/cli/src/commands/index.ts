import { login } from './login.js'
import { logout } from './logout.js'
import { whoami } from './whoami.js'
import { deploy } from './deploy.js'
import { projects } from './projects.js'
import { deployments } from './deployments.js'
import { rollback } from './rollback.js'
import { redeploy } from './redeploy.js'
import { logs } from './logs.js'
import { domains } from './domains.js'
import { init } from './init.js'
import { templates } from './templates.js'
import { status } from './status.js'
import { openProject } from './open.js'
import { mcp } from './mcp.js'
import { showHelp } from './help.js'

type CommandFn = (args: string[], flags: Record<string, string | boolean>) => Promise<void>

const commands: Record<string, CommandFn> = {
  login, logout, whoami,
  deploy,
  projects,
  deployments, rollback, redeploy, logs,
  domains,
  init, templates,
  status, open: openProject, mcp,
  help: showHelp,
}

export async function runCommand(command: string, args: string[], flags: Record<string, string | boolean>) {
  if (flags.version) {
    console.log('opzero v0.1.0')
    return
  }
  if (flags.help && command === 'help') {
    await showHelp(args, flags)
    return
  }
  const fn = commands[command]
  if (!fn) {
    console.error(`Unknown command: ${command}`)
    console.error('Run `opzero help` for usage.')
    process.exit(1)
  }
  if (flags.help) {
    await showHelp([command], flags)
    return
  }
  await fn(args, flags)
}
