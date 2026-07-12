/**
 * C2PAModule — signs and verifies media using C2PA manifest structure.
 * Phase 1: stores manifest as JSON sidecar + XMP-like embed in file.
 * Phase 2: use c2pa-js for full JUMBF embedding.
 */

import { File, Directory, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { sha256, sign, getPublicKey } from '../crypto';
import { buildManifest, serializeManifest } from './manifest';
import type { SignedFile, VerifyResult, CaptureMetadata } from './types';

function manifestDir(): Directory {
  return new Directory(Paths.document, 'manifests');
}

function ensureManifestDir(): Directory {
  const dir = manifestDir();
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

export async function signMedia(
  fileUri: string,
  meta: CaptureMetadata
): Promise<SignedFile> {
  const b64 = await new File(fileUri).base64();
  const contentHash = await sha256(b64);

  const keyInfo = await getPublicKey();
  if (!keyInfo) throw new Error('No device key. Generate keypair first.');

  const manifest = buildManifest(contentHash, keyInfo.publicKeyShort, meta);
  const manifestJson = serializeManifest(manifest);
  const signature = await sign(manifestJson);

  const dir = ensureManifestDir();
  new File(dir, `${contentHash.slice(0, 16)}.json`).write(
    JSON.stringify({ manifest, signature })
  );

  return { uri: fileUri, manifest, contentHash, signature };
}

export async function verifyMedia(fileUri: string): Promise<VerifyResult> {
  try {
    const b64 = await new File(fileUri).base64();
    const computedHash = await sha256(b64);

    const dir = ensureManifestDir();
    const items = dir.list();

    for (const item of items) {
      if (item.uri.endsWith('/')) continue;
      const raw = await (item as File).text();
      const { manifest } = JSON.parse(raw);
      const hashAssertion = manifest.assertions?.find(
        (a: { label: string; data: { hash?: string } }) => a.label === 'c2pa.hash.data'
      );
      if (hashAssertion?.data?.hash === computedHash) {
        return {
          status: manifest.ca_certificate ? 'ca' : 'device',
          manifest,
          contentHash: computedHash,
        };
      }
      if (hashAssertion?.data?.hash && hashAssertion.data.hash !== computedHash) {
        return { status: 'tampered', manifest, contentHash: computedHash, message: 'Hash mismatch' };
      }
    }

    return { status: 'none', manifest: null, contentHash: computedHash };
  } catch {
    return { status: 'none', manifest: null, contentHash: null };
  }
}

export async function indexTrustedAsset(assetId: string, level: 'ca' | 'device', contentHash: string) {
  // Store assetId inside the manifest for future cross-session recovery
  const dir = ensureManifestDir();
  const manifestFile = new File(dir, `${contentHash.slice(0, 16)}.json`);
  if (manifestFile.exists) {
    try {
      const data = JSON.parse(await manifestFile.text());
      data.assetId = assetId;
      data.trustLevel = level;
      manifestFile.write(JSON.stringify(data));
    } catch {}
  }

  // Quick lookup index
  const indexFile = new File(Paths.document, 'pi_trust_index.json');
  let index: Record<string, 'ca' | 'device'> = {};
  if (indexFile.exists) {
    try { index = JSON.parse(await indexFile.text()); } catch {}
  }
  index[assetId] = level;
  indexFile.write(JSON.stringify(index));
}

export async function loadTrustIndex(): Promise<Record<string, 'ca' | 'device'>> {
  // Build from manifest files (handles cross-session photos)
  const index: Record<string, 'ca' | 'device'> = {};
  try {
    const dir = manifestDir();
    if (dir.exists) {
      const items = dir.list().filter((i) => !i.uri.endsWith('/'));
      await Promise.all(items.map(async (item) => {
        try {
          const data = JSON.parse(await (item as File).text());
          if (data.assetId && data.trustLevel) {
            index[data.assetId] = data.trustLevel;
          }
        } catch {}
      }));
    }
  } catch {}

  // Merge quick index (for items not yet in manifests)
  try {
    const indexFile = new File(Paths.document, 'pi_trust_index.json');
    if (indexFile.exists) {
      const quick = JSON.parse(await indexFile.text()) as Record<string, 'ca' | 'device'>;
      Object.assign(index, quick);
    }
  } catch {}

  return index;
}

export async function extractManifest(_fileUri: string) {
  const dir = ensureManifestDir();
  const items = dir.list().filter((i) => !i.uri.endsWith('/'));
  if (items.length === 0) return null;
  const raw = await (items[items.length - 1] as File).text();
  return JSON.parse(raw).manifest;
}

export async function extractManifestByAssetId(assetId: string) {
  try {
    const dir = manifestDir();
    if (!dir.exists) return null;
    const items = dir.list().filter((i) => !i.uri.endsWith('/'));
    for (const item of items) {
      const raw = await (item as File).text();
      const data = JSON.parse(raw);
      if (data.assetId === assetId) {
        return { manifest: data.manifest as import('./types').C2PAManifest, signature: data.signature as string };
      }
    }
  } catch {}
  return null;
}
