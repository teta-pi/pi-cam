// jest-expo auto-mocks expo-crypto's native digest calls to return all-zero
// bytes (see modules/crypto/__tests__ for the smoke test that caught this).
// For unit tests we back it with Node's real `crypto.createHash`, so hash
// values in tests are the real SHA-256, not zeroes.
import { createHash } from 'crypto';

export enum CryptoDigestAlgorithm {
  SHA256 = 'SHA-256',
}

export enum CryptoEncoding {
  HEX = 'hex',
}

export async function digestStringAsync(
  _algorithm: CryptoDigestAlgorithm,
  data: string,
  options?: { encoding?: CryptoEncoding }
): Promise<string> {
  const hash = createHash('sha256').update(data, 'utf8');
  return options?.encoding === CryptoEncoding.HEX || !options
    ? hash.digest('hex')
    : hash.digest('base64');
}

export async function digest(_algorithm: CryptoDigestAlgorithm, data: Uint8Array): Promise<ArrayBuffer> {
  const buf = createHash('sha256').update(data).digest();
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export async function getRandomBytesAsync(byteCount: number): Promise<Uint8Array> {
  const { randomBytes } = await import('crypto');
  return new Uint8Array(randomBytes(byteCount));
}
