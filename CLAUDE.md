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
| `OPZERO_API_URL` | Custom API base URL (default: `https://opzero.sh`) |
| `OPZERO_DEFAULT_TARGET` | Default deploy target (cloudflare, netlify, vercel) |

**Environment management**: The CLI authenticates against OpZero.sh, whose env vars are managed on **Vercel**. The CLI itself stores auth config locally at `~/.opzero/config.json`. No Vercel env pull needed for the CLI repo itself — just run `opzero login` with an API key from the dashboard.

### Auth token storage

- **Config file**: `~/.opzero/config.json`
- **Lookup order**: `OPZERO_API_KEY` env var → config file
- **Token used as**: `Authorization: Bearer <token>` against OpZero API
- **MCP server**: Reads same config (headless, no interactive login)

## Testing

```bash
# Type checking (primary quality gate — no test files exist yet)
bun run typecheck

# Build all packages (catches compile errors across workspace)
bun run build

# Lint
bun run lint

# Manual CLI testing
bun run packages/cli/src/index.tsx whoami
bun run packages/cli/src/index.tsx projects
bun run packages/cli/src/index.tsx deploy --help

# Manual MCP testing (start server, then use MCP inspector)
bun run packages/mcp/src/index.ts
# In another terminal: use MCP inspector to call tools

# Test Claude Code plugin
bun run packages/mcp/src/claude-code-plugin.ts
```

### Testing each package

| Package | What to test | How |
|---------|-------------|-----|
| `@opzero/core` | API client methods, auth manager | `bun run typecheck` in packages/core |
| `opzero` (CLI) | All 16 commands work | Run each command with `--help` and with real args |
| `@opzero/mcp` | 26 tools respond correctly | Start server, call tools via MCP inspector |
| Claude Code plugin | 10 focused tools | Add as MCP server in Claude Code, test deploy flow |

### End-to-end deploy test

```bash
# Full deploy cycle test
echo '<h1>Test</h1>' > /tmp/test-deploy.html
bun run packages/cli/src/index.tsx deploy /tmp/test-deploy.html
# Verify the returned URL loads the page
```

## Publishing

Releases are automated via GitHub Actions on `v*` tags:
- Publishes `@opzero/core`, `opzero`, `@opzero/mcp` to npm with provenance
- Requires `NPM_TOKEN` GitHub secret

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

## Related repos

- **OpZero.sh** (`~/opzero-sh/OpZero.sh`) — API backend the CLI talks to
- **backend** (`~/opzero-sh/backend`) — Shared DB schema (`@opzero/db`)
- **MCPAuthKit** (`~/opzero-sh/MCPAuthKit`) — Auth provider for OAuth flows
