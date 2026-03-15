import chalk from 'chalk'

const BANNER = `
${chalk.cyan.bold('⚡ OpZero')} ${chalk.dim('— Deploy websites from your terminal')}
${chalk.dim('https://opzero.sh')}
`

const USAGE = `
${chalk.bold('USAGE')}
  ${chalk.cyan('opzero')} ${chalk.yellow('<command>')} ${chalk.dim('[options]')}

${chalk.bold('COMMANDS')}
  ${chalk.cyan('login')}          Authenticate with OpZero
  ${chalk.cyan('logout')}         Clear stored credentials
  ${chalk.cyan('whoami')}         Show current user and plan

  ${chalk.cyan('deploy')} ${chalk.dim('[dir]')}   Deploy a directory or file
  ${chalk.cyan('init')} ${chalk.dim('[dir]')}     Scaffold a new project from template
  ${chalk.cyan('templates')}      List available templates

  ${chalk.cyan('projects')}       List and manage projects
  ${chalk.cyan('deployments')}    List deployment history
  ${chalk.cyan('rollback')}       Rollback to a previous deployment
  ${chalk.cyan('redeploy')}       Redeploy a project
  ${chalk.cyan('logs')}           View build logs

  ${chalk.cyan('domains')}        Manage custom domains
  ${chalk.cyan('status')}         Platform status and usage
  ${chalk.cyan('open')}           Open a project in the browser

  ${chalk.cyan('mcp')}            Start stdio MCP server

${chalk.bold('OPTIONS')}
  ${chalk.dim('--help, -h')}     Show help
  ${chalk.dim('--version, -v')}  Show version
  ${chalk.dim('--json')}         Output as JSON

${chalk.bold('EXAMPLES')}
  ${chalk.dim('$')} opzero login
  ${chalk.dim('$')} opzero deploy ./my-site --name my-project
  ${chalk.dim('$')} opzero deploy --artifact ./App.tsx
  ${chalk.dim('$')} opzero projects
  ${chalk.dim('$')} opzero rollback my-project

${chalk.dim('Powered by')} ${chalk.cyan('opzero.sh')}
`

export async function showHelp(_args: string[], _flags: Record<string, string | boolean>) {
  console.log(BANNER)
  console.log(USAGE)
}
