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
 * Writes a cookie in the browser.
 * No-ops on the server. Prefer calling this from client-side user actions.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Optional path, domain, maxAge, expires, secure, and sameSite
 */
function setItem(name: string, value: string, options: CookieOptions = {}): void {
  if (!isBrowser()) {
    return
  }

  const encodedName = encodeURIComponent(name)
  const encodedValue = encodeURIComponent(value)

  document.cookie = `${encodedName}=${encodedValue}; ${serializeAttributes(options)}`
}

/**
 * Reads one cookie by name.
 * Pass the request `Cookie` header on the server so SSR can read the same value.
 *
 * @param name - Cookie name
 * @param cookieHeader - Optional raw `Cookie` request header for SSR
 * @returns The cookie value, or null when missing
 */
function getItem(name: string, cookieHeader?: string): string | null {
  const source = resolveCookieSource(cookieHeader)

  if (source === null) {
    return null
  }

  const cookies = parseCookies(source)
  const value = cookies[name]

  return value === undefined ? null : value
}

/**
 * Removes one cookie by name.
 *
 * @param name - Cookie name
 * @param options - Optional path and domain that match the original cookie
 * @returns Null after the cookie is cleared
 */
function removeItem(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): null {
  if (!isBrowser()) {
    return null
  }

  setItem(name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  })

  return null
}

/**
 * Reads every cookie currently available.
 *
 * @param cookieHeader - Optional raw `Cookie` request header for SSR
 * @returns A name-to-value map of cookies
 */
function getAll(cookieHeader?: string): Record<string, string> {
  const source = resolveCookieSource(cookieHeader)

  if (source === null) {
    return {}
  }

  return parseCookies(source)
}

/**
 * Removes every cookie available to this document for the given path and domain.
 *
 * @param options - Optional path and domain that match the cookies to clear
 */
function clear(options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  const cookies = getAll()

  for (const name of Object.keys(cookies)) {
    removeItem(name, options)
  }
}

/**
 * Browser cookie helpers for insert, read, delete, and bulk management.
 * App code must use this service for every cookie read or write.
 */
export const CookieService = {
  setItem,
  getItem,
  removeItem,
  getAll,
  clear,
}
