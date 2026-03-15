# API Client

`@opzero/core` is the TypeScript client library for the OpZero API. Use it to build custom integrations, CI/CD pipelines, or your own deployment tools.

## Install

```bash
npm install @opzero/core
```

```bash
bun add @opzero/core
```

## Initialize

```typescript
import { OpZeroClient } from '@opzero/core'

const client = new OpZeroClient({
  apiKey: process.env.OPZERO_API_KEY,
})
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | Your OpZero API key (required) |
| `baseUrl` | `string` | `https://opzero.sh/api` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |

## Deploying

### Deploy files

```typescript
const deployment = await client.deploy({
  name: 'my-site',
  files: {
    'index.html': '<h1>Hello World</h1>',
    'style.css': 'body { font-family: sans-serif; }',
  },
})

console.log(deployment.url)    // https://my-site.opzero.sh
console.log(deployment.id)     // dep_abc123
```

### Deploy a React component

```typescript
const deployment = await client.deployArtifact({
  name: 'my-app',
  code: `
    export default function App() {
      return <h1>Hello from React</h1>
    }
  `,
  filename: 'App.tsx',
})
```

### Deploy markdown

```typescript
const deployment = await client.deployMarkdown({
  name: 'my-docs',
  content: '# Hello\n\nThis is a markdown page.',
})
```

### Deploy with theme

```typescript
const deployment = await client.deployThemed({
  name: 'landing',
  html: '<h1>Welcome</h1><p>My landing page</p>',
})
```

## Projects

### List projects

```typescript
const projects = await client.listProjects()

for (const project of projects) {
  console.log(`${project.name} — ${project.url}`)
}
```

### Create a project

```typescript
const project = await client.createProject({
  name: 'new-site',
})
```

### Delete a project

```typescript
await client.deleteProject('old-site')
```

### Archive a project

```typescript
await client.archiveProject('inactive-site')
```

### Cleanup stale projects

```typescript
const stale = await client.cleanupProjects({
  dryRun: true,
  staleDays: 30,
})

console.log(`Found ${stale.length} stale projects`)
```

## Deployments

### List deployments

```typescript
const deployments = await client.listDeployments('my-site')

for (const dep of deployments) {
  console.log(`${dep.id} — ${dep.status} — ${dep.createdAt}`)
}
```

### Get deployment details

```typescript
const deployment = await client.getDeployment('dep_abc123')
```

### Rollback

```typescript
await client.rollback('dep_abc123')
```

### Redeploy

```typescript
const deployment = await client.redeploy('my-site')
```

### Get build logs

```typescript
const logs = await client.getBuildLogs('dep_abc123')
console.log(logs)
```

### Delete a deployment

```typescript
await client.deleteDeployment('dep_abc123')
```

## Domains

### Set a custom domain

```typescript
const result = await client.setCustomDomain('my-site', 'example.com')

console.log(result.dnsRecords) // DNS records to configure
```

## Templates

### Get a template

```typescript
const template = await client.getTemplate('react')
console.log(template.name, template.description)
```

## System

### Check platform status

```typescript
const status = await client.getSystemStatus()
console.log(status.operational) // true
```

## Error Handling

All methods throw `OpZeroError` on failure:

```typescript
import { OpZeroClient, OpZeroError } from '@opzero/core'

try {
  await client.deploy({ name: 'my-site', files: {} })
} catch (error) {
  if (error instanceof OpZeroError) {
    console.error(`API error: ${error.message} (${error.code})`)
  }
}
```

## TypeScript Types

The package exports all request and response types:

```typescript
import type {
  DeployOptions,
  Deployment,
  Project,
  OpZeroClientConfig,
} from '@opzero/core'
```
