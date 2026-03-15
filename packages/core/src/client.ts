import { AuthManager } from './auth.js'
import type {
  DeployInput,
  QuickDeployInput,
  DeployArtifactInput,
  DeployThemedInput,
  DeployMarkdownInput,
  UpdateDeploymentInput,
  CreateProjectInput,
  ListProjectsInput,
  ListDeploymentsInput,
  SetCustomDomainInput,
  ToolResult,
} from './types.js'

function toArgs(obj: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj))
}

export class OpZeroClient {
  private baseUrl: string
  private credential: string

  constructor(opts?: { apiKey?: string; token?: string; baseUrl?: string }) {
    this.baseUrl = opts?.baseUrl || AuthManager.getBaseUrl()
    const creds =
      opts?.apiKey || opts?.token
        ? { apiKey: opts.apiKey, token: opts.token }
        : AuthManager.getCredentials()
    this.credential = creds.token || creds.apiKey || ''
  }

  private async callTool(
    name: string,
    args: Record<string, unknown> = {},
  ): Promise<ToolResult> {
    if (!this.credential) {
      throw new Error('Not authenticated. Run `opzero login` first.')
    }
    const res = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.credential}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: crypto.randomUUID(),
        method: 'tools/call',
        params: { name, arguments: args },
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`API error ${res.status}: ${text || res.statusText}`)
    }
    const data = (await res.json()) as any
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error))
    }
    return data.result as ToolResult
  }

  private parseResult<T>(result: ToolResult): T {
    const text = result.content?.[0]?.text || '{}'
    try {
      return JSON.parse(text) as T
    } catch {
      return text as unknown as T
    }
  }

  // ============= Deploy =============

  async deploy(input: DeployInput): Promise<string> {
    const result = await this.callTool(
      'deploy_website',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  async quickDeploy(input: QuickDeployInput): Promise<string> {
    const result = await this.callTool(
      'quick_deploy',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  async deployArtifact(input: DeployArtifactInput): Promise<string> {
    const result = await this.callTool(
      'deploy_artifact',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  async deployThemed(input: DeployThemedInput): Promise<string> {
    const result = await this.callTool(
      'deploy_themed',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  async deployMarkdown(input: DeployMarkdownInput): Promise<string> {
    const result = await this.callTool(
      'deploy_markdown',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  // ============= Projects =============

  async listProjects(input?: ListProjectsInput): Promise<string> {
    const result = await this.callTool(
      'list_projects',
      toArgs(input || {}),
    )
    return result.content?.[0]?.text || ''
  }

  async createProject(input: CreateProjectInput): Promise<string> {
    const result = await this.callTool(
      'create_project',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  async deleteProject(opts: {
    name?: string
    project_id?: string
  }): Promise<string> {
    const result = await this.callTool('project_delete', opts)
    return result.content?.[0]?.text || ''
  }

  async archiveProject(opts: {
    name?: string
    project_id?: string
    action?: 'archive' | 'unarchive'
  }): Promise<string> {
    const result = await this.callTool('project_archive', opts)
    return result.content?.[0]?.text || ''
  }

  async cleanupProjects(): Promise<string> {
    const result = await this.callTool('project_cleanup')
    return result.content?.[0]?.text || ''
  }

  // ============= Deployments =============

  async listDeployments(input?: ListDeploymentsInput): Promise<string> {
    const result = await this.callTool(
      'list_deployments',
      toArgs(input || {}),
    )
    return result.content?.[0]?.text || ''
  }

  async getDeployment(deploymentId: string): Promise<string> {
    const result = await this.callTool('get_deployment', { deploymentId })
    return result.content?.[0]?.text || ''
  }

  async deleteDeployment(deploymentId: string): Promise<string> {
    const result = await this.callTool('delete_deployment', {
      deployment_id: deploymentId,
    })
    return result.content?.[0]?.text || ''
  }

  async redeploy(opts: {
    name?: string
    project_id?: string
    deployment_id?: string
  }): Promise<string> {
    const result = await this.callTool('redeploy', opts)
    return result.content?.[0]?.text || ''
  }

  async rollback(deploymentId: string): Promise<string> {
    const result = await this.callTool('rollback_deployment', {
      deployment_id: deploymentId,
    })
    return result.content?.[0]?.text || ''
  }

  async updateDeployment(input: UpdateDeploymentInput): Promise<string> {
    const result = await this.callTool(
      'update_deployment',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  async getBuildLogs(opts: {
    deployment_id?: string
    project_name?: string
  }): Promise<string> {
    const result = await this.callTool('get_build_logs', opts)
    return result.content?.[0]?.text || ''
  }

  // ============= Domains =============

  async setCustomDomain(input: SetCustomDomainInput): Promise<string> {
    const result = await this.callTool(
      'set_custom_domain',
      toArgs(input),
    )
    return result.content?.[0]?.text || ''
  }

  // ============= Templates =============

  async getTemplate(template: string): Promise<string> {
    const result = await this.callTool('get_template', { template })
    return result.content?.[0]?.text || ''
  }

  // ============= System =============

  async getSystemStatus(): Promise<string> {
    const result = await this.callTool('get_system_status')
    return result.content?.[0]?.text || ''
  }

  async askAgent(question: string, includeContext = true): Promise<string> {
    const result = await this.callTool('ask_agent', {
      question,
      include_context: includeContext,
    })
    return result.content?.[0]?.text || ''
  }

  async help(): Promise<string> {
    const result = await this.callTool('help')
    return result.content?.[0]?.text || ''
  }

  // ============= Raw tool call (for MCP pass-through) =============

  async rawToolCall(
    toolName: string,
    args: Record<string, unknown> = {},
  ): Promise<ToolResult> {
    return this.callTool(toolName, args)
  }
}
