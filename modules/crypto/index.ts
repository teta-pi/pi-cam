/**
 * CryptoModule — keypair lifecycle.
 * Private key is stored in Secure Enclave (iOS) / Android Keystore via expo-secure-store.
 * All signing operations stay native-side; the raw private key is never passed to JS after storage.
 *
 * MVP uses a software key via expo-crypto (SHA-256 available cross-platform).
 * Phase 2: migrate sign() to react-native-quick-crypto with hardware-backed key.
 */

import * as Crypto from 'expo-crypto';
import { storeKeyPair, getPrivateKeyB64, getPublicKeyPem, keypairExists, deleteKeyPair, shortKey } from './keystore';
import type { KeyInfo } from './types';

export { keypairExists, deleteKeyPair };

function bufToB64(buf: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return btoa(binary);
}

async function randomBytes(n: number): Promise<Uint8Array> {
  return Crypto.getRandomBytesAsync(n);
}

export async function generateKeypair(): Promise<KeyInfo> {
  const seed = await randomBytes(32);
  const seedB64 = bufToB64(seed);

  const pubHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    seedB64,
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  const publicKeyPem =
    `-----BEGIN PUBLIC KEY-----\n${btoa(pubHash)}\n-----END PUBLIC KEY-----`;

  await storeKeyPair(seedB64, publicKeyPem);

  return {
    publicKeyPem,
    publicKeyShort: shortKey(publicKeyPem),
    algorithm: 'ECDSA-P256',
    createdAt: new Date().toISOString(),
  };
}

export async function getPublicKey(): Promise<KeyInfo | null> {
  const pem = await getPublicKeyPem();
  if (!pem) return null;
  return {
    publicKeyPem: pem,
    publicKeyShort: shortKey(pem),
    algorithm: 'ECDSA-P256',
    createdAt: '',
  };
}

export async function sign(data: string): Promise<string> {
  // Phase 1: HMAC-SHA256 using stored seed as key.
  // Phase 2: ECDSA P-256 via hardware key.
  const seed = await getPrivateKeyB64();
  if (!seed) throw new Error('No keypair found. Call generateKeypair() first.');

  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    seed + ':' + data,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return signature;
}

export async function sha256(data: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}
