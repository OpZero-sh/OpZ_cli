# OpZero Claude Code Plugin — Design Document

## Overview

The OpZero Claude Code plugin provides a polished deployment experience within Claude Code. Rather than exposing all 26 raw MCP tools, it surfaces a focused set of ~10 high-level tools optimized for the "deploy this project" workflow that Claude Code users expect.

The plugin ships as a second entry point in the `@opzero/mcp` package, reusing the existing `@opzero/core` client and auth infrastructure.

---

## a) Plugin Architecture

### How It Integrates with Claude Code

Claude Code connects to plugins via MCP servers configured in `~/.claude/settings.json`. The plugin runs as a stdio-based MCP server, identical to the existing `opzero-mcp` binary but with a curated tool set and richer tool descriptions.

```jsonc
// ~/.claude/settings.json
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

Alternatively, if installed globally or via bun:

```jsonc
{
  "mcpServers": {
    "opzero": {
      "command": "opzero-claude-code",
      "env": {}
    }
  }
}
```

### Authentication Flow

1. **Primary:** Read API key from `~/.opzero/config.json` (set via `opzero login`).
2. **Fallback:** Read `OPZERO_API_KEY` environment variable.
3. **On failure:** Return a clear error message directing the user to run `opzero login` or set the env var.

No interactive login happens inside the MCP server — it runs headless over stdio.

### What Makes This Different from the Raw MCP Tools

| Raw MCP (`opzero-mcp`) | Claude Code Plugin (`opzero-claude-code`) |
|---|---|
| 26 tools, flat list | 10 focused tools, workflow-oriented |
| Generic descriptions | Rich descriptions with Claude Code hints |
| No project auto-detection | Auto-detects framework from `cwd` |
| No system prompt | Includes instructions that teach Claude how to deploy |
| Separate deploy types (artifact, themed, markdown, website) | Single `opzero_deploy` tool that picks the right strategy |
| No `cwd` awareness | Accepts `path` defaulting to process working directory |

---

## b) Optimized Tool Set for Claude Code

### 1. `opzero_deploy`

**Deploy the current project or specific files to production.**

Unified entry point that replaces `quick_deploy`, `deploy_website`, `deploy_artifact`, `deploy_themed`, `deploy_markdown`, and `deploy_local_dir`.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | string | no | Absolute path to project directory (defaults to cwd) |
| `name` | string | no | Project name (auto-generated if omitted) |
| `target` | `cloudflare \| netlify \| vercel` | no | Hosting provider (defaults to user preference) |
| `force_new` | boolean | no | Force create a new project even if name matches |

Behavior:
- Reads files from the directory
- Auto-detects project type (see Smart Deployment Flow below)
- Deploys via the appropriate core method
- Returns the live URL

### 2. `opzero_preview`

**Create a preview deployment without promoting to production.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | string | no | Absolute path to project directory |
| `name` | string | no | Project name |
| `target` | `cloudflare \| netlify \| vercel` | no | Hosting provider |

Deploys the project with a unique preview subdomain. Useful for reviewing changes before going live.

### 3. `opzero_status`

**Check deployment status and account overview.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Check a specific project |
| `deployment_id` | string | no | Check a specific deployment |

Returns: current user plan, usage stats, recent deployments, and optionally detailed status for a specific project or deployment.

### 4. `opzero_projects`

**List and search projects.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | `active \| archived \| all` | no | Filter by status |
| `search` | string | no | Search by name |
| `limit` | number | no | Max results (default 20) |

### 5. `opzero_logs`

**View build and deployment logs.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `deployment_id` | string | no | Specific deployment ID |

Returns build logs for the most recent deployment of a project, or for a specific deployment ID.

### 6. `opzero_domains`

**Manage custom domains for a project.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `project_id` | string | no | Project UUID |
| `domain` | string | no | Domain to set (omit to view current) |

### 7. `opzero_rollback`

**Rollback a project to a previous deployment.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `deployment_id` | string | no | Specific deployment to rollback to |

If no deployment_id is given, lists recent deployments for the project and rolls back to the previous one.

### 8. `opzero_init`

**Initialize an OpZero project from a template.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `template` | `landing \| portfolio \| blog \| static \| vite-react \| react-esm \| opzero` | yes | Template type |
| `path` | string | yes | Directory to scaffold into |

### 9. `opzero_update`

**Incrementally update specific files in a deployed project.**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_name` | string | no | Project name |
| `project_id` | string | no | Project UUID |
| `files` | `Record<string, string>` | yes | File path to content mapping |

Merges the given files into the existing deployment without re-uploading everything.

### 10. `opzero_whoami`

**Show current authentication status and account info.**

No parameters. Returns auth method, email, plan, and usage.

---

## c) Smart Deployment Flow

When a user says "deploy this project", the `opzero_deploy` tool executes the following:

### Step 1: Read Project Directory

Read all deployable files from the given `path` (or cwd). Skip `node_modules`, dotfiles, and binary files.

### Step 2: Auto-Detect Project Type

