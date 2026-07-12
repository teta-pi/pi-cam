export interface C2PAAssertion {
  label: string;
  data: Record<string, unknown>;
}

export interface C2PAManifest {
  claim_generator: string;
  claim_generator_info: Array<{ name: string; version: string }>;
  title: string;
  format: string;
  instance_id: string;
  assertions: C2PAAssertion[];
  signature_info: {
    alg: string;
    issuer: string;
    cert_serial_number: string;
    time: string;
  };
  ca_certificate: string | null;
  timestamp: string | null;
  signed_at: string;
}

export interface SignedFile {
  uri: string;
  manifest: C2PAManifest;
  contentHash: string;
  signature: string;
}

export interface VerifyResult {
  status: 'ca' | 'device' | 'tampered' | 'none';
  manifest: C2PAManifest | null;
  contentHash: string | null;
  message?: string;
}

export interface CaptureMetadata {
  filename: string;
  format: string;
  device: string;
  gpsEnabled: boolean;
  latitude?: number;
  longitude?: number;
  appVersion: string;
  producerUrl?: string; // public TETA+PI profile URL, e.g. https://app.tetapi.dev/e/{slug}
}
