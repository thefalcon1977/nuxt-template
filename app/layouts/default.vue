<template>
  <div>
    <header class="locale-switch">
      <label for="locale">{{ $t('language.label') }}</label>
      <select id="locale" :value="locale" @change="onLocaleChange">
        <option v-for="item in localeOptions" :key="item.code" :value="item.code">
          {{ item.name }}
        </option>
      </select>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

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
</script>

<style scoped>
.locale-switch {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}

.locale-switch label {
  font-size: 0.875rem;
}
</style>
