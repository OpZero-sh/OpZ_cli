export type DeployTarget = 'cloudflare' | 'netlify' | 'vercel'
export type DeployStatus = 'pending' | 'building' | 'ready' | 'error'
export type ProjectStatus = 'active' | 'archived' | 'deleted'
export type PostFormat = 'markdown' | 'html' | 'artifact'
export type PostStatus = 'draft' | 'published'

export interface Project {
  id: string
  name: string
  description?: string
  target: DeployTarget
  status: ProjectStatus
  subdomain?: string
  customDomain?: string
  siteUrl?: string
  createdAt: string
  updatedAt: string
  lastDeployAt?: string
  deployCount: number
}

export interface Deployment {
  id: string
  projectId: string
  projectName?: string
  status: DeployStatus
  statusDetail?: string
  url?: string
  files?: Record<string, string>
  filesCount?: number
  totalSizeBytes?: number
  errorMessage?: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name?: string
  plan?: string
}

export interface Usage {
  plan: string
  deploysUsed: number
  deploysLimit: number
  projectsUsed: number
  projectsLimit: number
}

export interface SystemStatus {
  user: User
  usage: Usage
  recentDeployments: Deployment[]
  activeProjects: number
}

export interface Template {
  name: string
  files: Record<string, string>
  description?: string
}

export interface DeployInput {
  name?: string
  target?: DeployTarget
  files: Record<string, string>
  projectId?: string
  force_new?: boolean
}

export interface QuickDeployInput {
  html: string
  name?: string
  target?: DeployTarget
  force_new?: boolean
}

export interface DeployArtifactInput {
  code: string
  name?: string
  title?: string
  dependencies?: Record<string, string>
  target?: DeployTarget
  force_new?: boolean
}

export interface DeployThemedInput {
  content: string
  title?: string
  theme?: 'dark' | 'light' | 'auto'
  name?: string
  style?: 'landing' | 'article' | 'dashboard'
  target?: DeployTarget
  force_new?: boolean
}

export interface DeployMarkdownInput {
  markdown: string
  title?: string
  theme?: 'dark' | 'light' | 'auto'
  name?: string
  target?: DeployTarget
  force_new?: boolean
}

export interface UpdateDeploymentInput {
  project_name?: string
  project_id?: string
  files: Record<string, string>
}

export interface CreateProjectInput {
  name: string
  description?: string
  target?: DeployTarget
}

export interface ListProjectsInput {
  status?: 'active' | 'archived' | 'deleted' | 'all'
  target?: DeployTarget
  name_contains?: string
  sort_by?: 'created' | 'last_deploy' | 'name'
  stale_days?: number
  limit?: number
}

export interface ListDeploymentsInput {
  projectId?: string
  limit?: number
}

export interface SetCustomDomainInput {
  project_id?: string
  name?: string
  domain?: string
}

export interface ToolResult {
  content: Array<{ type: string; text: string }>
  isError?: boolean
}

export interface AuthConfig {
  auth: {
    method: 'api-key' | 'oauth'
    apiKey?: string
    token?: string
  }
  defaults: {
    target: DeployTarget
    baseUrl: string
  }
}
