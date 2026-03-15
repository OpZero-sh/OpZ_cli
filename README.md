<div align="center">

# OpZero CLI

**Deploy websites from your terminal. Powered by [opzero.sh](https://opzero.sh)**

[![npm version](https://img.shields.io/npm/v/opzero.svg)](https://www.npmjs.com/package/opzero)
[![npm downloads](https://img.shields.io/npm/dm/opzero.svg)](https://www.npmjs.com/package/opzero)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Deploy HTML, React components, and full websites to Cloudflare Pages, Netlify, or Vercel — in seconds.

[Get Started](#quick-start) · [Commands](#commands) · [MCP Server](#mcp-server) · [API Client](#api-client)

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

## MCP Server

The OpZero MCP server lets AI assistants (Claude Code, Cursor, Windsurf, etc.) deploy websites directly.

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
