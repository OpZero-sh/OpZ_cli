# Claude Code Plugin

The OpZero Claude Code plugin provides a streamlined deployment experience within [Claude Code](https://claude.ai/code). It surfaces 10 focused tools designed around the natural "deploy this project" workflow, replacing the full 26-tool MCP server with something purpose-built for Claude Code.

## Install

### Option 1: Setup Command (Recommended)

```bash
opzero setup claude-code
```

This auto-detects your installation method and writes the correct configuration to `~/.claude/settings.json`.

### Option 2: Curl Install

```bash
# Install the MCP server (includes the Claude Code plugin)
curl -fsSL https://opzero.sh/install-mcp.sh | sh
```

Then run the setup command:

```bash
opzero setup claude-code
```

### Option 3: Manual Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "opzero": {
      "command": "npx",
      "args": ["@opzero/mcp", "--claude-code"],
      "env": {}
    }
  }
}
```

## Prerequisites

- **OpZero account** -- sign up at [opzero.sh](https://opzero.sh)
- **Authentication** -- run `opzero login` or set the `OPZERO_API_KEY` environment variable

## How It Works

When you tell Claude Code to deploy a project, the plugin:

1. **Reads the project directory** -- scans for deployable files, skipping `node_modules`, dotfiles, and binaries
2. **Auto-detects the framework** -- checks for Next.js, Vite + React, React ESM, static HTML, or markdown
3. **Deploys via the right strategy** -- calls the appropriate OpZero API method based on the detected type
4. **Returns the live URL** -- along with project name, deployment ID, file count, and target provider

### Framework Detection

| Indicator | Detected Framework | Strategy |
|---|---|---|
| `next.config.js` / `next.config.ts` | Next.js | Build output or Vercel target |
| `vite.config.ts` + React deps | Vite + React | Deploy `dist/` or source |
| `package.json` with `react` dep only | React ESM | Artifact deployment |
| `index.html` | Static HTML | Direct file upload |
| Only `.md` / `.mdx` files | Markdown | Markdown-to-page conversion |
| Fallback | Static files | Upload all text files as-is |

## Tools Reference

### `opzero_deploy`

Deploy a project directory to production with framework auto-detection.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | string | yes | Absolute path to project directory |
| `name` | string | no | Project name (defaults to directory name) |
| `target` | `cloudflare`, `netlify`, `vercel` | no | Hosting provider |
| `force_new` | boolean | no | Force create a new project |

### `opzero_preview`

Create a preview deployment with a unique URL for reviewing changes before production.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | string | yes | Absolute path to project directory |
| `name` | string | no | Project name |
| `target` | `cloudflare`, `netlify`, `vercel` | no | Hosting provider |

### `opzero_status`

Check deployment status, account overview, and usage statistics.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Check a specific project |
| `deployment_id` | string | no | Check a specific deployment |

### `opzero_projects`

List and search projects.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | `active`, `archived`, `all` | no | Filter by status |
| `search` | string | no | Search by name |
| `limit` | number | no | Max results (default: 20) |

### `opzero_logs`

View build and deployment logs. Useful for diagnosing failures.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `deployment_id` | string | no | Specific deployment ID |

### `opzero_domains`

View or set custom domains for a project.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `project_id` | string | no | Project UUID |
| `domain` | string | no | Domain to set (omit to view current) |

### `opzero_rollback`

Rollback a project to a previous deployment.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `deployment_id` | string | no | Specific deployment to rollback to |

### `opzero_init`

Initialize a new project from a template.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `template` | `landing`, `portfolio`, `blog`, `static`, `vite-react`, `react-esm`, `opzero` | yes | Template type |
| `path` | string | yes | Directory to scaffold into |

### `opzero_update`

Incrementally update specific files in a deployed project without re-uploading everything.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `project_id` | string | no | Project UUID |
| `files` | `Record<string, string>` | yes | File path to content mapping |

### `opzero_whoami`

Show current authentication status, account info, plan, and usage. No parameters.

## Example Interactions

### Deploy a Project

```
User: Deploy this project to production

Claude: I'll deploy your project using OpZero.
[Calls opzero_deploy with path=/Users/you/my-site]

Your site is live!
- URL: https://my-site.opzero.sh
- Framework: Vite + React
- Files: 12 deployed
- Target: Cloudflare Pages
```

### Preview Before Going Live

```
User: I made some changes. Can I preview before deploying?

Claude: I'll create a preview deployment.
[Calls opzero_preview with path=/Users/you/my-site]

Preview ready:
- URL: https://preview-abc123.my-site.opzero.sh
- Changes: 2 files modified

Let me know if you want to promote this to production.
```

### Diagnose and Rollback

```
User: Something's wrong with my-site. Roll it back.

Claude: Let me check the logs first.
[Calls opzero_logs with project_name="my-site"]

I see a build error in the latest deployment. Rolling back.
[Calls opzero_rollback with project_name="my-site"]

Done! Rolled back to the previous working version.
```

## Plugin vs. Full MCP Server

The plugin (`--claude-code` flag or `opzero-claude-code` binary) is recommended for Claude Code. The full MCP server (`opzero mcp` or `opzero-mcp`) is better for Cursor, Windsurf, VS Code, and other generic MCP clients that benefit from granular, low-level tools.

Both servers share the same authentication and `@opzero/core` client library.

## Environment Variables

| Variable | Description |
|---|---|
| `OPZERO_API_KEY` | API key (overrides config file) |
| `OPZERO_API_URL` | Custom API base URL |
| `OPZERO_DEFAULT_TARGET` | Default deploy target (cloudflare, netlify, vercel) |
