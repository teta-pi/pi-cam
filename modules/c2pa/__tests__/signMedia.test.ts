// jest-expo's preset explicitly jest.mock()s 'expo-file-system' with a
// no-op legacy-API stub (see node_modules/jest-expo/src/preset/setup.js),
// which otherwise wins over the real-filesystem-backed mock in
// __mocks__/expo-file-system.ts. Override it for this file so File actually
// reads/writes bytes.
jest.mock('expo-file-system', () => jest.requireActual('../../../__mocks__/expo-file-system'));

import { createHash, createVerify } from 'crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { generateKeypair } from '../../crypto';
import { signMedia, verifyMedia, SIGNATURE_ALG } from '..';

// Regression test for the 14.12 content-hash bug: signMedia() used to hash
// the base64 *text* of the file (sha256(base64(bytes))), which can never
// match a backend that hashes the uploaded file's raw bytes. It must hash
// the raw bytes themselves.

describe('modules/c2pa signMedia', () => {
  beforeEach(() => {
    (SecureStore as unknown as { __reset: () => void }).__reset();
  });

  it('contentHash is the SHA-256 of the raw file bytes, not of its base64 text', async () => {
    await generateKeypair();

    const fileUri = `${Paths.document}/capture.jpg`;
    const rawBytes = Buffer.from('not actually a jpeg, just test bytes');
    new File(fileUri).write(new Uint8Array(rawBytes));

    const signed = await signMedia(fileUri, {
      filename: 'capture.jpg',
      format: 'image/jpeg',
      device: 'iPhone',
      gpsEnabled: false,
      appVersion: '1.0.0',
    });

    const expectedHash = createHash('sha256').update(rawBytes).digest('hex');
    expect(signed.contentHash).toBe(expectedHash);

    // The old (buggy) behavior for comparison — must NOT match.
    const base64Text = rawBytes.toString('base64');
    const wrongHash = createHash('sha256').update(base64Text, 'utf8').digest('hex');
    expect(signed.contentHash).not.toBe(wrongHash);
  });

  it('signs the content hash (verifiable with the device public key), and reports the real algorithm', async () => {
    const keyInfo = await generateKeypair();

    const fileUri = `${Paths.document}/clip.mp4`;
    new File(fileUri).write(new Uint8Array(Buffer.from('video bytes')));

    const signed = await signMedia(fileUri, {
      filename: 'clip.mp4',
      format: 'video/mp4',
      device: 'Android',
      gpsEnabled: false,
      appVersion: '1.0.0',
    });

    expect(signed.signatureAlg).toBe(SIGNATURE_ALG);
    expect(signed.manifest.signature_info.alg).toBe(SIGNATURE_ALG);

    const verifier = createVerify('SHA256');
    verifier.update(signed.contentHash);
    expect(verifier.verify(keyInfo.publicKeyPem, signed.signature, 'base64')).toBe(true);
  });

  it('verifyMedia detects tampering by hash mismatch', async () => {
    await generateKeypair();

    const fileUri = `${Paths.document}/original.jpg`;
    new File(fileUri).write(new Uint8Array(Buffer.from('original content')));

    await signMedia(fileUri, {
      filename: 'original.jpg',
      format: 'image/jpeg',
      device: 'iPhone',
      gpsEnabled: false,
      appVersion: '1.0.0',
    });

    // Overwrite the same path with different bytes post-signing.
    new File(fileUri).write(new Uint8Array(Buffer.from('tampered content!!')));

    const result = await verifyMedia(fileUri);
    expect(result.status).toBe('tampered');
  });
});
