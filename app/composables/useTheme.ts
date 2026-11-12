import { DEFAULT_THEME, isThemeName, THEME_COOKIE, THEME_NAMES } from '~/utils/theme'
import type { ThemeName } from '~/utils/theme'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/**
 * Reads and updates the active theme.
 * `THEME` in the environment is the default. A cookie is written only after the visitor picks a theme.
 *
 * @returns The current theme, the allowed names, and a setter
 */
export function useTheme() {
  const config = useRuntimeConfig()

  /**
   * Default theme from `THEME`.
   *
   * @returns A supported theme name
   */
  function themeFromConfig(): ThemeName {
    const value = config.public.theme

    return typeof value === 'string' && isThemeName(value) ? value : DEFAULT_THEME
  }

  const themeCookie = useCookie<ThemeName | null>(THEME_COOKIE, {
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  })

  /**
   * Theme the visitor chose, when the cookie holds a supported name.
   *
   * @returns The stored theme, or null when the cookie is missing or invalid
   */
  function themeFromCookie(): ThemeName | null {
    const value = themeCookie.value

    return typeof value === 'string' && isThemeName(value) ? value : null
  }

  const theme = computed<ThemeName>({
    get() {
      return themeFromCookie() ?? themeFromConfig()
    },
    set(value) {
      themeCookie.value = value
    },
  })

  /**
   * Applies a supported theme.
   *
   * @param value - Theme name from the switch
   */
  function setTheme(value: ThemeName): void {
    theme.value = value
  }

  return {
    theme,
    themes: THEME_NAMES,
    setTheme,
  }
}

/**
 * Sets `data-theme` on the document so CSS variables follow the active theme.
 */
export function useThemeHead(): void {
  const { theme } = useTheme()

  useHead(
    computed(() => ({
      htmlAttrs: {
        'data-theme': theme.value,
      },
    })),
  )
}
