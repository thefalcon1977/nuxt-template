import { getEncryptClient } from './encryptClient'

type StorageRecord = Record<string, unknown>

const STORAGE_KEY = 'storage'

/**
 * Reads the encrypted storage object, creating it when it is missing.
 *
 * @returns The stored record
 */
function readStorage(): StorageRecord {
  const encryptStorage = getEncryptClient()
  const stored = encryptStorage.getItem<StorageRecord>(STORAGE_KEY)

  if (stored === null || stored === undefined) {
    const empty: StorageRecord = {}
    encryptStorage.setItem(STORAGE_KEY, empty)
    return empty
  }

  return stored
}

/**
 * Writes one value into encrypted local storage.
 *
 * @param key - Storage key
 * @param value - Value to store
 */
function setItem(key: string, value: unknown): void {
  const storage = readStorage()
  storage[key] = value
  getEncryptClient().setItem(STORAGE_KEY, storage)
}

/**
 * Reads one value from encrypted local storage.
 *
 * @param key - Storage key
 * @returns The stored value, or null when the key is missing
 */
function getItem(key: string): unknown {
  const storage = readStorage()
  const value = storage[key]

  if (value === undefined) {
    return null
  }

  return value
}

/**
 * Removes one value from encrypted local storage.
 *
 * @param key - Storage key
 * @returns Null after the key is removed
 */
function removeItem(key: string): null {
  const storage = readStorage()
  const next = Object.fromEntries(Object.entries(storage).filter(([entryKey]) => entryKey !== key))

  getEncryptClient().setItem(STORAGE_KEY, next)
  return null
}

/**
 * Encrypted browser storage. Values live in one object under the `storage` key.
 * Uses `ENCRYPT_STORAGE_KEY` from the environment.
 */
export const StorageService = {
  setItem,
  getItem,
  removeItem,
}
