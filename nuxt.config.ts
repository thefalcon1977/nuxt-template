// https://nuxt.com/docs/api/configuration/nuxt-config
const locale = process.env.LOCALE ?? 'en'
const theme = process.env.THEME ?? 'light'
const apiBaseUrl = process.env.API_BASE_URL ?? ''
const version = process.env.VERSION ?? '1.0.0'
const mode = process.env.MODE === 'production' ? 'production' : 'development'
const encryptStorageKey = process.env.ENCRYPT_STORAGE_KEY ?? ''

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  css: ['~/assets/styles/app.scss'],
  typescript: {
    nodeTsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl,
      theme,
      locale,
      version,
      mode,
      encryptStorageKey,
    },
  },

  i18n: {
    locales: [
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        dir: 'ltr',
        file: 'en.ts',
      },
    ],
    defaultLocale: locale as 'en',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: false,
  },
})