Check for framework indicators:

| Indicator | Detected Type | Deploy Strategy |
|---|---|---|
| `next.config.js` / `next.config.ts` | Next.js | Deploy via Vercel target or build output |
| `vite.config.ts` + React deps | Vite React | Deploy `dist/` if built, or source files |
| `package.json` with `react` dep only | React ESM | Use `deploy_artifact` path |
| `index.html` only | Static HTML | Use `deploy_website` |
| `*.md` / `*.mdx` files only | Markdown | Use `deploy_markdown` |
| `package.json` with build script | Generic build project | Deploy source files |
| Fallback | Static files | Deploy all text files as-is |

### Step 3: Check OpZero State

- Is the user authenticated? If not, return error with instructions.
- Does a project with this name already exist? If yes, update it. If no, create it.

### Step 4: Deploy

Call the appropriate `OpZeroClient` method with the detected files and configuration.

### Step 5: Return Result

Return a structured response containing:
- Live URL
- Project name and ID
- Deployment ID
- File count and total size
- Deploy target used

### Error Handling

- **Not authenticated:** Clear message with `opzero login` instructions.
- **No files found:** Suggest checking the path or running a build step first.
- **API error:** Surface the error message and suggest checking `opzero status`.
- **Rate limit:** Show usage stats and suggest upgrading.

---

## d) Configuration

### Claude Code settings.json

After running `opzero setup claude-code`, the following is merged into `~/.claude/settings.json`:

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

### Environment Variables

| Variable | Description |
|---|---|
| `OPZERO_API_KEY` | API key (overrides config file) |
| `OPZERO_API_URL` | Custom API base URL |
| `OPZERO_DEFAULT_TARGET` | Default deploy target (`cloudflare`, `netlify`, `vercel`) |

### Switching Deploy Targets

Users can switch the default target in three ways:

1. **Per-command:** Pass `target` parameter to any deploy tool.
2. **Config file:** Run `opzero login` and select a default target.
3. **Environment:** Set `OPZERO_DEFAULT_TARGET`.

---

## e) Example Interactions

### Example 1: Deploy Current Project

```
User: Deploy this project to production

Claude: I'll deploy your project using OpZero. Let me check the project
directory and detect the framework.

[Calls opzero_deploy with path=/Users/you/my-site]

Your site is live! Here are the details:

- URL: https://my-site.opzero.sh
- Project: my-site
- Deployment ID: dep_abc123
- Files: 12 files deployed
- Target: Cloudflare Pages

The site should be accessible within a few seconds.
```

### Example 2: Check Status and Rollback

```
User: Something's wrong with my-site. Roll it back.

Claude: Let me check the deployment status first.

[Calls opzero_logs with project_name="my-site"]

I can see the latest deployment had a build error. Let me rollback to the
previous working version.

[Calls opzero_rollback with project_name="my-site"]

Done! Rolled back my-site to deployment dep_xyz789 (deployed 2 hours ago).
Your site at https://my-site.opzero.sh is now serving the previous version.
```

### Example 3: Set Up Custom Domain

```
User: I want to use example.com for my-site

Claude: I'll configure the custom domain for your project.

[Calls opzero_domains with project_name="my-site", domain="example.com"]

Custom domain configured! To complete setup:

1. Add a CNAME record pointing example.com to my-site.opzero.sh
2. Wait for DNS propagation (usually 5-30 minutes)
3. SSL will be provisioned automatically

Your site will be accessible at both:
- https://example.com
- https://my-site.opzero.sh
```

### Example 4: Create and Deploy a New Project

```
User: Create a landing page for my startup and deploy it

Claude: I'll scaffold a landing page project and deploy it for you.

[Calls opzero_init with template="landing", path="/Users/you/startup-landing"]

Template scaffolded with 3 files. Now let me deploy it.

[Calls opzero_deploy with path="/Users/you/startup-landing", name="startup-landing"]

Your landing page is live!

- URL: https://startup-landing.opzero.sh
- Template: Landing Page
- Files: index.html, styles.css, script.js

I can customize the content, colors, or layout if you'd like.
```

### Example 5: Preview Before Going Live

```
User: I made some changes to the homepage. Can I preview before deploying?

Claude: I'll create a preview deployment so you can review the changes.

[Calls opzero_preview with path="/Users/you/my-site"]

Preview is ready:

- Preview URL: https://preview-abc123.my-site.opzero.sh
- Changes: 2 files modified (index.html, styles.css)

Take a look and let me know if you want to promote this to production.
```

---

## Implementation Notes

- The plugin entry point is `packages/mcp/src/claude-code-plugin.ts`.
- It reuses `@opzero/core` (OpZeroClient, AuthManager) — no duplicated logic.
- The `bin` field in `package.json` gets a second entry: `"opzero-claude-code"`.
- The setup command lives at `packages/cli/src/commands/setup.ts` and is registered in the CLI command index.
- The MCP server includes a system-level description (via `McpServer` instructions field) that teaches Claude how to use OpZero effectively.
