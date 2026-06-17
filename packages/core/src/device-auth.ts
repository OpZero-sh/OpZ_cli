import { AuthManager } from './auth.js'
import type {
  DeviceAuthorizationResponse,
  TokenResponse,
} from './types.js'

const DEVICE_CODE_GRANT = 'urn:ietf:params:oauth:grant-type:device_code'

/** Scope requested for a CLI login — deploy + tool access against OpZero. */
const DEFAULT_SCOPE = 'mcp:tools mcp:deploy mcp:read mcp:write'

/** Fallback poll interval (seconds) if the server omits `interval`. */
const DEFAULT_POLL_INTERVAL = 5

/** Extra seconds added to the poll interval each time we get `slow_down`. */
const SLOW_DOWN_BACKOFF = 5

export class DeviceAuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'DeviceAuthError'
  }
}

/** Callbacks let the caller (CLI) drive UI without coupling core to a UI lib. */
export interface DeviceLoginHooks {
  /** Called once with the code + URL the user must visit to approve login. */
  onUserCode?: (info: {
    userCode: string
    verificationUri: string
    verificationUriComplete?: string
    expiresIn: number
  }) => void
  /** Called on each poll tick while waiting for approval. */
  onPoll?: () => void
}

export interface DeviceLoginOptions {
  /** AuthKit issuer base URL. Defaults to AuthManager.getAuthkitUrl(). */
  authkitUrl?: string
  /** OAuth client_id. Defaults to the cached/registered client. */
  clientId?: string
  /** Requested OAuth scope. */
  scope?: string
  hooks?: DeviceLoginHooks
}

export interface DeviceLoginResult {
  token: string
  refreshToken?: string
  expiresIn: number
  scope?: string
  clientId: string
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function parseError(res: Response): Promise<{ error?: string; error_description?: string }> {
  try {
    return (await res.json()) as { error?: string; error_description?: string }
  } catch {
    return {}
  }
}

/**
 * Ensure we have an OAuth client_id to use for the device flow. The AuthKit
 * `/oauth/device/authorization` endpoint rejects unknown clients, so on first
 * login we perform Dynamic Client Registration (RFC 7591) and cache the result.
 */
export async function ensureClientId(authkitUrl: string, override?: string): Promise<string> {
  const existing = override || AuthManager.getAuthkitClientId()
  if (existing) return existing

  const res = await fetch(`${authkitUrl}/oauth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_name: 'OpZero CLI',
      // Device-code is headless; AuthKit requires a non-empty redirect_uris
      // list on registration. Use the OOB sentinel — it is never redirected to.
      redirect_uris: ['urn:ietf:wg:oauth:2.0:oob'],
      grant_types: ['urn:ietf:params:oauth:grant-type:device_code', 'refresh_token'],
      token_endpoint_auth_method: 'none',
    }),
  })

  if (!res.ok) {
    const err = await parseError(res)
    throw new DeviceAuthError(
      `Client registration failed (${res.status}): ${err.error_description || err.error || res.statusText}`,
      err.error,
    )
  }

  const data = (await res.json()) as { client_id?: string }
  if (!data.client_id) {
    throw new DeviceAuthError('Client registration returned no client_id')
  }

  AuthManager.setAuthkitClientId(data.client_id)
  return data.client_id
}

/**
 * Drive the full RFC 8628 device authorization grant against AuthKit:
 *   1. Register/resolve a client_id.
 *   2. POST /oauth/device/authorization → user_code + verification URI.
 *   3. Surface the code to the user via hooks.
 *   4. Poll /oauth/token honoring slow_down / authorization_pending /
 *      expired_token / access_denied until tokens are issued.
 *
 * Returns the token family. Does NOT persist — callers decide when to store
 * (e.g. AuthManager.setOAuthTokens) so the flow stays side-effect free.
 */
export async function deviceLogin(
  options: DeviceLoginOptions = {},
): Promise<DeviceLoginResult> {
  const authkitUrl = (options.authkitUrl || AuthManager.getAuthkitUrl()).replace(/\/+$/, '')
  const scope = options.scope || DEFAULT_SCOPE
  const clientId = await ensureClientId(authkitUrl, options.clientId)

  // 1. Request a device + user code.
  const authRes = await fetch(`${authkitUrl}/oauth/device/authorization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, scope }),
  })

  if (!authRes.ok) {
    const err = await parseError(authRes)
    throw new DeviceAuthError(
      `Device authorization failed (${authRes.status}): ${err.error_description || err.error || authRes.statusText}`,
      err.error,
    )
  }

  const auth = (await authRes.json()) as DeviceAuthorizationResponse

  options.hooks?.onUserCode?.({
    userCode: auth.user_code,
    verificationUri: auth.verification_uri,
    verificationUriComplete: auth.verification_uri_complete,
    expiresIn: auth.expires_in,
  })

  // 2. Poll the token endpoint until approval, denial, or expiry.
  let intervalSeconds = auth.interval || DEFAULT_POLL_INTERVAL
  const deadline = Date.now() + auth.expires_in * 1000

  while (Date.now() < deadline) {
    await wait(intervalSeconds * 1000)
    options.hooks?.onPoll?.()

    const tokenRes = await fetch(`${authkitUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: DEVICE_CODE_GRANT,
        device_code: auth.device_code,
        client_id: clientId,
      }),
    })

    if (tokenRes.ok) {
      const tokens = (await tokenRes.json()) as TokenResponse
      return {
        token: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        scope: tokens.scope || scope,
        clientId,
      }
    }

    const err = await parseError(tokenRes)
    switch (err.error) {
      case 'authorization_pending':
        // Keep waiting at the current interval.
        break
      case 'slow_down':
        // RFC 8628: increase the poll interval and continue.
        intervalSeconds += SLOW_DOWN_BACKOFF
        break
      case 'access_denied':
        throw new DeviceAuthError('Login was denied in the browser.', err.error)
      case 'expired_token':
        throw new DeviceAuthError(
          'The login code expired before it was approved. Please try again.',
          err.error,
        )
      default:
        throw new DeviceAuthError(
          `Token exchange failed (${tokenRes.status}): ${err.error_description || err.error || tokenRes.statusText}`,
          err.error,
        )
    }
  }

  throw new DeviceAuthError(
    'The login code expired before it was approved. Please try again.',
    'expired_token',
  )
}
