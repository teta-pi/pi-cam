import * as SecureStore from 'expo-secure-store';

const KEY_API_KEY     = 'tetapi_api_key';
const KEY_DEVICE_ID   = 'tetapi_device_id';
const KEY_ENTITY_ID   = 'tetapi_entity_id';
const KEY_ENTITY_NAME = 'tetapi_entity_name';
const KEY_ENTITY_SLUG = 'tetapi_entity_slug';

const API_BASE = 'https://api.tetapi.dev/api/v1';

export interface LinkedAccount {
  deviceId: string;
  entityId: string;
  entityName: string;
  entitySlug: string | null;
  apiKey: string;
}

/**
 * Wipe the local account link without calling the server (14.12 key
 * migration). Used only when a device's key is being regenerated because
 * its old key was never a real one (see modules/crypto's legacy-format
 * check) — any `api_key` issued for that fake key was never a valid
 * registration either, so there is nothing real to revoke server-side.
 * For a normal unlink of a real key, use `unlinkAccount()` instead.
 */
export async function clearLocalAccountOnly(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_API_KEY);
  await SecureStore.deleteItemAsync(KEY_DEVICE_ID);
  await SecureStore.deleteItemAsync(KEY_ENTITY_ID);
  await SecureStore.deleteItemAsync(KEY_ENTITY_NAME);
  await SecureStore.deleteItemAsync(KEY_ENTITY_SLUG);
}

export async function getLinkedAccount(): Promise<LinkedAccount | null> {
  const apiKey = await SecureStore.getItemAsync(KEY_API_KEY);
  if (!apiKey) return null;
  return {
    apiKey,
    deviceId:   (await SecureStore.getItemAsync(KEY_DEVICE_ID))   ?? '',
    entityId:   (await SecureStore.getItemAsync(KEY_ENTITY_ID))   ?? '',
    entityName: (await SecureStore.getItemAsync(KEY_ENTITY_NAME)) ?? '',
    entitySlug: await SecureStore.getItemAsync(KEY_ENTITY_SLUG),
  };
}

export interface UnlinkResult {
  /** true = the server confirmed the device key is dead (revoked now, or was
   *  already invalid). false = only the local copy was wiped — the key may
   *  still be live on the server and must be revoked from the profile. */
  revokedOnServer: boolean;
  reason?: string;
}

/**
 * Unlink = revoke on the server FIRST, then wipe local keys (14.11 / api 1.25).
 *
 * Before 14.11 this only cleared SecureStore, so the device key stayed valid
 * forever on the server (known-issues 6.6b). `POST /devices/self-revoke` is
 * authenticated by the device key itself, so it can only ever kill this
 * device. Local wipe always happens — a phone must be able to unlink while
 * offline — but the caller gets an honest result so the UI never claims
 * "revoked" when it wasn't (see the 14.8/14.10/6.7 fake-"done" history).
 */
export async function unlinkAccount(): Promise<UnlinkResult> {
  const apiKey = await SecureStore.getItemAsync(KEY_API_KEY);
  let result: UnlinkResult;

  if (!apiKey) {
    result = { revokedOnServer: false, reason: 'No device key stored on this phone' };
  } else {
    try {
      const res = await fetch(`${API_BASE}/devices/self-revoke`, {
        method: 'POST',
        headers: { 'X-Device-Api-Key': apiKey },
      });
      if (res.ok || res.status === 401) {
        // 401 = the server no longer knows this key (already revoked from the
        // profile / by support) — either way it cannot upload anymore.
        result = { revokedOnServer: true };
      } else {
        result = { revokedOnServer: false, reason: `Server error ${res.status}` };
      }
    } catch (e) {
      result = { revokedOnServer: false, reason: e instanceof Error ? e.message : 'Network error' };
    }
  }

  await SecureStore.deleteItemAsync(KEY_API_KEY);
  await SecureStore.deleteItemAsync(KEY_DEVICE_ID);
  await SecureStore.deleteItemAsync(KEY_ENTITY_ID);
  await SecureStore.deleteItemAsync(KEY_ENTITY_NAME);
  await SecureStore.deleteItemAsync(KEY_ENTITY_SLUG);
  return result;
}

