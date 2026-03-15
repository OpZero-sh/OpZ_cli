import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import chalk from 'chalk'
import * as p from '@clack/prompts'
import { OpZeroClient, AuthManager } from '@opzero/core'

export async function init(args: string[], _flags: Record<string, string | boolean>) {
  if (!AuthManager.isAuthenticated()) {
    console.error(chalk.red('Not logged in. Run `opzero login` first.'))
    process.exit(1)
  }

  p.intro(chalk.cyan.bold('Create a new OpZero project'))

  const template = await p.select({
    message: 'Choose a template:',
    options: [
      { value: 'opzero', label: 'OpZero Theme', hint: 'branded theme with light/dark mode (recommended)' },
      { value: 'landing', label: 'Landing Page', hint: 'marketing page' },
      { value: 'portfolio', label: 'Portfolio', hint: 'personal site' },
      { value: 'blog', label: 'Blog', hint: 'article site' },
      { value: 'static', label: 'Static', hint: 'basic HTML' },
      { value: 'react-esm', label: 'React (ESM)', hint: 'zero-build React via ESM.sh' },
      { value: 'vite-react', label: 'React (Vite)', hint: 'React app with Vite' },
    ],
  })
  if (p.isCancel(template)) { p.cancel('Cancelled.'); process.exit(0) }

  const dir = resolve(args[0] || '.')
  if (existsSync(dir) && existsSync(join(dir, 'index.html'))) {
    const overwrite = await p.confirm({ message: 'Directory already has index.html. Overwrite?' })
    if (p.isCancel(overwrite) || !overwrite) { p.cancel('Cancelled.'); process.exit(0) }
  }

  const s = p.spinner()
  s.start('Fetching template...')
  const client = new OpZeroClient()
  const result = await client.getTemplate(template as string)
  s.stop('Template fetched')

  // Parse the result — it should contain files
  try {
    const data = JSON.parse(result)
    const files = data.files || data
    mkdirSync(dir, { recursive: true })
    for (const [path, content] of Object.entries(files)) {
      const fullPath = join(dir, path)
      const dirPath = join(fullPath, '..')
      mkdirSync(dirPath, { recursive: true })
      writeFileSync(fullPath, content as string)
      console.log(chalk.dim(`  Created ${path}`))
    }
    p.outro(chalk.green(`Project scaffolded in ${dir}`))
  } catch {
    // If we can't parse, just show the raw result
    console.log(result)
  }
}
