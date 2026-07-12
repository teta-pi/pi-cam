/**
 * CertificateModule — Pi CA integration.
 * Phase 1: симуляція для тестування UI.
 * Phase 2: реальний запит до https://ca.picam.app/v1/
 */

import * as SecureStore from 'expo-secure-store';

const CA_CERT_KEY = 'pi_ca_certificate';
const CA_CERT_EXPIRY_KEY = 'pi_ca_certificate_expiry';
const CA_BASE = 'https://ca.picam.app/api/v1';

export type CertStatus = 'none' | 'pending' | 'active' | 'expired';

export interface CertInfo {
  status: CertStatus;
  expiresAt?: string;
  issuedAt?: string;
}

export interface CACertResult {
  certificate: string;
  timestampToken: string;
  caManifestExtension: string;
}

// ── Certificate status ────────────────────────────────────────────────────────

export async function getCertInfo(): Promise<CertInfo> {
  try {
    const cert = await SecureStore.getItemAsync(CA_CERT_KEY);
    const expiry = await SecureStore.getItemAsync(CA_CERT_EXPIRY_KEY);
    if (!cert) return { status: 'none' };
    if (expiry && new Date(expiry) < new Date()) return { status: 'expired' };
    return { status: 'active', expiresAt: expiry ?? undefined };
  } catch {
    return { status: 'none' };
  }
}

// ── Request certificate ───────────────────────────────────────────────────────

export async function requestCACertificate(publicKeyPem: string): Promise<boolean> {
  // Phase 2: реальний запит до CA сервера
  // const res = await fetch(`${CA_BASE}/issue-certificate`, { ... });

  // Phase 1: симуляція для тестування UI
  await new Promise(resolve => setTimeout(resolve, 2000));

  const issuedAt = new Date();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await SecureStore.setItemAsync(CA_CERT_KEY, 'SIMULATED_CERT_' + publicKeyPem.slice(0, 16));
  await SecureStore.setItemAsync(CA_CERT_EXPIRY_KEY, expiresAt.toISOString());

  return true;
}

// ── Revoke ────────────────────────────────────────────────────────────────────

export async function revokeCertificate(): Promise<void> {
  await SecureStore.deleteItemAsync(CA_CERT_KEY);
  await SecureStore.deleteItemAsync(CA_CERT_EXPIRY_KEY);
}

// ── Register device ───────────────────────────────────────────────────────────

export async function registerDevice(
  publicKeyPem?: string,
  deviceModel?: string,
  platform?: 'ios' | 'android',
  appVersion?: string,
): Promise<{ deviceId: string; jwtToken: string }> {
  // Phase 2: реальна реєстрація
  // const res = await fetch(`${CA_BASE}/register`, { ... });

  // Phase 1: stub
  return { deviceId: 'simulated-device-id', jwtToken: 'simulated-jwt' };
}

// ── Full CA signing (Phase 2) ─────────────────────────────────────────────────

export async function requestCASign(
  contentHash: string,
  deviceSignature: string,
  captureTimestamp: string,
  manifestHash: string,
  jwtToken: string,
): Promise<CACertResult> {
  const res = await fetch(`${CA_BASE}/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({
      content_hash: contentHash,
      device_signature: deviceSignature,
      capture_timestamp: captureTimestamp,
      manifest_hash: manifestHash,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(err['code'] ?? `CA error ${res.status}`);
  }

  const data = await res.json() as Record<string, string>;
  return {
    certificate: data['certificate'],
    timestampToken: data['timestamp_token'],
    caManifestExtension: data['ca_manifest_extension'],
  };
}
