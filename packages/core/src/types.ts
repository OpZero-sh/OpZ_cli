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
    /** OAuth access token (`mat_...`) used as `Authorization: Bearer`. */
    token?: string
    /** OAuth refresh token (`mrt_...`) for the token family. */
    refreshToken?: string
    /** ISO timestamp when the access token expires. */
    expiresAt?: string
    /** OAuth scope granted to the token. */
    scope?: string
    /** OAuth client_id the token family was issued to. */
    clientId?: string
  }
  defaults: {
    target: DeployTarget
    baseUrl: string
  }
  /** AuthKit OAuth provider settings (RFC 8628 device-code login). */
  authkit?: {
    /** Base URL of the AuthKit issuer, e.g. https://authkit.open0p.com */
    baseUrl?: string
    /** Cached dynamically-registered client_id for this CLI install. */
    clientId?: string
  }
}

/** RFC 8628 device authorization response (`/oauth/device/authorization`). */
export interface DeviceAuthorizationResponse {
  device_code: string
  user_code: string
  verification_uri: string
  verification_uri_complete?: string
  expires_in: number
  interval: number
}

/** OAuth token response from `/oauth/token` (device-code grant). */
export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}
