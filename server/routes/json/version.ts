/**
 * Answers browser and DevTools probes for `/json/version`.
 * That path is not a page. Handling it here keeps Vue Router from warning.
 */
export default defineEventHandler((event) => {
  setResponseStatus(event, 404)

  return { status: 404 }
})
