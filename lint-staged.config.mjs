/** @type {import('lint-staged').Configuration} */
export default {
  '*.{js,ts,mjs,cjs,vue,json,css,scss,md,yml,yaml}': ['prettier --write'],
  '*.{js,ts,mjs,cjs,vue}': ['eslint --fix'],
}
