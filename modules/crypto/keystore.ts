import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY_PRIVATE = 'picam_private_key';
const KEY_PUBLIC  = 'picam_public_key';
const KEY_CREATED = 'picam_key_created';

export async function storeKeyPair(privateKeyB64: string, publicKeyPem: string): Promise<void> {
  await SecureStore.setItemAsync(KEY_PRIVATE, privateKeyB64, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await SecureStore.setItemAsync(KEY_PUBLIC, publicKeyPem);
  await SecureStore.setItemAsync(KEY_CREATED, new Date().toISOString());
}

export async function getPrivateKeyB64(): Promise<string | null> {
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
}

export async function keypairExists(): Promise<boolean> {
  const pub = await getPublicKeyPem();
  return pub !== null;
}

export function shortKey(pem: string): string {
  const clean = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)}···${clean.slice(-4)}`;
}
