#!/usr/bin/env node
import { parseArgs } from './args.js'
import { runCommand } from './commands/index.js'

const { command, args, flags } = parseArgs(process.argv.slice(2))
runCommand(command, args, flags).catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
