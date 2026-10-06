// expo-secure-store's native module is unavailable under Jest and the
// jest-expo auto-mock silently resolves every call to `undefined`. For unit
// tests we back it with a real in-memory map so round-trip behavior
// (store → read → delete) is actually exercised.
const store = new Map<string, string>();

export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WHEN_UNLOCKED_THIS_DEVICE_ONLY';

export async function setItemAsync(key: string, value: string, _options?: unknown): Promise<void> {
  store.set(key, value);
}

export async function getItemAsync(key: string): Promise<string | null> {
  return store.has(key) ? store.get(key)! : null;
}

export async function deleteItemAsync(key: string): Promise<void> {
  store.delete(key);
}

export function __reset(): void {
  store.clear();
}
