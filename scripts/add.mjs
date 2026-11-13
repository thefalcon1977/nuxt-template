#!/usr/bin/env node
import { mkdir, access, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SUPPORTED_TYPES = new Set(['pages'])

/**
 * Prints CLI usage to stderr.
 */
function printUsage() {
  console.error(`Usage:
  yarn add:pages <name>
  yarn gen pages <name>

Examples:
  yarn add:pages test
  yarn add:pages blog/post
  yarn gen pages settings/profile
`)
}

/**
 * Checks whether a file or directory exists.
 *
 * @param {string} targetPath - Absolute path
 * @returns {Promise<boolean>}
 */
async function pathExists(targetPath) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

/**
 * Validates a page route name.
 *
 * @param {string} name - Route path without extension
 * @returns {string} Normalized route name
 */
function normalizePageName(name) {
  const normalized = name
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.vue$/i, '')

  if (!normalized) {
    throw new Error('Page name is required.')
  }

  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new Error('Page name must be a relative route path.')
  }

  if (!/^[a-z0-9/[\]_-]+$/i.test(normalized)) {
    throw new Error('Page name may only contain letters, numbers, "/", "-", "_", "[", and "]".')
  }

  return normalized
}

/**
 * Builds a simple title from the last route segment.
 *
 * @param {string} name - Normalized page name
 * @returns {string} Display title
 */
function titleFromName(name) {
  const segment = name.split('/').filter(Boolean).at(-1) ?? name
  const cleaned = segment.replace(/^\[|\]$/g, '').replace(/[-_]+/g, ' ')

  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Creates the Vue SFC source for a new page.
 *
 * @param {string} title - Page heading
 * @returns {string} File contents
 */
function createPageSource(title) {
  return `<template>
  <main class="page-wrapper">
    <h1>${title}</h1>
    <p>Start building from this page.</p>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>

<style scoped></style>
`
}

/**
 * Scaffolds a page under `app/pages/`.
 *
 * @param {string} rawName - Route name from the CLI
 */
async function addPage(rawName) {
  const name = normalizePageName(rawName)
  const filePath = path.join(ROOT_DIR, 'app', 'pages', `${name}.vue`)
  const title = titleFromName(name)

  if (await pathExists(filePath)) {
    throw new Error(`Page already exists: app/pages/${name}.vue`)
  }

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, createPageSource(title), 'utf8')

  console.log(`Created app/pages/${name}.vue`)
  console.log(`Route: /${name === 'index' ? '' : name}`)
}

/**
 * Entry point for `yarn add:pages` and `yarn gen`.
 *
 * @param {string[]} argv - CLI arguments after the node script path
 */
async function main(argv) {
  const [type, name] = argv

  if (!type || type === '--help' || type === '-h') {
    printUsage()
    process.exit(type ? 0 : 1)
  }

  if (!SUPPORTED_TYPES.has(type)) {
    console.error(`Unsupported type "${type}". Supported: ${[...SUPPORTED_TYPES].join(', ')}`)
    printUsage()
    process.exit(1)
  }

  if (!name) {
    console.error('Missing name.')
    printUsage()
    process.exit(1)
  }

  if (type === 'pages') {
    await addPage(name)
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
