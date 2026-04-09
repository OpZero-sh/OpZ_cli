import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { AuthManager } from '@opzero/core'

const CLAUDE_DIR = join(homedir(), '.claude')
const CLAUDE_SETTINGS = join(CLAUDE_DIR, 'settings.json')

interface ClaudeSettings {
  mcpServers?: Record<string, {
    command: string
    args?: string[]
    env?: Record<string, string>
  }>
  [key: string]: unknown
}

function readClaudeSettings(): ClaudeSettings {
  if (!existsSync(CLAUDE_SETTINGS)) return {}
  try {
    return JSON.parse(readFileSync(CLAUDE_SETTINGS, 'utf-8'))
  } catch {
    return {}
  }
}

function writeClaudeSettings(settings: ClaudeSettings): void {
  mkdirSync(CLAUDE_DIR, { recursive: true })
  writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2) + '\n')
}

function isClaudeCodeInstalled(): boolean {
  try {
    execSync('which claude', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function resolveServerCommand(): { command: string; args: string[] } {
  // Check if opzero-claude-code binary is available (global install)
  try {
    const binPath = execSync('which opzero-claude-code', { encoding: 'utf-8' }).trim()
    if (binPath) {
      return { command: binPath, args: [] }
    }
  } catch {}

  // Check if we can find the local package
  try {
    const binPath = execSync('which opzero-mcp', { encoding: 'utf-8' }).trim()
    if (binPath) {
      return { command: binPath, args: ['--claude-code'] }
    }
  } catch {}

  // Fallback to npx
  return { command: 'npx', args: ['@opzero/mcp', '--claude-code'] }
}

export async function setup(args: string[], _flags: Record<string, string | boolean>) {
  const subcommand = args[0]

  if (subcommand !== 'claude-code') {
    console.error(chalk.red(`Unknown setup target: ${subcommand || '(none)'}`))
    console.error('')
    console.error('Available setup targets:')
    console.error('  claude-code    Configure OpZero as a Claude Code plugin')
    console.error('')
    console.error('Usage:')
    console.error('  opzero setup claude-code')
    process.exit(1)
  }

  console.log(chalk.cyan.bold('\n  OpZero Claude Code Plugin Setup\n'))

  // Step 1: Check if Claude Code is installed
  const claudeInstalled = isClaudeCodeInstalled()
  if (claudeInstalled) {
    console.log(chalk.green('  ✓') + ' Claude Code detected')
  } else {
    console.log(chalk.yellow('  ⚠') + ' Claude Code CLI not found in PATH')
    console.log(chalk.dim('    The plugin config will still be written — Claude Code will pick it up when installed.'))
  }

  // Step 2: Check OpZero authentication
  if (AuthManager.isAuthenticated()) {
    console.log(chalk.green('  ✓') + ' OpZero authenticated')
  } else {
    console.log(chalk.yellow('  ⚠') + ' OpZero not authenticated')
    console.log(chalk.dim('    Run `opzero login` to authenticate, or set OPZERO_API_KEY.'))
  }

  // Step 3: Resolve the server command
  const serverConfig = resolveServerCommand()
  console.log(chalk.green('  ✓') + ` Server command: ${serverConfig.command} ${serverConfig.args.join(' ')}`)

  // Step 4: Merge config into ~/.claude/settings.json
  const settings = readClaudeSettings()
  const hadExisting = !!settings.mcpServers?.opzero

  if (!settings.mcpServers) {
    settings.mcpServers = {}
  }

  settings.mcpServers.opzero = {
    command: serverConfig.command,
    ...(serverConfig.args.length > 0 ? { args: serverConfig.args } : {}),
    env: {},
  }

  writeClaudeSettings(settings)

  if (hadExisting) {
    console.log(chalk.green('  ✓') + ' Updated existing OpZero config in ~/.claude/settings.json')
  } else {
    console.log(chalk.green('  ✓') + ' Added OpZero to ~/.claude/settings.json')
  }

  // Step 5: Verify the connection works by testing the import
  let verified = false
  try {
    // Quick sanity check: can we import the module?
    // @ts-expect-error — @opzero/mcp may not be built yet
    await import('@opzero/mcp')
    verified = true
    console.log(chalk.green('  ✓') + ' Plugin module verified')
  } catch {
    console.log(chalk.yellow('  ⚠') + ' Could not verify plugin module (may need to install @opzero/mcp)')
  }

  // Summary
  console.log('')
  console.log(chalk.green.bold('  Setup complete!'))
  console.log('')

  if (verified && claudeInstalled) {
    console.log('  The OpZero plugin is ready. Open Claude Code and try:')
    console.log(chalk.dim('    "Deploy this project to production"'))
  } else {
    console.log('  Configuration written to ~/.claude/settings.json')
    console.log('  Next steps:')
    if (!claudeInstalled) {
      console.log(chalk.dim('    1. Install Claude Code: https://claude.ai/code'))
    }
    if (!AuthManager.isAuthenticated()) {
      console.log(chalk.dim(`    ${claudeInstalled ? '1' : '2'}. Run: opzero login`))
    }
    console.log(chalk.dim(`    ${!claudeInstalled && !AuthManager.isAuthenticated() ? '3' : !claudeInstalled || !AuthManager.isAuthenticated() ? '2' : '1'}. Open Claude Code and try: "Deploy this project"`))
  }

  console.log('')
}
