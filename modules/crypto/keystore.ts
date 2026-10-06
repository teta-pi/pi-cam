import * as SecureStore from 'expo-secure-store';

const KEY_PRIVATE = 'picam_private_key';
const KEY_PUBLIC  = 'picam_public_key';
const KEY_CREATED = 'picam_key_created';
const KEY_FORMAT  = 'picam_key_format';

// Bumped whenever the stored key material changes shape. Anything stored
// without this marker (or with an older value) predates 14.12's real ECDSA
// P-256 keys — those were a SHA-256 hash wrapped in a fake PEM header, never
// a real key, and must be treated as unusable (see modules/crypto/index.ts).
export const CURRENT_KEY_FORMAT = 'ecdsa-p256-v1';

export async function storeKeyPair(privateKeyPem: string, publicKeyPem: string): Promise<void> {
  await SecureStore.setItemAsync(KEY_PRIVATE, privateKeyPem, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await SecureStore.setItemAsync(KEY_PUBLIC, publicKeyPem);
  await SecureStore.setItemAsync(KEY_CREATED, new Date().toISOString());
  await SecureStore.setItemAsync(KEY_FORMAT, CURRENT_KEY_FORMAT);
}

export async function getPrivateKeyPem(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_PRIVATE);
}

export async function getPublicKeyPem(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_PUBLIC);
}

export async function getKeyCreatedAt(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_CREATED);
}

export async function deleteKeyPair(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PRIVATE);
  await SecureStore.deleteItemAsync(KEY_PUBLIC);
  await SecureStore.deleteItemAsync(KEY_CREATED);
  await SecureStore.deleteItemAsync(KEY_FORMAT);
}

export async function keypairExists(): Promise<boolean> {
  const pub = await getPublicKeyPem();
  return pub !== null;
}

/** True if a key is stored but predates the real-ECDSA format (14.12). */
export async function isLegacyKeyFormat(): Promise<boolean> {
  const pub = await getPublicKeyPem();
  if (!pub) return false;
  const format = await SecureStore.getItemAsync(KEY_FORMAT);
  return format !== CURRENT_KEY_FORMAT;
}

export function shortKey(pem: string): string {
  const clean = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)}···${clean.slice(-4)}`;
}
