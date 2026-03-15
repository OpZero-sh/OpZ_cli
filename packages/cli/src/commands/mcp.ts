export async function mcp() {
  // Dynamic import to avoid loading MCP deps unless needed
  try {
    // @ts-expect-error — @opzero/mcp may not be built yet
    const { startServer } = await import('@opzero/mcp')
    await startServer()
  } catch {
    console.error('MCP server not available. Install @opzero/mcp:')
    console.error('  bun add @opzero/mcp')
    process.exit(1)
  }
}
