# Getting Started

This guide walks you through installing the OpZero CLI, authenticating, and shipping your first deployment.

## Prerequisites

- Node.js 18+ (or Bun)
- An OpZero account at [opzero.sh](https://opzero.sh)

## Install

Install the CLI globally so the `opzero` command is available everywhere:

```bash
npm install -g opzero
```

Or install via curl:

```bash
curl -fsSL https://opzero.sh/install.sh | sh
```

Or run commands directly without installing:

```bash
npx opzero --help
```

If you use Bun:

```bash
bun add -g opzero
```

## Authenticate

Log in with your API key or through the browser:

```bash
opzero login
```

You will be prompted to either:

1. **Enter an API key** — get one from [opzero.sh/dashboard/api-keys](https://opzero.sh/dashboard/api-keys)
2. **Open your browser** — OAuth flow that stores credentials locally

Verify your session:

```bash
opzero whoami
```

## Your First Deploy

### Deploy a static directory

If you have a folder of HTML, CSS, and JS files:

```bash
opzero deploy ./my-site --name my-first-project
```

The CLI uploads your files, builds if needed, and returns a live URL.

### Deploy a React component

Ship a single `.tsx` or `.jsx` file as a standalone page:

```bash
opzero deploy --artifact ./App.tsx --name my-app
```

OpZero wraps your component in a minimal HTML shell, bundles it server-side, and deploys the result.

### Deploy markdown

Turn a markdown file into a styled, hosted page:

```bash
opzero deploy --markdown ./README.md --name docs
```

### Deploy with the OpZero theme

Use the OpZero brand theme for landing pages:

```bash
opzero deploy --themed ./content.html --name landing
```

## Choose a target

By default, OpZero deploys to Cloudflare Pages. You can target other providers:

```bash
opzero deploy ./my-site --name my-project --target vercel
opzero deploy ./my-site --name my-project --target netlify
```

## Custom domains

After deploying, attach a custom domain:

```bash
opzero domains set my-project example.com
```

Follow the DNS instructions printed by the CLI to complete setup.

## What's next

- [Full command reference](commands.md) -- every command, flag, and option
- [Claude Code plugin](claude-code-plugin.md) -- deploy from Claude Code with 10 focused tools
- [MCP server setup](mcp-setup.md) -- let AI assistants deploy for you
- [API client guide](api-client.md) -- build programmatic integrations
- [Contributing](contributing.md) -- help improve the CLI
