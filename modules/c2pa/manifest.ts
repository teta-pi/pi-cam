import type { C2PAManifest, CaptureMetadata } from './types';

// C2PA spec: https://c2pa.org/specifications/specifications/1.4/specs/C2PA_Specification.html
// Phase 1: JSON sidecar (JUMBF embedding in Phase 2)

export function buildManifest(
  contentHash: string,
  publicKey: string,
  meta: CaptureMetadata
): C2PAManifest {
  const now = new Date().toISOString();
  // XMP instance ID — unique per capture
  const instanceId = `xmp:iid:picam-${contentHash.slice(0, 16)}-${Date.now()}`;

  const assertions = [
    // C2PA §13.3: Hard binding via content hash
    {
      label: 'c2pa.hash.data',
      data: {
        alg: 'sha256',
        hash: contentHash,
        exclusions: [],
      },
    },
    // C2PA §15: Actions assertion — creation provenance
    {
      label: 'c2pa.actions',
      data: {
        actions: [
          {
            action: 'c2pa.created',
            when: now,
            softwareAgent: `PiCAM/${meta.appVersion}`,
            digitalSourceType:
              'https://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture',
          },
        ],
      },
    },
    // C2PA §16: Metadata (non-private Dublin Core + XMP fields)
    {
      label: 'c2pa.metadata',
      data: {
        'dc:format': meta.format,
        'dc:rights': 'Captured with Pi CAM — authenticity provable via C2PA',
        'xmpMM:DocumentID': instanceId,
        'xmpMM:InstanceID': instanceId,
        'photoshop:DateCreated': now,
        'Iptc4xmpExt:DigitalSourceType':
          'https://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture',
      },
    },
    // GPS (if enabled)
    ...(meta.gpsEnabled && meta.latitude !== undefined
      ? [{
          label: 'stds.exif',
          data: {
            'exif:GPSLatitude': meta.latitude,
            'exif:GPSLongitude': meta.longitude,
            'exif:GPSAltitudeRef': 0,
          },
        }]
      : []),
    // Producer identity — links back to the public TETA+PI profile (GTM C2PA loop)
    ...(meta.producerUrl
      ? [{
          label: 'c2pa.producer',
          data: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'schema:url': meta.producerUrl,
            'schema:identifier': meta.producerUrl,
          },
        }]
      : []),
  ];

  const dateLabel = now.slice(0, 16).replace('T', ' '); // "2026-06-04 14:47"

  return {
    claim_generator: `PiCAM/${meta.appVersion}`,
    claim_generator_info: [
      { name: 'Pi CAM', version: meta.appVersion },
    ],
    title: `Pi CAM · ${meta.format === 'video/mp4' ? 'Video' : 'Photo'} · ${dateLabel}`,
    format: meta.format,
    instance_id: instanceId,
    assertions,
    signature_info: {
      alg: 'ecdsa-with-SHA256',   // IANA registered algorithm name
      issuer: 'Pi CAM Device Key',
      cert_serial_number: publicKey.slice(0, 16),
      time: now,
    },
    ca_certificate: null,
    timestamp: null,
    signed_at: now,
  };
}

export function serializeManifest(manifest: C2PAManifest): string {
  return JSON.stringify(manifest, null, 2);
}
