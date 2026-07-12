export interface KeyInfo {
  publicKeyPem: string;
  publicKeyShort: string; // "A3F9···2B1C"
  algorithm: 'ECDSA-P256';
  createdAt: string; // ISO 8601
}
