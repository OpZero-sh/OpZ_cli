import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { AuthConfig, DeployTarget } from './types.js'

const CONFIG_DIR = join(homedir(), '.opzero')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

const DEFAULT_CONFIG: AuthConfig = {
  auth: { method: 'api-key' },
  defaults: { target: 'cloudflare', baseUrl: 'https://opzero.sh' },
}

export class AuthManager {
  static configPath(): string {
    return CONFIG_FILE
  }

  static configDir(): string {
    return CONFIG_DIR
  }

  static load(): AuthConfig {
    if (!existsSync(CONFIG_FILE)) return { ...DEFAULT_CONFIG }
    try {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
    } catch {
      return { ...DEFAULT_CONFIG }
    }
  }

  static save(config: AuthConfig): void {
    mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n')
  }

  static getCredentials(): { apiKey?: string; token?: string } {
    const envKey = process.env.OPZERO_API_KEY
    if (envKey) return { apiKey: envKey }

    const config = this.load()
    return {
      apiKey: config.auth.apiKey,
      token: config.auth.token,
    }
  }

  static getBaseUrl(): string {
    return process.env.OPZERO_API_URL || this.load().defaults.baseUrl
  }

  static getDefaultTarget(): DeployTarget {
    return this.load().defaults.target
  }

  static isAuthenticated(): boolean {
    const creds = this.getCredentials()
    return !!(creds.apiKey || creds.token)
  }

  static clear(): void {
    this.save(DEFAULT_CONFIG)
  }

  static setApiKey(apiKey: string): void {
    const config = this.load()
    config.auth = { method: 'api-key', apiKey }
    this.save(config)
  }

  static setToken(token: string): void {
    const config = this.load()
    config.auth = { method: 'oauth', token }
    this.save(config)
  }

  static setDefaults(defaults: Partial<AuthConfig['defaults']>): void {
    const config = this.load()
    config.defaults = { ...config.defaults, ...defaults }
    this.save(config)
  }
}
