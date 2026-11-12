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

/**
 * True when `document.cookie` is available.
 *
 * @returns Whether the code is running in a browser
 */
function isBrowser(): boolean {
  return typeof document !== 'undefined'
}

/**
 * Builds the attribute string for `document.cookie`.
 *
 * @param options - Cookie attributes
 * @returns Serialized attributes
 */
function serializeAttributes(options: CookieOptions = {}): string {
  const parts: string[] = []
  const path = options.path ?? '/'

  parts.push(`path=${path}`)

  if (options.domain) {
    parts.push(`domain=${options.domain}`)
  }

  if (options.maxAge !== undefined) {
    parts.push(`max-age=${Math.floor(options.maxAge)}`)
  }

  if (options.expires) {
    parts.push(`expires=${options.expires.toUTCString()}`)
  }

  if (options.secure) {
    parts.push('secure')
  }

  if (options.sameSite) {
    parts.push(`samesite=${options.sameSite}`)
  }

  return parts.join('; ')
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
 * Turns a logical cookie name into the encrypted storage key.
 *
 * @param name - Logical cookie name
 * @returns Hashed cookie name
 */
function encryptCookieName(name: string): string {
  return getEncryptClient().hash(name)
}

/**
 * Encrypts a cookie value with `ENCRYPT_STORAGE_KEY`.
 *
 * @param value - Plain cookie value
 * @returns Encrypted cookie value
 */
function encryptCookieValue(value: string): string {
  return getEncryptClient().encryptValue(value)
}

/**
 * Decrypts a cookie value with `ENCRYPT_STORAGE_KEY`.
 *
 * @param value - Encrypted cookie value
 * @returns Plain cookie value, or null when decryption fails
 */
function decryptCookieValue(value: string): string | null {
  try {
    const decrypted = getEncryptClient().decryptValue<unknown>(value)

    if (decrypted === null || decrypted === undefined) {
      return null
    }

    return typeof decrypted === 'string' ? decrypted : String(decrypted)
  } catch {
    return null
  }
}

/**
 * Writes an encrypted cookie in the browser.
 * The cookie name is hashed and the value is encrypted with `ENCRYPT_STORAGE_KEY`.
 *
 * @param name - Logical cookie name
 * @param value - Plain cookie value
 * @param options - Optional path, domain, maxAge, expires, secure, and sameSite
 */
function setItem(name: string, value: string, options: CookieOptions = {}): void {
  if (!isBrowser()) {
    return
  }

  const encodedName = encodeURIComponent(encryptCookieName(name))
  const encodedValue = encodeURIComponent(encryptCookieValue(value))

  document.cookie = `${encodedName}=${encodedValue}; ${serializeAttributes(options)}`
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
  const source = resolveCookieSource(cookieHeader)

  if (source === null) {
    return null
  }

  const cookies = parseCookies(source)
  const encryptedValue = cookies[encryptCookieName(name)]

  if (encryptedValue === undefined || encryptedValue === '') {
    return null
  }

  return decryptCookieValue(encryptedValue)
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

  const encodedName = encodeURIComponent(encryptCookieName(name))

  document.cookie = `${encodedName}=; ${serializeAttributes({
    ...options,
    maxAge: 0,
    expires: new Date(0),
  })}`

  return null
}

/**
 * Reads every cookie and decrypts values that were written by CookieService.
 * Keys in the result are the hashed cookie names.
 *
 * @param cookieHeader - Optional raw `Cookie` request header for SSR
 * @returns A hashed-name-to-plain-value map
 */
function getAll(cookieHeader?: string): Record<string, string> {
  const source = resolveCookieSource(cookieHeader)

  if (source === null) {
    return {}
  }

  const cookies = parseCookies(source)
  const result: Record<string, string> = {}

  for (const [hashedName, encryptedValue] of Object.entries(cookies)) {
    const decrypted = decryptCookieValue(encryptedValue)

    if (decrypted !== null) {
      result[hashedName] = decrypted
    }
  }

  return result
}

/**
 * Removes every cookie available to this document for the given path and domain.
 *
 * @param options - Optional path and domain that match the cookies to clear
 */
function clear(options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  if (!isBrowser() || !document.cookie) {
    return
  }

  const cookies = parseCookies(document.cookie)

  for (const hashedName of Object.keys(cookies)) {
    document.cookie = `${encodeURIComponent(hashedName)}=; ${serializeAttributes({
      ...options,
      maxAge: 0,
      expires: new Date(0),
    })}`
  }
}

/**
 * Encrypted browser cookie helpers for insert, read, delete, and bulk management.
 * Cookie names are hashed and values are encrypted with `ENCRYPT_STORAGE_KEY`.
 * App code must use this service for every cookie read or write.
 */
export const CookieService = {
  setItem,
  getItem,
  removeItem,
  getAll,
  clear,
}
