import { DEFAULT_THEME, isThemeName, THEME_COOKIE, THEME_NAMES } from '~/utils/theme'
import type { ThemeName } from '~/utils/theme'
import { CookieService } from '../../services/STORAGE/cookie'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const THEME_COOKIE_OPTIONS = {
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ONE_YEAR_SECONDS,
}

/**
 * Reads the theme cookie through CookieService.
 *
 * @returns The stored theme name, or null when missing or invalid
 */
function readThemeCookie(): ThemeName | null {
  const cookieHeader = import.meta.server ? useRequestHeaders(['cookie']).cookie : undefined
  const value = CookieService.getItem(THEME_COOKIE, cookieHeader)

  return typeof value === 'string' && isThemeName(value) ? value : null
}

/**
 * Reads and updates the active theme.
 * `THEME` in the environment is the default. A cookie is written only after the visitor picks a theme.
 *
 * @returns The current theme, the allowed names, and a setter
 */
export function useTheme() {
  const config = useRuntimeConfig()
  const themeCookie = useState<ThemeName | null>('theme-cookie', () => readThemeCookie())

  /**
   * Default theme from `THEME`.
   *
   * @returns A supported theme name
   */
  function themeFromConfig(): ThemeName {
    const value = config.public.theme

    return typeof value === 'string' && isThemeName(value) ? value : DEFAULT_THEME
  }

  const theme = computed<ThemeName>({
    get() {
      return themeCookie.value ?? themeFromConfig()
    },
    set(value) {
      CookieService.setItem(THEME_COOKIE, value, THEME_COOKIE_OPTIONS)
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
