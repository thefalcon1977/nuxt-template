import { EncryptStorage } from 'encrypt-storage'
import type { EncryptStorageNoble } from 'encrypt-storage'

let encryptClient: EncryptStorageNoble | null = null
let encryptClientKey: string | null = null

/**
 * Builds or reuses the encrypt-storage client from `ENCRYPT_STORAGE_KEY`.
 *
 * @returns A synchronous Noble encrypt-storage instance
 */
export function getEncryptClient(): EncryptStorageNoble {
  const key = useRuntimeConfig().public.encryptStorageKey

  if (typeof key !== 'string' || key.length < 10) {
    throw new Error(
      'ENCRYPT_STORAGE_KEY must be set and at least 10 characters. ' +
        'If the value contains #, wrap it in quotes in .env (for example ENCRYPT_STORAGE_KEY="2kBDmd81#TW%").',
    )
  }

  if (encryptClient && encryptClientKey === key) {
    return encryptClient
  }

  encryptClient = EncryptStorage.create(key, {
    engine: 'noble',
    prefix: '@nuxt',
  })
  encryptClientKey = key

  return encryptClient
}
