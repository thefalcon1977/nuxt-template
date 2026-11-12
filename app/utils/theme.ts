export const THEME_NAMES = ['light', 'dark', 'custom'] as const

export type ThemeName = (typeof THEME_NAMES)[number]

export const THEME_COOKIE = 'theme'

export const DEFAULT_THEME: ThemeName = 'light'

/**
 * Checks whether a value is one of the supported theme names.
 *
 * @param value - Raw cookie or select value
 * @returns True when the value is light, dark, or custom
 */
export function isThemeName(value: string): value is ThemeName {
  return (THEME_NAMES as readonly string[]).includes(value)
}
