// Preview Screen — S-05. Shows photo + verification details + tabs.

function PreviewScreen({ photo = PHOTOS[0], onClose }) {
  const t = useTheme();
  const [tab, setTab] = React.useState('details');
  const [copied, setCopied] = React.useState(null);

  const copy = (k) => { setCopied(k); setTimeout(() => setCopied(null), 1600); };

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.text, display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK }}>
      {/* Nav */}
      <div style={{
        height: 52, paddingTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: `0.5px solid ${t.border}`, background: t.bg, position: 'relative', zIndex: 2,
      }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: t.text }}>
          <IconClose size={24}/>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Preview</div>
        <button style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: t.text }}>
          <IconMore size={24}/>
        </button>
      </div>

      {/* Media + badge overlay */}
      <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3' }}>
        <FauxPhoto photo={photo} style={{ width: '100%', height: '100%' }}/>
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <VerificationBadge status={photo.status}
            label={photo.status === 'ca' ? 'Pi Verified' : 'Device Signed'}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `0.5px solid ${t.border}`, paddingTop: 0 }}>
        {['details', 'technical'].map((id) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, height: 44, border: 'none', background: 'transparent',
              fontFamily: FONT_STACK, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              color: active ? t.purple : t.textMuted,
              borderBottom: `2px solid ${active ? t.purple : 'transparent'}`,
              textTransform: 'capitalize',
            }}>{id}</button>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'details' ? (
          <DetailsTab photo={photo} t={t} copy={copy} copied={copied}/>
        ) : (
          <TechnicalTab photo={photo} t={t} copy={copy} copied={copied}/>
        )}
      </div>

      {/* Action bar */}
      <div style={{
        padding: '12px 16px', display: 'flex', gap: 12,
        background: t.bg, borderTop: `0.5px solid ${t.border}`,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.04)',
      }}>
        <PrimaryButton fullWidth icon={IconShare}>Share</PrimaryButton>
        <SecondaryButton fullWidth>Save</SecondaryButton>
      </div>

      {/* copy toast */}
      {copied && (
        <div style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          padding: '8px 14px', background: t.navy, color: '#fff',
          borderRadius: 9999, fontFamily: FONT_STACK, fontSize: 12, fontWeight: 600,
          animation: 'pic-toast-in 250ms', zIndex: 5,
        }}>Copied!</div>
      )}
    </div>
  );
}

function DetailsRow({ Icon, label, value, mono, action, t }) {
  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center', padding: '0 16px',
      borderBottom: `0.5px solid ${t.borderSoft}`, marginLeft: 0,
    }}>
      <div style={{ width: 32, display: 'grid', placeItems: 'center', color: t.purple }}>
        <Icon size={20} color={t.purple}/>
      </div>
      <div style={{ flex: 1, marginLeft: 4, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
        <div style={{
          fontSize: mono ? 13 : 14, color: mono ? t.mono : t.textBody,
          fontFamily: mono ? MONO_STACK : FONT_STACK, marginTop: 2,
        }}>{value}</div>
      </div>
      {action}
    </div>
  );
}

function DetailsTab({ photo, t, copy, copied }) {
  const copyBtn = (k) => (
    <button onClick={() => copy(k)} style={{
      background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, color: t.grayLt,
    }}>
      <IconCopy size={16}/>
    </button>
  );
  return (
    <div>
      <DetailsRow Icon={IconCal} label="Captured" value={photo.date} t={t}/>
      <DetailsRow Icon={IconDevice} label="Device" value={photo.device} t={t}/>
      <DetailsRow Icon={IconPin} label="Location" value={photo.loc} t={t}/>
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-start' }}>
        <VerificationBadge status={photo.status} label={photo.status === 'ca' ? 'Pi Verified · L1 trust' : 'Device Signed · L0 trust'}/>
      </div>
      <DetailsRow Icon={IconKey} label="Public Key" value={photo.key} mono action={copyBtn('key')} t={t}/>
      <DetailsRow Icon={IconHash} label="SHA-256" value={photo.hash} mono action={copyBtn('hash')} t={t}/>
      {photo.status === 'ca' && <DetailsRow Icon={IconAward} label="CA Certificate" value="Issued by Pi CA" t={t}/>}
      <DetailsRow Icon={IconClock} label="Timestamp (RFC 3161)" value={`${photo.date.split(' ').slice(0,3).join(' ')}T${photo.date.split(' ')[3] || '14:32:09'}Z`} mono t={t}/>
      <div style={{ height: 24 }}/>
    </div>
  );
}

function TechnicalTab({ photo, t }) {
  const manifest = sampleManifest(photo);
  return (
    <div style={{ padding: 16, fontFamily: MONO_STACK, fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT_STACK, fontSize: 13, fontWeight: 600, color: t.textMuted }}>C2PA Manifest</span>
        <GhostButton style={{ height: 32, padding: '0 12px', fontSize: 12, color: t.purple, fontWeight: 600 }}>Copy All</GhostButton>
      </div>
      <pre style={{
        margin: 0, padding: 12, background: t.bgCode, borderRadius: 8, color: t.textBody,
        whiteSpace: 'pre', overflow: 'auto', lineHeight: 1.5,
      }}>{manifest}</pre>
    </div>
  );
}

function sampleManifest(p) {
  return `{
  "claim_generator": "PiCAM/1.0 c2pa-js",
  "title": "${p.id}.heic",
  "format": "image/heic",
  "assertions": [
    { "label": "c2pa.created", "data": { "when": "${p.date}" }},
    { "label": "c2pa.hash.data", "data": { "alg": "sha256",
      "hash": "${p.hash}" }},
    { "label": "stds.exif", "data": { "GPS": "${p.loc}" }}
  ],
  "signature_info": {
    "alg": "Ed25519",
    "key": "${p.key}",
    "device": "${p.device}"
  },
  "ca_certificate": ${p.status === 'ca' ? '"Pi CA Root"' : 'null'},
  "timestamp": "RFC3161"
}`;
}

Object.assign(window, { PreviewScreen });
