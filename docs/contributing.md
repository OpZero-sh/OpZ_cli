# Contributing

Thanks for your interest in improving the OpZero CLI. This guide covers everything you need to get started.

## Prerequisites

- [Bun](https://bun.sh) (latest)
- [Node.js](https://nodejs.org) 18+ (for npm publishing)
- An OpZero account (for testing deployments)

## Setup

```bash
# Fork and clone
git clone https://github.com/<your-username>/cli.git
cd cli

# Install dependencies
bun install

# Build all packages
bun run build
```

## Project Structure

This is a Bun monorepo with three packages:

```
packages/
  core/       # @opzero/core — API client library
  cli/        # opzero — CLI tool
  mcp/        # @opzero/mcp — MCP server for AI tools
```

The CLI and MCP packages depend on `@opzero/core`.

## Development Workflow

### Run the CLI locally

```bash
bun run packages/cli/src/index.tsx -- deploy --help
```

### Build all packages

```bash
bun run build
```

### Run tests

```bash
bun run test
```

### Type check

```bash
bun run typecheck
```

## Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes.** Keep commits focused — one logical change per commit.

3. **Test your changes:**
   ```bash
   bun run typecheck
   bun run build
   bun run test
   ```

4. **Push and open a PR:**
   ```bash
   git push origin feat/my-feature
   ```
   Open a pull request against `main` on GitHub.

## Code Style

- TypeScript throughout
- Use `import`/`export`, not `require`
- Prefer named exports over default exports
- Use descriptive variable names
- Keep functions small and focused

Formatting is handled automatically. Just write clean code and the CI will catch any issues.

## Pull Request Guidelines

- **Keep PRs small.** One feature or fix per PR makes review faster.
- **Write a clear description.** Explain what changed and why.
- **Add tests** for new functionality when possible.
- **Ensure CI passes** before requesting review.

## Package-Specific Notes

### `@opzero/core`

The API client is the foundation. Changes here affect both the CLI and MCP packages.

- All API methods go in `packages/core/src/`
- Export types alongside implementations
- Every public method should have JSDoc comments

### `opzero` (CLI)

- Commands live in `packages/cli/src/`
- Use [Commander](https://github.com/tj/commander.js) patterns for consistency
- Support `--json` output for all list/status commands
- Test commands manually before submitting

### `@opzero/mcp`

- Tools are defined in `packages/mcp/src/`
- Each tool maps to an `@opzero/core` method
- Follow the [MCP specification](https://modelcontextprotocol.io) for tool definitions

## Reporting Issues

Open an issue on GitHub with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- CLI version (`opzero --version`)
- OS and Node/Bun version

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
