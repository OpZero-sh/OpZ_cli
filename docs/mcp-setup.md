# MCP Server Setup

The OpZero MCP server exposes 26 tools that let AI assistants deploy websites, manage projects, and interact with the OpZero platform.

## What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) is an open standard that lets AI assistants use external tools. When you configure the OpZero MCP server, your AI assistant can deploy sites, manage projects, and check deployment status — all through natural language.

## Setup

### Claude Code

Add to `~/.claude/claude_desktop_config.json` or your project's `.mcp.json`:

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

If you don't have the CLI installed globally, use npx:

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

### Cursor

Open Cursor settings, navigate to the MCP section, and add a new server:

- **Name:** opzero
- **Command:** `opzero mcp`

Or edit `~/.cursor/mcp.json`:

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

### Windsurf

Add to your Windsurf MCP configuration:

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

### VS Code (GitHub Copilot)

Add to your VS Code `settings.json`:

```json
{
  "github.copilot.chat.mcpServers": {
    "opzero": {
      "command": "npx",
      "args": ["@opzero/mcp"]
    }
  }
}
```

## Authentication

The MCP server uses the same credentials as the CLI. Run `opzero login` before starting the server, or set the `OPZERO_API_KEY` environment variable:

```json
{
  "mcpServers": {
    "opzero": {
      "command": "opzero",
      "args": ["mcp"],
      "env": {
        "OPZERO_API_KEY": "oz_sk_..."
      }
    }
  }
}
```

## Available Tools

### Deploy (6 tools)

| Tool | Description |
|------|-------------|
| `quick_deploy` | Deploy files with minimal configuration |
| `deploy_website` | Deploy a full website directory |
| `deploy_artifact` | Deploy a React component |
| `deploy_themed` | Deploy with OpZero brand theme |
| `deploy_markdown` | Deploy markdown as a styled page |
| `update_deployment` | Update an existing deployment |

### Projects (5 tools)

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects |
| `create_project` | Create a new project |
| `project_delete` | Delete a project |
| `project_archive` | Archive a project |
| `project_cleanup` | Find stale/duplicate projects |

### Deployments (5 tools)

| Tool | Description |
|------|-------------|
| `get_deployment` | Get deployment details |
| `list_deployments` | List deployment history |
| `redeploy` | Redeploy the latest version |
| `rollback_deployment` | Roll back to a previous deployment |
| `get_build_logs` | View build logs |
| `delete_deployment` | Delete a deployment |

### Templates & Domains (2 tools)

| Tool | Description |
|------|-------------|
| `get_template` | Get template details |
| `set_custom_domain` | Set a custom domain on a project |

### System (3 tools)

| Tool | Description |
|------|-------------|
| `help` | Get help with OpZero features |
| `ask_agent` | Ask the OpZero agent a question |
| `get_system_status` | Check platform status |

### Local-only (5 tools)

These tools only work when the MCP server has access to the local filesystem:

| Tool | Description |
|------|-------------|
| `deploy_local_dir` | Deploy a local directory |
| `init_project` | Scaffold a project from a template |
| `open_project` | Open a project URL in the browser |
| `whoami` | Show current user info |

## Standalone Package

If you only need the MCP server (without the full CLI), install the standalone package:

```bash
npm install -g @opzero/mcp
```

Run it directly:

```bash
opzero-mcp
```

Or use it in MCP configuration:

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
