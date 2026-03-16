# Command Reference

Complete reference for every OpZero CLI command.

## Global Flags

These flags work with any command:

| Flag | Description |
|------|-------------|
| `--help, -h` | Show help for the command |
| `--version, -v` | Print CLI version |
| `--json` | Output results as JSON (useful for scripting) |
| `--target <provider>` | Deployment target: `cloudflare`, `netlify`, or `vercel` |

---

## Authentication

### `opzero login`

Authenticate with OpZero.

```bash
# Interactive — prompts for API key or opens browser
opzero login

# Non-interactive — pass key directly
opzero login --api-key oz_sk_...
```

**Flags:**
- `--api-key <key>` — Authenticate with an API key directly
- `--browser` — Force browser-based OAuth flow

Credentials are stored in `~/.opzero/config.json`.

### `opzero logout`

Clear stored credentials.

```bash
opzero logout
```

### `opzero whoami`

Show the authenticated user, current plan, and usage stats.

```bash
opzero whoami
opzero whoami --json
```

---

## Deploying

### `opzero deploy [dir]`

Deploy a directory of static files.

```bash
opzero deploy ./dist --name my-site
opzero deploy . --name my-site --target vercel
```

**Arguments:**
- `[dir]` — Directory to deploy (default: current directory)

**Flags:**
- `--name <name>` — Project name (required for first deploy)
- `--target <provider>` — `cloudflare`, `netlify`, or `vercel`
- `--artifact <file>` — Deploy a React component file instead of a directory
- `--markdown <file>` — Deploy a markdown file as a styled page
- `--themed <file>` — Deploy an HTML file with the OpZero brand theme

### `opzero deploy --artifact <file>`

Deploy a single React component (`.tsx`, `.jsx`) as a standalone page. The component is bundled server-side.

```bash
opzero deploy --artifact ./Dashboard.tsx --name dashboard
```

### `opzero deploy --markdown <file>`

Convert a markdown file to a styled HTML page and deploy it.

```bash
opzero deploy --markdown ./post.md --name blog-post
```

### `opzero deploy --themed <file>`

Deploy HTML content wrapped in the OpZero brand theme.

```bash
opzero deploy --themed ./landing.html --name landing-page
```

---

## Projects

### `opzero projects`

List all projects in your account.

```bash
opzero projects
opzero projects --json
```

### `opzero projects create <name>`

Create a new project.

```bash
opzero projects create my-new-site
```

### `opzero projects delete <name>`

Permanently delete a project and all its deployments.

```bash
opzero projects delete old-site
```

You will be prompted for confirmation unless `--force` is passed.

**Flags:**
- `--force` — Skip confirmation prompt

### `opzero projects archive <name>`

Archive a project. Archived projects are hidden from listings but can be restored.

```bash
opzero projects archive inactive-site
```

### `opzero projects cleanup`

Find stale, duplicate, or unused projects and suggest cleanup actions.

```bash
opzero projects cleanup
opzero projects cleanup --dry-run
```

**Flags:**
- `--dry-run` — Show what would be cleaned up without making changes

---

## Deployments

### `opzero deployments [project]`

List deployment history for a project.

```bash
opzero deployments my-site
opzero deployments my-site --json
opzero deployments my-site --limit 5
```

**Flags:**
- `--limit <n>` — Number of deployments to show (default: 10)

### `opzero rollback <deployment-id>`

Roll back a project to a specific previous deployment.

```bash
opzero rollback dep_abc123
```

### `opzero redeploy <project>`

Redeploy the latest version of a project.

```bash
opzero redeploy my-site
```

### `opzero logs <deployment-id>`

View build logs for a deployment.

```bash
opzero logs dep_abc123
```

---

## Domains

### `opzero domains set <project> <domain>`

Attach a custom domain to a project.

```bash
opzero domains set my-site example.com
```

The CLI will print DNS records you need to configure with your domain registrar.

---

## Templates

### `opzero init [dir]`

Scaffold a new project from a template.

```bash
opzero init my-project
opzero init . --template react
```

**Flags:**
- `--template <name>` — Template to use (prompted if omitted)

### `opzero templates`

List available project templates.

```bash
opzero templates
opzero templates --json
```

---

## System

### `opzero status`

Show OpZero platform status and your account usage.

```bash
opzero status
```

### `opzero open <project>`

Open a project's live URL in your default browser.

```bash
opzero open my-site
```

### `opzero mcp`

Start the MCP (Model Context Protocol) server. This is typically invoked by AI tools, not run manually.

```bash
opzero mcp
```

See the [MCP setup guide](mcp-setup.md) for configuration details.
