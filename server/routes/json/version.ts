/**
 * Returns the app version from `VERSION` in the environment.
 *
 * @returns Version payload for `GET /json/version`
 */
export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    version: config.public.version,
  }
})
