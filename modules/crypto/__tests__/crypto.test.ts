import { execFileSync } from 'child_process';
import { writeFileSync, mkdtempSync } from 'fs';
import { createVerify } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import * as crypto from '..';
import { isLegacyKeyFormat as isLegacyKeyFormatLow, CURRENT_KEY_FORMAT } from '../keystore';
import * as SecureStore from 'expo-secure-store';

// react-native-quick-crypto is mocked onto Node's own `crypto` (see
// __mocks__/react-native-quick-crypto.ts) — it cannot run outside a device.
// These tests prove our *wrapper* logic (14.12: generateKeypair/sign/verify,
// legacy-key migration) is correct; the openssl cross-check below proves the
// *output format* (SPKI PEM, DER signature) is standards-compliant,
// independent of which engine produced it.

function hasOpenssl(): boolean {
  try {
    execFileSync('openssl', ['version']);
    return true;
  } catch {
    return false;
  }
}

describe('modules/crypto', () => {
  beforeEach(() => {
    (SecureStore as unknown as { __reset: () => void }).__reset();
  });

  it('generates a real ECDSA P-256 keypair, not a fake hash-in-a-PEM', async () => {
    const keyInfo = await crypto.generateKeypair();

    expect(keyInfo.algorithm).toBe('ECDSA-P256');
    expect(keyInfo.publicKeyPem).toMatch(/^-----BEGIN PUBLIC KEY-----\n/);
    expect(keyInfo.publicKeyPem).toMatch(/-----END PUBLIC KEY-----\n?$/);

    // The old fake key was btoa(sha256-hex) — 44 base64 chars, no SPKI
    // structure at all. A real SPKI P-256 DER (91 bytes) base64-encodes to
    // well over 100 chars once PEM-wrapped with headers/newlines.
    const body = keyInfo.publicKeyPem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
    expect(body.length).toBeGreaterThan(100);
  });

  it('keypairExists() / isLegacyKeyFormat() reflect real state', async () => {
    expect(await crypto.keypairExists()).toBe(false);
    await crypto.generateKeypair();
    expect(await crypto.keypairExists()).toBe(true);
    expect(await crypto.isLegacyKeyFormat()).toBe(false);
  });

  it('flags a pre-14.12 key (no format marker) as legacy', async () => {
    // Simulate what the old generateKeypair() left behind: a public "key"
    // and nothing else — no picam_key_format marker.
    await SecureStore.setItemAsync('picam_public_key', '-----BEGIN PUBLIC KEY-----\nZmFrZQ==\n-----END PUBLIC KEY-----');
    expect(await isLegacyKeyFormatLow()).toBe(true);
  });

  it('does not flag a freshly generated key as legacy', async () => {
    await crypto.generateKeypair();
    expect(await isLegacyKeyFormatLow()).toBe(false);
    expect(await SecureStore.getItemAsync('picam_key_format')).toBe(CURRENT_KEY_FORMAT);
  });

  it('sign() produces a signature verifiable against the stored public key', async () => {
    const keyInfo = await crypto.generateKeypair();
    const contentHash = await crypto.sha256Bytes(new Uint8Array([1, 2, 3, 4, 5]));

    const signatureB64 = await crypto.sign(contentHash);
    expect(typeof signatureB64).toBe('string');
    expect(signatureB64.length).toBeGreaterThan(0);

    const verifier = createVerify('SHA256');
    verifier.update(contentHash);
    const ok = verifier.verify(keyInfo.publicKeyPem, signatureB64, 'base64');
    expect(ok).toBe(true);
  });

  it('sign() rejects a tampered hash', async () => {
    const keyInfo = await crypto.generateKeypair();
    const signatureB64 = await crypto.sign('abc123');

    const verifier = createVerify('SHA256');
    verifier.update('abc124'); // different data
    const ok = verifier.verify(keyInfo.publicKeyPem, signatureB64, 'base64');
    expect(ok).toBe(false);
  });

  it('sign() throws with no keypair generated', async () => {
    await expect(crypto.sign('x')).rejects.toThrow('No keypair found');
  });

  it('sha256Bytes matches the known SHA-256 of an empty input', async () => {
    const hash = await crypto.sha256Bytes(new Uint8Array([]));
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  (hasOpenssl() ? it : it.skip)(
    'exported public key PEM is accepted by an independent tool (openssl) — not just our own code',
    async () => {
      const keyInfo = await crypto.generateKeypair();
      const dir = mkdtempSync(join(tmpdir(), 'picam-pem-'));
      const pemPath = join(dir, 'pub.pem');
      writeFileSync(pemPath, keyInfo.publicKeyPem);

      // `openssl ec -pubin` is the exact command from the task brief — it
      // only succeeds if the PEM is a real, correctly DER-encoded SPKI key.
      const output = execFileSync('openssl', ['ec', '-pubin', '-in', pemPath, '-noout', '-text']).toString();
      expect(output).toMatch(/Public-Key: \(256 bit\)/);
      expect(output.toLowerCase()).toMatch(/prime256v1|nist p-256|secp256r1/);
    }
  );

  (hasOpenssl() ? it : it.skip)(
    'a signature from sign() verifies via openssl dgst, independent of our own verify code',
    async () => {
      const keyInfo = await crypto.generateKeypair();
      const contentHash = await crypto.sha256Bytes(new TextEncoder().encode('hello pi cam'));
      const signatureB64 = await crypto.sign(contentHash);

      const dir = mkdtempSync(join(tmpdir(), 'picam-sig-'));
      const pemPath = join(dir, 'pub.pem');
      const dataPath = join(dir, 'data.bin');
      const sigPath = join(dir, 'sig.der');
      writeFileSync(pemPath, keyInfo.publicKeyPem);
      writeFileSync(dataPath, contentHash);
      writeFileSync(sigPath, Buffer.from(signatureB64, 'base64'));

      const output = execFileSync('openssl', [
        'dgst', '-sha256', '-verify', pemPath, '-signature', sigPath, dataPath,
      ]).toString();
      expect(output.trim()).toBe('Verified OK');
    }
  );
});
