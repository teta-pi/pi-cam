// Verify Screen — S-07. Drop zone, verifying state, result card.
// Internal state cycles on tap of "Try sample".

function VerifyScreen({ onClose }) {
  const t = useTheme();
  const [state, setState] = React.useState('idle'); // idle, verifying, ca, device, tampered, none
  const [progress, setProgress] = React.useState(0);

  const trigger = (target) => {
    setState('verifying'); setProgress(0);
    const iv = setInterval(() => setProgress(p => Math.min(100, p + 8)), 60);
    setTimeout(() => { clearInterval(iv); setState(target); setProgress(100); }, 1400);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.text, display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK }}>
      {/* Nav */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: `0.5px solid ${t.border}`,
      }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: t.text }}>
          <IconBack size={24}/>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Verify Content</div>
        <div style={{ width: 32 }}/>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(state === 'idle' || state === 'verifying') && (
          <DropZone t={t} verifying={state === 'verifying'} progress={progress} onPick={() => trigger('ca')}/>
        )}

        {state === 'verifying' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 12, background: t.bgAlt, borderRadius: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
            }}>
              <FauxPhoto photo={PHOTOS[2]} style={{ width: '100%', height: '100%' }}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>IMG_3892.heic</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>4.2 MB</div>
              <div style={{
                marginTop: 6, height: 4, background: t.lavender, borderRadius: 2, overflow: 'hidden',
              }}>
                <div style={{ width: `${progress}%`, height: '100%', background: t.purple, transition: 'width 200ms' }}/>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: t.textMuted, fontFamily: MONO_STACK }}>
                Checking C2PA manifest…
              </div>
            </div>
          </div>
        )}

        {['ca','device','tampered','none'].includes(state) && (
          <ResultCard state={state} t={t} onReset={() => setState('idle')}/>
        )}

        {/* sample triggers */}
        {state === 'idle' && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
              Try a sample
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <SampleChip t={t} label="✓ Pi Verified"   color={t.verified} onClick={() => trigger('ca')}/>
              <SampleChip t={t} label="● Device Only"   color={t.device}   onClick={() => trigger('device')}/>
              <SampleChip t={t} label="✕ Tampered"      color={t.alert}    onClick={() => trigger('tampered')}/>
              <SampleChip t={t} label="?  No manifest"  color={t.grayMid}  onClick={() => trigger('none')}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SampleChip({ label, color, onClick, t }) {
  return (
    <button onClick={onClick} style={{
      height: 44, borderRadius: 12, padding: '0 12px', border: `1px solid ${t.borderSoft}`,
      background: t.bgAlt, color: t.textBody, fontFamily: FONT_STACK, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start',
    }}>
      <span style={{ color }}>{label}</span>
    </button>
  );
}

function DropZone({ verifying, progress, onPick, t }) {
  return (
    <div style={{
      height: 200, borderRadius: 16,
      border: verifying ? `2px solid ${t.purple}` : `2px dashed ${t.purple}`,
      background: verifying ? t.lavender : t.lavender,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 24, textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {verifying && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
          <HashStream speed={4} color="rgba(108,99,255,0.6)"/>
        </div>
      )}
      <IconCloudUp size={44} color={t.purple}/>
      <div style={{ fontSize: 15, color: t.textMuted, fontWeight: 500 }}>
        {verifying ? 'Analyzing…' : 'Drop photo or video here'}
      </div>
      {!verifying && <SecondaryButton onClick={onPick}>Choose File</SecondaryButton>}
    </div>
  );
}

function ResultCard({ state, t, onReset }) {
  const cfg = {
    ca:       { topColor: t.verified, header: 'Content Authentic',  Icon: IconShieldCheck, iconColor: t.verified, body: t.badgeCa },
    device:   { topColor: t.device,   header: 'Device Verified',    Icon: IconShield,      iconColor: t.device,   body: t.badgeDevice },
    tampered: { topColor: t.alert,    header: 'Tampering Detected', Icon: IconShieldX,     iconColor: t.alert,    body: t.badgeError },
    none:     { topColor: t.alert,    header: 'No Verification Data',Icon: IconAlert,      iconColor: t.alert,    body: t.badgeError },
  }[state];

  return (
    <div style={{
      borderRadius: 12, background: t.bg, overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(26,26,46,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
      borderTop: `4px solid ${cfg.topColor}`,
      animation: 'pic-fade-in 300ms ease-out',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: cfg.body.bg }}>
        <cfg.Icon size={28} color={cfg.iconColor} stroke={2.2}/>
        <div style={{ fontSize: 18, fontWeight: 700, color: cfg.body.text }}>{cfg.header}</div>
      </div>

      {state === 'ca' && (
        <>
          <DetailsRow Icon={IconCal} label="Captured" value="23 May 2026 17:44" t={t}/>
          <DetailsRow Icon={IconDevice} label="Device" value="iPhone 16 Pro" t={t}/>
          <DetailsRow Icon={IconAward} label="CA Certificate" value="Issued by Pi CA · valid" t={t}/>
          <DetailsRow Icon={IconHash} label="SHA-256" value={`b271...d501 ✓`} mono t={t}/>
        </>
      )}
      {state === 'device' && (
        <>
          <DetailsRow Icon={IconDevice} label="Device" value="iPhone 16 Pro" t={t}/>
          <DetailsRow Icon={IconKey} label="Public Key" value="A3F9...2B1C" mono t={t}/>
          <DetailsRow Icon={IconHash} label="SHA-256" value={`8c1d...4e92 ✓`} mono t={t}/>
          <DetailsRow Icon={IconAward} label="CA Certificate" value="None — offline at capture" t={t}/>
        </>
      )}
      {state === 'tampered' && (
        <>
          <DetailsRow Icon={IconAlert} label="Hash Mismatch" value="Image bytes were altered after signing." t={t}/>
          <DetailsRow Icon={IconHash} label="Expected" value="3e4f...a1b2" mono t={t}/>
          <DetailsRow Icon={IconHash} label="Computed" value="9c12...??ff" mono t={t}/>
        </>
      )}
      {state === 'none' && (
        <div style={{ padding: 20, color: t.textBody, fontSize: 14, lineHeight: 1.5 }}>
          No C2PA manifest found in this file. Cannot establish provenance or authenticity.
        </div>
      )}

      <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
        <GhostButton onClick={onReset} style={{ color: t.purple, fontWeight: 600 }}>Verify Another</GhostButton>
      </div>
    </div>
  );
}

Object.assign(window, { VerifyScreen });
