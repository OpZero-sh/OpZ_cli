export interface ParsedArgs {
  command: string
  args: string[]
  flags: Record<string, string | boolean>
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {}
  const positional: string[] = []

  const BOOLEAN_FLAGS = new Set(['help', 'json', 'force-new', 'browser', 'api-key', 'h', 'version', 'v'])

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      flags.help = true
    } else if (arg === '--version' || arg === '-v') {
      flags.version = true
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2)
      if (BOOLEAN_FLAGS.has(key)) {
        flags[key] = true
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        flags[key] = argv[++i]
      } else {
        flags[key] = true
      }
    } else {
      positional.push(arg)
    }
  }

  return {
    command: positional[0] || 'help',
    args: positional.slice(1),
    flags,
  }
}
