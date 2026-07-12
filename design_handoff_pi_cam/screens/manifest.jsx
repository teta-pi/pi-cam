// Manifest Viewer — S-10. Collapsible JSON tree with syntax highlighting.

const MANIFEST_SAMPLE = {
  claim_generator: 'PiCAM/1.0 c2pa-js',
  title: 'IMG_3892.heic',
  format: 'image/heic',
  assertions: [
    { label: 'c2pa.created', data: { when: '2026-05-24T14:32:07Z', editor: null }},
    { label: 'c2pa.hash.data', data: { alg: 'sha256', hash: '3e4fa1b288c7…1d09' }},
    { label: 'stds.exif', data: { Make: 'Apple', Model: 'iPhone 16 Pro', GPS: { lat: 50.45, lng: 30.52 } }},
  ],
  signature_info: {
    alg: 'Ed25519',
    key: 'A3F9…2B1C',
    device: 'iPhone 16 Pro',
    issued: true,
  },
  ca_certificate: { issuer: 'Pi CA Root', valid: true, ocsp: 'good' },
  timestamp: { kind: 'RFC3161', value: '2026-05-24T14:32:09Z' },
};

function ManifestViewer({ onClose }) {
  const t = useTheme();
  const [copied, setCopied] = React.useState(false);

  const copyAll = () => {
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bgCode, color: t.text, display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK }}>
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: `0.5px solid ${t.border}`,
        background: t.bg, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: t.text }}>
          <IconClose size={22}/>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFileJson size={18} color={t.purple}/> C2PA Manifest
        </div>
        <button onClick={copyAll} style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: t.purple }}>
          <IconCopy size={20}/>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 80 }}>
        <JsonTree value={MANIFEST_SAMPLE} t={t}/>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px', background: t.bg, borderTop: `0.5px solid ${t.border}`,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
      }}>
        <SecondaryButton fullWidth onClick={copyAll}>
          {copied ? 'Copied to clipboard ✓' : 'Copy Full JSON'}
        </SecondaryButton>
      </div>
    </div>
  );
}

function JsonTree({ value, t }) {
  return (
    <div>
      {Object.entries(value).map(([k, v]) => (
        <JsonNode key={k} k={k} v={v} depth={0} t={t} defaultOpen={k === 'assertions'}/>
      ))}
    </div>
  );
}

function JsonNode({ k, v, depth, t, defaultOpen = false }) {
  const isObj = v !== null && typeof v === 'object';
  const isArr = Array.isArray(v);
  const [open, setOpen] = React.useState(defaultOpen);

  if (!isObj) {
    return (
      <div style={{
        height: 36, display: 'flex', alignItems: 'center',
        paddingLeft: 16 + depth * 16, paddingRight: 16,
        background: depth > 0 ? t.bgCode : t.bg,
        borderBottom: `0.5px solid ${t.borderSoft}`,
        fontFamily: MONO_STACK, fontSize: 12, gap: 4,
        borderLeft: depth > 0 ? `2px solid ${t.purple}` : 'none',
      }}>
        <span style={{ color: t.purple, fontWeight: 700 }}>{k}</span>
        <span style={{ color: t.textMuted }}>:</span>
        <span style={{ color: leafColor(v, t), wordBreak: 'break-all' }}>{formatLeaf(v)}</span>
      </div>
    );
  }

  const len = isArr ? v.length : Object.keys(v).length;
  const previewParts = isArr ? `[${len}]` : Object.keys(v).slice(0, 2).join(', ');

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', height: 44, display: 'flex', alignItems: 'center', gap: 8,
        paddingLeft: 16 + depth * 16, paddingRight: 16,
        background: depth > 0 ? t.bgCode : t.bg, border: 'none',
        borderBottom: `0.5px solid ${t.borderSoft}`,
        cursor: 'pointer', textAlign: 'left',
        borderLeft: depth > 0 ? `2px solid ${t.purple}` : 'none',
      }}>
        {open ? <IconChevDown size={14} color={t.grayLt}/> : <IconChev size={14} color={t.grayLt}/>}
        <span style={{ color: t.purple, fontFamily: MONO_STACK, fontWeight: 700, fontSize: 13 }}>{k}</span>
        <span style={{ color: t.textMuted, fontFamily: MONO_STACK, fontSize: 11 }}>
          {isArr ? `array · ${len} items` : `{ ${previewParts}${Object.keys(v).length > 2 ? '…' : ''} }`}
        </span>
      </button>
      {open && (
        <div>
          {Object.entries(v).map(([ck, cv]) => (
            <JsonNode key={ck} k={isArr ? `[${ck}]` : ck} v={cv} depth={depth + 1} t={t}/>
          ))}
        </div>
      )}
    </>
  );
}

function leafColor(v, t) {
  if (typeof v === 'string') return t.verified;
  if (typeof v === 'number') return t.device;
  if (typeof v === 'boolean') return t.alert;
  if (v === null) return t.textMuted;
  return t.text;
}

function formatLeaf(v) {
  if (typeof v === 'string') return `"${v}"`;
  if (v === null) return 'null';
  return String(v);
}

Object.assign(window, { ManifestViewer, MANIFEST_SAMPLE });
