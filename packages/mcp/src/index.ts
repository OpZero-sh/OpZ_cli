#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerTools } from './tools/index.js'

export async function startServer() {
  const server = new McpServer({
    name: 'opzero',
    version: '0.1.0',
  })

  registerTools(server)

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

// Auto-start if run directly
const isDirectRun =
  process.argv[1]?.includes('opzero-mcp') ||
  process.argv[1]?.endsWith('/mcp/src/index.ts') ||
  process.argv[1]?.endsWith('/mcp/dist/index.js')

if (isDirectRun) {
  startServer().catch((err) => {
    console.error('Failed to start MCP server:', err)
    process.exit(1)
  })
}