/**
 * QR payload from tetapi.dev:
 * { token: string, entity_id: string, entity_name: string, expires_in: number }
 */
export async function registerWithQR(
  qrPayload: string,
  publicKeyPem: string,
  deviceFingerprint: string,
): Promise<LinkedAccount> {
  let parsed: { token: string; entity_id: string; entity_name: string };
  try {
    parsed = JSON.parse(qrPayload);
  } catch {
    throw new Error('Invalid QR code');
  }

  if (!parsed.token || !parsed.entity_id) {
    throw new Error('QR code missing required fields');
  }

  const res = await fetch(`${API_BASE}/devices/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registration_token: parsed.token,
      device_fingerprint: deviceFingerprint,
      device_public_key: publicKeyPem,
      label: 'Pi CAM',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(err['detail'] ?? `Server error ${res.status}`);
  }

  const data = await res.json() as {
    device_id: string;
    api_key: string;
    entity_id: string;
    entity_name: string;
    entity_slug: string | null;
  };

  await SecureStore.setItemAsync(KEY_API_KEY,     data.api_key);
  await SecureStore.setItemAsync(KEY_DEVICE_ID,   data.device_id);
  await SecureStore.setItemAsync(KEY_ENTITY_ID,   data.entity_id);
  await SecureStore.setItemAsync(KEY_ENTITY_NAME, data.entity_name);
  if (data.entity_slug) await SecureStore.setItemAsync(KEY_ENTITY_SLUG, data.entity_slug);

  return {
    apiKey:     data.api_key,
    deviceId:   data.device_id,
    entityId:   data.entity_id,
    entityName: data.entity_name,
    entitySlug: data.entity_slug ?? null,
  };
}

export interface UploadResult {
  mediaId: string;
  c2paVerified: boolean;
  tetaPiVerified: boolean;
  bitcoinStatus: string;
}

/**
 * Upload a signed photo/video to TETA+PI.
 * Called after capture if account is linked. Fire-and-forget is acceptable.
 *
 * `contentSignature`/`signatureAlg` (14.12) are the device's ECDSA signature
 * over the SHA-256 hash of the file's raw bytes — the backend recomputes
 * that hash from `file` itself and verifies `content_signature` against it
 * using the device's registered public key. Kept as separate FormData
 * fields, not embedded in `manifest_json`, so they're never confused with
 * the (currently unverified) C2PA claim signature inside the manifest.
 */
export async function uploadMedia(
  fileUri: string,
  mimeType: string,
  manifestJson: string,
  capturedAt: string,
  contentSignature: string,
  signatureAlg: string,
): Promise<UploadResult> {
  const account = await getLinkedAccount();
  if (!account) throw new Error('No linked account');

  const form = new FormData();
  form.append('file', {
    uri: fileUri,
    name: `capture.${mimeType === 'video/mp4' ? 'mp4' : 'jpg'}`,
    type: mimeType,
  } as unknown as Blob);
  form.append('manifest_json', manifestJson);
  form.append('captured_at', capturedAt);
  form.append('content_signature', contentSignature);
  form.append('signature_alg', signatureAlg);

  const res = await fetch(`${API_BASE}/media/device-upload`, {
    method: 'POST',
    headers: { 'X-Device-Api-Key': account.apiKey },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(err['detail'] ?? `Upload failed ${res.status}`);
  }

  const data = await res.json() as {
    media_id: string;
    c2pa_verified: boolean;
    teta_pi_verified: boolean;
    bitcoin_status: string;
  };

  return {
    mediaId:        data.media_id,
    c2paVerified:   data.c2pa_verified,
    tetaPiVerified: data.teta_pi_verified,
    bitcoinStatus:  data.bitcoin_status,
  };
}
