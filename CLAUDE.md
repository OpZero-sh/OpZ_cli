# OpZero CLI -- Project Guide

## Overview

This is a Bun monorepo containing the OpZero deployment platform CLI, MCP server, and API client.

## Monorepo Structure

```
packages/
  cli/        # opzero — CLI tool (TypeScript, Commander-style)
  mcp/        # @opzero/mcp — MCP server for AI tools + Claude Code plugin
  core/       # @opzero/core — API client library
docs/         # User-facing documentation (markdown)
```

- `packages/cli/src/commands/` -- One file per CLI command
- `packages/mcp/src/tools/` -- MCP tool definitions (26-tool full server)
- `packages/mcp/src/claude-code-plugin.ts` -- Focused 10-tool Claude Code plugin
- `packages/core/src/` -- API client, auth manager, types

## Runtime

This project uses **Bun** as its runtime and package manager. Do not use npm or yarn for development.

## Build and Run

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run the CLI locally
bun run packages/cli/src/index.tsx

# Run the full MCP server (26 tools)
bun run packages/mcp/src/index.ts

# Run the Claude Code plugin server (10 focused tools)
bun run packages/mcp/src/claude-code-plugin.ts

# Run MCP server with --claude-code flag (equivalent to above)
bun run packages/mcp/src/index.ts -- --claude-code
```

## Testing and Linting

```bash
# Run tests
bun run test

# Type check
bun run typecheck

# Build (also catches compile errors)
bun run build
```

## Key Conventions

- TypeScript throughout, using `import`/`export` (ESM)
- Prefer named exports over default exports
- All packages share `@opzero/core` as the API foundation
- MCP tools map 1:1 to `@opzero/core` client methods
- CLI commands follow Commander patterns with `--json` support for machine output

## Git Workflow

- **Never push directly to `main`.** Always create a feature branch and open a pull request.
- Branch naming: `feat/description`, `fix/description`, `docs/description`
- Keep commits focused -- one logical change per commit
- Run `bun run typecheck && bun run build` before pushing

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPZERO_API_KEY` | API key (overrides config file) |
| `OPZERO_API_URL` | Custom API base URL |
| `OPZERO_DEFAULT_TARGET` | Default deploy target (cloudflare, netlify, vercel) |

## Documentation

User-facing docs live in `docs/`. Update them when adding or changing commands or tools.

| File | Content |
|------|---------|
| `docs/getting-started.md` | Installation and first deploy walkthrough |
| `docs/commands.md` | Full CLI command reference |
| `docs/mcp-setup.md` | MCP server setup for all AI clients |
| `docs/claude-code-plugin.md` | Claude Code plugin setup and tool reference |
| `docs/api-client.md` | @opzero/core programmatic usage |
| `docs/contributing.md` | Contribution guidelines |
