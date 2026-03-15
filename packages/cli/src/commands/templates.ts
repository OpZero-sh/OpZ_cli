import chalk from 'chalk'

const TEMPLATES = [
  { name: 'opzero', desc: 'OpZero branded theme with light/dark mode', hint: 'recommended' },
  { name: 'landing', desc: 'Marketing landing page', hint: '' },
  { name: 'portfolio', desc: 'Personal portfolio site', hint: '' },
  { name: 'blog', desc: 'Article/blog site', hint: '' },
  { name: 'static', desc: 'Basic HTML/CSS/JS', hint: '' },
  { name: 'react-esm', desc: 'Zero-build React via ESM.sh', hint: '' },
  { name: 'vite-react', desc: 'React app with Vite', hint: '' },
]

export async function templates() {
  console.log(chalk.cyan.bold('\nOpZero Templates\n'))
  for (const t of TEMPLATES) {
    const hint = t.hint ? chalk.green(` (${t.hint})`) : ''
    console.log(`  ${chalk.bold(t.name.padEnd(14))} ${t.desc}${hint}`)
  }
  console.log(`\n  ${chalk.dim('Usage: opzero init [dir] — to scaffold from a template')}\n`)
}
