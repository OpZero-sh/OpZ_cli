<div align="center">

# OpZero CLI

**Deploy websites from your terminal. Powered by [opzero.sh](https://opzero.sh)**

[![npm version](https://img.shields.io/npm/v/opzero.svg)](https://www.npmjs.com/package/opzero)
[![npm downloads](https://img.shields.io/npm/dm/opzero.svg)](https://www.npmjs.com/package/opzero)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Deploy HTML, React components, and full websites to Cloudflare Pages, Netlify, or Vercel — in seconds.

[Get Started](#quick-start) · [Commands](#commands) · [Claude Code Plugin](#claude-code-plugin) · [MCP Server](#mcp-server) · [API Client](#api-client)

</div>

---

## Quick Start

### Install

```bash
# Install globally
npm install -g opzero

# Or use directly with npx
npx opzero deploy ./my-site --name my-project
```

### Authenticate

```bash
opzero login
```

Get your API key from [opzero.sh/dashboard/api-keys](https://opzero.sh/dashboard/api-keys).

### Deploy

```bash
# Deploy a directory
opzero deploy ./my-site --name my-project

# Deploy a React component
opzero deploy --artifact ./App.tsx --name my-app

# Deploy markdown as a styled page
opzero deploy --markdown ./README.md --name docs

# Deploy with OpZero theme
opzero deploy --themed ./content.html --name landing
```

That's it. Your site is live.

## Commands

### Authentication
| Command | Description |
|---------|-------------|
| `opzero login` | Authenticate (API key or browser OAuth) |
| `opzero logout` | Clear stored credentials |
| `opzero whoami` | Show current user and plan info |

### Deploying
| Command | Description |
|---------|-------------|
| `opzero deploy [dir]` | Deploy a directory |
| `opzero deploy --artifact <file>` | Deploy a React component |
| `opzero deploy --markdown <file>` | Deploy markdown as a page |
| `opzero deploy --themed <file>` | Deploy with OpZero brand theme |

### Projects
| Command | Description |
|---------|-------------|
| `opzero projects` | List all projects |
| `opzero projects create <name>` | Create a new project |
| `opzero projects delete <name>` | Delete a project |
| `opzero projects archive <name>` | Archive a project |
| `opzero projects cleanup` | Find stale/duplicate projects |

### Deployments
| Command | Description |
|---------|-------------|
| `opzero deployments [project]` | List deployment history |
| `opzero rollback <deployment-id>` | Rollback to a previous version |
| `opzero redeploy <project>` | Redeploy latest version |
| `opzero logs <id>` | View build logs |

### Setup
| Command | Description |
|---------|-------------|
| `opzero setup claude-code` | Configure OpZero as a Claude Code plugin |

### Other
| Command | Description |
|---------|-------------|
| `opzero domains set <project> <domain>` | Set custom domain |
| `opzero init [dir]` | Scaffold from template |
| `opzero templates` | List available templates |
| `opzero status` | Platform status and usage |
| `opzero open <project>` | Open project in browser |
| `opzero mcp` | Start MCP server for AI tools |

### Global Flags
- `--help, -h` — Show help
- `--version, -v` — Show version
- `--json` — Output as JSON
- `--target <provider>` — cloudflare, netlify, or vercel

## Install via Curl

Install the CLI or MCP server without npm:

```bash
# Install the OpZero CLI
curl -fsSL https://opzero.sh/install.sh | sh

# Install just the MCP server (for AI tool integration)
curl -fsSL https://opzero.sh/install-mcp.sh | sh
```

## Claude Code Plugin

The OpZero Claude Code plugin is a focused deployment experience built specifically for [Claude Code](https://claude.ai/code). Instead of exposing all 26 raw MCP tools, it provides 10 high-level, workflow-oriented tools optimized for the "deploy this project" pattern.

Key features:

- **Framework auto-detection** -- automatically identifies Next.js, Vite, React, static HTML, and markdown projects
- **Single `opzero_deploy` tool** -- replaces six separate deploy commands with one unified entry point
- **Rich tool descriptions** -- includes context hints that help Claude make better deployment decisions
- **Preview deployments** -- stage changes before going live with `opzero_preview`

See the [Claude Code Plugin guide](docs/claude-code-plugin.md) for full details.

### Quick Setup

The fastest way to configure Claude Code is the setup command:

```bash
opzero setup claude-code
```

This automatically:
1. Detects how the OpZero MCP server is installed (global binary, npx, or local)
2. Merges the correct configuration into `~/.claude/settings.json`
3. Verifies the plugin module is accessible

### Manual Setup

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "opzero": {
      "command": "npx",
      "args": ["@opzero/mcp", "--claude-code"]
    }
  }
}
```

Or, if installed globally:

```json
{
  "mcpServers": {
    "opzero": {
      "command": "opzero-claude-code"
    }
  }
}
```

### Plugin Tools (10)

| Tool | Description |
|------|-------------|
| `opzero_deploy` | Deploy a project directory to production with framework auto-detection |
| `opzero_preview` | Create a preview deployment for reviewing changes |
| `opzero_status` | Check deployment status and account overview |
| `opzero_projects` | List and search projects |
| `opzero_logs` | View build and deployment logs |
| `opzero_domains` | View or set custom domains |
| `opzero_rollback` | Rollback to a previous deployment |
| `opzero_init` | Scaffold a new project from a template |
| `opzero_update` | Incrementally update files in a deployed project |
| `opzero_whoami` | Show authentication status and account info |

## MCP Server

The OpZero MCP server lets AI assistants (Claude Code, Cursor, Windsurf, etc.) deploy websites directly. This is the full 26-tool server suitable for any MCP-compatible client.

### Setup for Claude Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "opzero": {
      "command": "opzero",
      "args": ["mcp"]
    }
  }
}
```

Or use the standalone package:

```json
{
  "mcpServers": {
    "opzero": {
      "command": "npx",
      "args": ["@opzero/mcp"]
    }
  }
}
```

### Available Tools (26)

**Deploy:** `quick_deploy`, `deploy_website`, `deploy_artifact`, `deploy_themed`, `deploy_markdown`, `update_deployment`

**Projects:** `list_projects`, `create_project`, `project_delete`, `project_archive`, `project_cleanup`

**Deployments:** `get_deployment`, `list_deployments`, `redeploy`, `rollback_deployment`, `get_build_logs`, `delete_deployment`

**Templates & Domains:** `get_template`, `set_custom_domain`

**System:** `help`, `ask_agent`, `get_system_status`

**Local-only:** `deploy_local_dir`, `init_project`, `open_project`, `whoami`

## API Client

Use `@opzero/core` to build your own integrations:

```bash
npm install @opzero/core
```

```typescript
import { OpZeroClient } from '@opzero/core'

const client = new OpZeroClient({ apiKey: 'your-api-key' })

// Deploy a website
const result = await client.deploy({
  name: 'my-site',
  files: {
    'index.html': '<h1>Hello World</h1>',
  },
})

console.log(`Live at: ${result.url}`)
```

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| [`opzero`](packages/cli) | [![npm](https://img.shields.io/npm/v/opzero.svg)](https://www.npmjs.com/package/opzero) | CLI tool |
| [`@opzero/mcp`](packages/mcp) | [![npm](https://img.shields.io/npm/v/@opzero/mcp.svg)](https://www.npmjs.com/package/@opzero/mcp) | MCP server for AI tools |
| [`@opzero/core`](packages/core) | [![npm](https://img.shields.io/npm/v/@opzero/core.svg)](https://www.npmjs.com/package/@opzero/core) | API client library |

## Development

```bash
# Clone the repo
git clone https://github.com/opzero-sh/cli.git
cd cli

# Install dependencies
bun install

# Build all packages
bun run build

# Run the CLI locally
bun run packages/cli/src/index.tsx
```

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

Built with [Bun](https://bun.sh) · Powered by [OpZero.sh](https://opzero.sh)

</div>
