/**
 * CryptoModule — keypair lifecycle.
 * Real ECDSA P-256 keypair (react-native-quick-crypto, OpenSSL-backed). The
 * private key is a PKCS8 PEM stored in expo-secure-store — encrypted at rest
 * by the OS keychain/Keystore, but NOT hardware-backed (no Secure Enclave /
 * Android StrongBox). The public key is exported as real SPKI PEM, parseable
 * by any standard crypto library (`openssl ec -pubin`, Node's `crypto`, …).
 */

import QuickCrypto from 'react-native-quick-crypto';
import * as Crypto from 'expo-crypto';
import { storeKeyPair, getPrivateKeyPem, getPublicKeyPem, keypairExists, deleteKeyPair, isLegacyKeyFormat, shortKey } from './keystore';
import type { KeyInfo } from './types';

export { keypairExists, deleteKeyPair, isLegacyKeyFormat };

export async function generateKeypair(): Promise<KeyInfo> {
  const { publicKey, privateKey } = QuickCrypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  }) as { publicKey: string; privateKey: string };

  await storeKeyPair(privateKey, publicKey);

  return {
    publicKeyPem: publicKey,
    publicKeyShort: shortKey(publicKey),
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

/**
 * ECDSA-SHA256 signature over `data`, DER-encoded then base64'd. `data` is
 * expected to be a hex-encoded SHA-256 content hash (see modules/c2pa) —
 * callers that need to sign arbitrary strings can still pass any string.
 */
export async function sign(data: string): Promise<string> {
  const privateKeyPem = await getPrivateKeyPem();
  if (!privateKeyPem) throw new Error('No keypair found. Call generateKeypair() first.');

  const signature = QuickCrypto.createSign('SHA256')
    .update(data)
    .sign(privateKeyPem, 'base64');
  return signature as unknown as string;
}

export async function sha256(data: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}

/** SHA-256 of raw bytes (e.g. a captured file's actual content), hex-encoded. */
export async function sha256Bytes(data: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
