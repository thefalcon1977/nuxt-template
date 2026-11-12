import { DEFAULT_THEME, isThemeName, THEME_COOKIE, THEME_NAMES } from '~/utils/theme'
import type { ThemeName } from '~/utils/theme'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/**
 * Reads and updates the active theme. The choice is stored in a cookie.
 *
 * @returns The current theme, the allowed names, and a setter
 */
export function useTheme() {
  const themeCookie = useCookie<ThemeName>(THEME_COOKIE, {
    default: () => DEFAULT_THEME,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  })

  const theme = computed<ThemeName>({
    get() {
      return isThemeName(themeCookie.value) ? themeCookie.value : DEFAULT_THEME
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
 * Sets `data-theme` on the document so CSS variables follow the cookie.
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
