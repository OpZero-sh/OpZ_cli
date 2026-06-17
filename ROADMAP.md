# OpZ_cli Roadmap

**OpZ_cli** (repo dir `cli`, GitHub remote `OpZero-sh/OpZ_cli`) is the command-line entry point to the OpZero platform. It's a Bun monorepo publishing three packages — `opzero` (the CLI), `@opzero/mcp` (the 26-tool MCP server + 10-tool Claude Code plugin), and `@opzero/core` (the API client/auth layer) — so a user can log in, deploy to Cloudflare / Netlify / Vercel, manage projects, and wire OpZero into Claude Code from one binary. It is the local-machine surface that the rest of the platform (hub, deploy MCP, MCPAuthKit) backs.

→ Part of the [OpZero platform roadmap](https://github.com/OpZero-sh/.github/blob/main/ROADMAP.md). This file scopes that vision to the CLI.

> Status legend: ✅ shipped · 🟡 in progress · ⚪ planned
> Per the org roadmap, the CLI's near-term focus (shared with skillz): **`opzero setup` multi-agent detection; deploy + orchestrate playbooks.**

---

## Near-term

### Deploy is the mature core (Phase 3 foundation) ✅
- ✅ `opzero deploy [dir]` ships static dirs; `--artifact` (React `.tsx/.jsx`), `--markdown`, and `--themed` cover single-file flows.
- ✅ `--target cloudflare|netlify|vercel` selects provider; `projects`, `deployments`, `rollback`, `redeploy`, `logs`, `domains set`, `open`, `status` round out the lifecycle.
- ✅ `opzero mcp` serves the full 26-tool MCP server; `@opzero/mcp --claude-code` exposes the focused 10-tool plugin.

### Setup → multi-agent detection (Phase 4) 🟡
- ✅ `opzero setup claude-code` auto-detects the `claude` CLI, resolves the best server binary (`opzero-claude-code` → `opzero-mcp --claude-code` → `npx @opzero/mcp`), and merges config into `~/.claude/settings.json`.
- ⚪ Generalize `opzero setup` to **detect/configure multiple agent backends** (Codex and others) — today it is Claude-Code-only. Maps to org Phase 4 ("Extend `codez setup` to detect/configure multiple agent backends").
- ⚪ Emit a backend-agnostic MCP config block so any detected agent can mount the OpZero connector.

### Headless login via MCPAuthKit (Phase 2) 🟡
- ✅ `opzero login --api-key` (and env `OPZERO_API_KEY`) authenticates; creds stored at `~/.opzero/config.json`, sent as `Bearer` to the OpZero API.
- 🟡 `opzero login --browser` / `whoami` exist but the OAuth path is **stubbed** ("Browser OAuth coming soon"); `auth.ts` already models an `oauth` method.
- ⚪ Wire **device-code / MCPAuthKit login** so headless setup and containers complete login without a local browser or hand-minted tokens (org Phase 2 device-code grant).

### Orchestrate playbooks (Phase 3) ⚪
- ⚪ Add an **`opzero orchestrate`** surface (no such command exists yet) plus deploy playbooks that chain build → ship in one authenticated session.
- ⚪ Thread provider/target selection through the playbook and capture deploy URLs back to the caller.

---

## Later

- ⚪ **Phase 1 — One domain, one login:** point the CLI's API/auth base at the unified `opzero.sh` origin (today `OPZERO_API_URL` defaults to `https://opzero.sh`); consume MCPAuthKit as the single OAuth.
- ⚪ **Phase 2 — See/drive machines:** add hub-aware commands (list machines, start/abort/resume sessions, wake) so the CLI mirrors the hosted operator console headlessly.
- ⚪ **Phase 4 — Any agent:** once the agent-session adapter interface lands upstream, surface mixed Claude + Codex backends through `opzero setup` and orchestrate commands.
- ⚪ **Phase 5 — Product:** scoped/team tokens, `--json` audit-friendly output across all commands, usage/metering surfacing.

---

## Notes

- Runtime is **Bun**; quality gate is `bun run typecheck && bun run build` (no test files yet). Releases auto-publish `opzero`, `@opzero/mcp`, `@opzero/core` to npm on `v*` tags.
- Auth env: `OPZERO_API_KEY` (overrides config) → `~/.opzero/config.json`. MCP server reads the same config headlessly.
- Roadmap changes here should stay consistent with the [org roadmap](https://github.com/OpZero-sh/.github/blob/main/ROADMAP.md); the org board is the org team's responsibility, not this repo's.
