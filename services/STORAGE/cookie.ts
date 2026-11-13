import { getEncryptClient } from './encryptClient'

/**
 * Options for writing or clearing a browser cookie.
 */
export interface CookieOptions {
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

const COOKIE_PREFIX = '@nuxt'

/**
 * True when `document.cookie` is available.
 *
 * @returns Whether the code is running in a browser
 */
function isBrowser(): boolean {
  return typeof document !== 'undefined'
}

/**
 * Builds encrypt-storage cookie options from CookieService options.
 *
 * @param options - CookieService attributes
 * @returns Options accepted by encrypt-storage
 */
function toEncryptCookieOptions(options: CookieOptions = {}): {
  path?: string
  domain?: string
  expires?: number | Date
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
} {
  const result: {
    path?: string
    domain?: string
    expires?: number | Date
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  } = {
    path: options.path ?? '/',
  }

  if (options.domain) {
    result.domain = options.domain
  }

  if (options.expires) {
    result.expires = options.expires
  } else if (options.maxAge !== undefined) {
    result.expires = options.maxAge
  }

  if (options.secure) {
    result.secure = options.secure
  }

  if (options.sameSite) {
    result.sameSite = options.sameSite
  }

  return result
}

/**
 * Storage key written to `document.cookie` for a logical name.
 *
 * @param name - Logical cookie name
 * @returns Prefixed cookie name
 */
function storageCookieName(name: string): string {
  return `${COOKIE_PREFIX}:${name}`
}

/**
 * Picks the cookie string to parse: an explicit header, or `document.cookie` in the browser.
 *
 * @param cookieHeader - Optional raw `Cookie` request header for SSR reads
 * @returns The cookie source string, or null when none is available
 */
function resolveCookieSource(cookieHeader?: string): string | null {
  if (typeof cookieHeader === 'string') {
    return cookieHeader
  }

  if (isBrowser()) {
    return document.cookie
  }

  return null
}

/**
 * Parses a cookie header or `document.cookie` string into a name-to-value map.
 *
 * @param source - Raw cookie string
 * @returns Parsed cookies
 */
function parseCookies(source: string): Record<string, string> {
  if (!source) {
    return {}
  }

  const result: Record<string, string> = {}
  const cookies = source.split('; ')

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=')
    const key = separatorIndex === -1 ? cookie : cookie.slice(0, separatorIndex)
    const rawValue = separatorIndex === -1 ? '' : cookie.slice(separatorIndex + 1)

    result[decodeURIComponent(key)] = decodeURIComponent(rawValue)
  }

  return result
}

/**
 * Decrypts a value written by encrypt-storage cookie helpers.
 *
 * @param encryptedValue - Encrypted cookie payload
 * @returns Plain string value, or null when decryption fails
 */
function decryptStoredValue(encryptedValue: string): string | null {
  try {
    const client = getEncryptClient()
    const once = client.decryptValue<unknown>(encryptedValue)

    if (once === null || once === undefined) {
      return null
    }

    if (typeof once === 'string') {
      try {
        const twice = JSON.parse(once) as unknown
        return twice === null || twice === undefined ? null : String(twice)
      } catch {
        return once
      }
    }

    return String(once)
  } catch {
    return null
  }
}

/**
 * Writes an encrypted cookie in the browser.
 * The name is stored as `@nuxt:{name}` and the value is encrypted with `ENCRYPT_STORAGE_KEY`.
 *
 * @param name - Logical cookie name
 * @param value - Plain cookie value
 * @param options - Optional path, domain, maxAge, expires, secure, and sameSite
 */
function setItem(name: string, value: string, options: CookieOptions = {}): void {
  if (!isBrowser()) {
    return
  }

  getEncryptClient().cookie.set(name, value, toEncryptCookieOptions(options))
}

/**
 * Reads and decrypts one cookie by logical name.
 * Pass the request `Cookie` header on the server so SSR can read the same value.
 *
 * @param name - Logical cookie name
 * @param cookieHeader - Optional raw `Cookie` request header for SSR
 * @returns The plain cookie value, or null when missing
 */
function getItem(name: string, cookieHeader?: string): string | null {
  if (isBrowser() && cookieHeader === undefined) {
    const value = getEncryptClient().cookie.get<unknown>(name)

    if (value === null || value === undefined) {
      return null
    }

    return String(value)
  }

  const source = resolveCookieSource(cookieHeader)

  if (source === null) {
    return null
  }

  const cookies = parseCookies(source)
  const encryptedValue = cookies[storageCookieName(name)]

  if (encryptedValue === undefined || encryptedValue === '') {
    return null
  }

  return decryptStoredValue(encryptedValue)
}

/**
 * Removes one encrypted cookie by logical name.
 *
 * @param name - Logical cookie name
 * @param options - Optional path and domain that match the original cookie
 * @returns Null after the cookie is cleared
 */
function removeItem(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): null {
  if (!isBrowser()) {
    return null
  }

  getEncryptClient().cookie.remove(name, {
    path: options.path ?? '/',
    domain: options.domain,
  })

  return null
}

/**
 * Reads every CookieService cookie and decrypts the values.
 * Keys in the result are logical names without the `@nuxt:` prefix when possible.
 *
 * @param cookieHeader - Optional raw `Cookie` request header for SSR
 * @returns A name-to-value map
 */
function getAll(cookieHeader?: string): Record<string, string> {
  const source = resolveCookieSource(cookieHeader)

  if (source === null) {
    return {}
  }

  const cookies = parseCookies(source)
  const result: Record<string, string> = {}
  const prefix = `${COOKIE_PREFIX}:`

  for (const [storedName, encryptedValue] of Object.entries(cookies)) {
    if (!storedName.startsWith(prefix)) {
      continue
    }

    const decrypted = decryptStoredValue(encryptedValue)

    if (decrypted !== null) {
      result[storedName.slice(prefix.length)] = decrypted
    }
  }

  return result
}

/**
 * Removes every `@nuxt:` cookie available to this document for the given path and domain.
 *
 * @param options - Optional path and domain that match the cookies to clear
 */
function clear(options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  if (!isBrowser()) {
    return
  }

  const cookies = getAll()

  for (const name of Object.keys(cookies)) {
    removeItem(name, options)
  }
}

/**
 * Encrypted browser cookie helpers for insert, read, delete, and bulk management.
 * Names are stored as `@nuxt:{name}`. Values are encrypted with `ENCRYPT_STORAGE_KEY`.
 * App code must use this service for every cookie read or write.
 */
export const CookieService = {
  setItem,
  getItem,
  removeItem,
  getAll,
  clear,
}
