import chalk from 'chalk'

export async function openProject(args: string[], _flags: Record<string, string | boolean>) {
  const name = args[0]
  if (!name) {
    console.error(chalk.red('Usage: opzero open <project-name>'))
    process.exit(1)
  }
  const { default: open } = await import('open')
  // Open the project subdomain — convention is name.opzero.sh for cloudflare
  console.log(chalk.dim(`Opening ${name}...`))
  await open(`https://opzero.sh/dashboard`)
}
