<template>
  <div>
    <header class="app-toolbar">
      <div class="app-toolbar__control">
        <label for="locale">{{ $t('language.label') }}</label>
        <select id="locale" :value="locale" @change="onLocaleChange">
          <option v-for="item in localeOptions" :key="item.code" :value="item.code">
            {{ item.name }}
          </option>
        </select>
      </div>

      <div class="app-toolbar__control">
        <label for="theme">{{ $t('theme.label') }}</label>
        <select id="theme" :value="theme" @change="onThemeChange">
          <option v-for="name in themes" :key="name" :value="name">
            {{ $t(`theme.${name}`) }}
          </option>
        </select>
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { isThemeName } from '~/utils/theme'

const { locale, locales, setLocale } = useI18n()
const { theme, themes, setTheme } = useTheme()

const localeOptions = computed(() =>
  locales.value.map((item) => {
    if (typeof item === 'string') {
      return { code: item, name: item }
    }

    return { code: item.code, name: item.name ?? item.code }
  }),
)

/**
 * Switches the active locale from the language select.
 *
 * @param event - Change event from the locale select
 */
async function onLocaleChange(event: Event): Promise<void> {
  const code = (event.target as HTMLSelectElement).value

  if (code === locale.value) {
    return
  }

  await setLocale(code as typeof locale.value)
}

/**
 * Switches the active theme from the theme select.
 *
 * @param event - Change event from the theme select
 */
function onThemeChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value

  if (!isThemeName(value) || value === theme.value) {
    return
  }

  setTheme(value)
}
</script>

<style scoped>
.app-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0.75rem 1rem;
}

.app-toolbar__control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
</style>
