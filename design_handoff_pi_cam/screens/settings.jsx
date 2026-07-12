// Settings Screen — S-08. iOS-style grouped sections.

function SettingsScreen({ theme, setTheme, online, setOnline, onOpenVerify, onOpenManifest }) {
  const t = useTheme();
  const [resetOpen, setResetOpen] = React.useState(false);
  const [toggles, setToggles] = React.useState({
    location: false, watermark: true, autoCa: true, savePhotos: true,
  });
  const flip = (k) => setToggles(s => ({ ...s, [k]: !s[k] }));

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bgAlt, color: t.text, display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK, overflow: 'auto' }}>
      <div style={{
        padding: '24px 16px 8px', fontSize: 26, fontWeight: 700, letterSpacing: -0.5,
      }}>Settings</div>

      <Section label="Account" t={t}>
        <Row Icon={IconUser} label="Sign in to Pi" t={t} action={<Chevron t={t}/>}/>
      </Section>

      <Section label="Security" t={t}>
        <Row Icon={IconKey} label="Device Key" t={t}
          value={<span style={{ fontFamily: MONO_STACK, fontSize: 13, color: t.mono }}>A3F9···2B1C</span>}
          action={<IconCopy size={16} color={t.grayLt}/>}/>
        <Row Icon={IconShield} label="Trust Level" t={t}
          value={<VerificationBadge status={online ? 'ca' : 'device'} size="sm"
                   label={online ? 'Pi Verified' : 'Device Only'}/>}/>
        <Row Icon={IconAlert} label="Reset Device Key" t={t} danger onClick={() => setResetOpen(true)} action={<Chevron t={t} danger/>}/>
      </Section>

      <Section label="Capture" t={t}>
        <ToggleRow Icon={IconPin} label="Include Location" sub="GPS in manifest" t={t} value={toggles.location} onChange={() => flip('location')}/>
        <ToggleRow Icon={IconDroplet} label="Watermark on Share" sub="Pi badge on shared images" t={t} value={toggles.watermark} onChange={() => flip('watermark')}/>
        <ToggleRow Icon={IconSparkle} label="Auto CA Upgrade" sub="Re-certify when online" t={t} value={toggles.autoCa} onChange={() => { flip('autoCa'); setOnline(!online); }}/>
        <ToggleRow Icon={IconDownload} label="Save to Photos" sub="Auto-save to camera roll" t={t} value={toggles.savePhotos} onChange={() => flip('savePhotos')}/>
      </Section>

      <Section label="Tools" t={t}>
        <Row Icon={IconShieldCheck} label="Verify external content" t={t} onClick={onOpenVerify} action={<Chevron t={t}/>}/>
        <Row Icon={IconFileJson} label="View latest manifest" t={t} onClick={onOpenManifest} action={<Chevron t={t}/>}/>
      </Section>

      <Section label="Appearance" t={t}>
        <Row Icon={IconSparkle} label="Theme" t={t}
          value={
            <div style={{ display: 'flex', background: t.bgAlt, borderRadius: 9999, padding: 3, gap: 2 }}>
              {[['light','Light'],['dark','Dark']].map(([id,l]) => (
                <button key={id} onClick={() => setTheme(id)} style={{
                  height: 26, padding: '0 12px', borderRadius: 9999, border: 'none',
                  background: theme === id ? t.purple : 'transparent',
                  color: theme === id ? '#fff' : t.textMuted,
                  fontFamily: FONT_STACK, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{l}</button>
              ))}
            </div>
          }/>
      </Section>

      <Section label="About" t={t}>
        <Row Icon={IconInfo} label="Version" t={t} value={<span style={{ color: t.textMuted, fontSize: 14 }}>1.0.0 · Build 42</span>}/>
        <Row Icon={IconFile} label="Privacy Policy" t={t} action={<Chevron t={t}/>}/>
      </Section>

      <div style={{ height: 32 }}/>

      {resetOpen && <ResetSheet t={t} onClose={() => setResetOpen(false)}/>}
    </div>
  );
}

function Section({ label, children, t }) {
  return (
    <>
      <div style={{ padding: '20px 16px 8px', fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ margin: '0 16px', borderRadius: 12, background: t.bg, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </>
  );
}

// Row is a <div> (not <button>) so its `value` / `action` slots can safely
// host their own buttons without nesting violations. When onClick is provided
// we add role="button" + keyboard support.
function Row({ Icon, label, value, action, danger, onClick, t }) {
  const onKey = onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined;
  return (
    <div
      onClick={onClick}
      onKeyDown={onKey}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        width: '100%', height: 56, display: 'flex', alignItems: 'center', padding: '0 16px',
        background: 'transparent', cursor: onClick ? 'pointer' : 'default',
        borderBottom: `0.5px solid ${t.borderSoft}`,
      }}
    >
      <Icon size={20} color={danger ? t.alert : t.purple}/>
      <div style={{ marginLeft: 12, flex: 1, fontSize: 16, fontWeight: 500, color: danger ? t.alert : t.text }}>{label}</div>
      {value && <div style={{ marginRight: action ? 8 : 0 }}>{value}</div>}
      {action}
    </div>
  );
}

function Chevron({ t, danger }) {
  return <IconChev size={16} color={danger ? t.alert : t.grayLt}/>;
}

function ToggleRow({ Icon, label, sub, value, onChange, t }) {
  return (
    <div style={{
      height: 64, display: 'flex', alignItems: 'center', padding: '0 16px',
      borderBottom: `0.5px solid ${t.borderSoft}`,
    }}>
      <Icon size={20} color={t.purple}/>
      <div style={{ marginLeft: 12, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: t.text }}>{label}</div>
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 1 }}>{sub}</div>
      </div>
      <Switch value={value} onChange={onChange} t={t}/>
    </div>
  );
}

function Switch({ value, onChange, t }) {
  return (
    <button onClick={onChange} style={{
      width: 51, height: 31, borderRadius: 999, border: 'none', padding: 2,
      background: value ? t.purple : t.grayLt,
      transition: 'background 200ms', cursor: 'pointer', position: 'relative',
    }}>
      <div style={{
        width: 27, height: 27, borderRadius: '50%', background: '#fff',
        transform: `translateX(${value ? 20 : 0}px)`,
        transition: 'transform 200ms', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}/>
    </button>
  );
}

function ResetSheet({ onClose, t }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', zIndex: 50,
      animation: 'pic-fade-in 200ms ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: t.bg, color: t.text, width: '100%',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
      }}>
        <div style={{ width: 36, height: 4, background: t.grayLt, borderRadius: 2, margin: '0 auto 20px' }}/>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: t.badgeError.bg, display: 'grid', placeItems: 'center',
          }}>
            <IconAlert size={28} color={t.alert}/>
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center' }}>Reset Device Key?</div>
        <p style={{ marginTop: 8, fontSize: 14, color: t.textBody, textAlign: 'center', lineHeight: 1.5 }}>
          Photos already signed will keep their signatures. New captures will be signed with a new key — this can&rsquo;t be undone.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <SecondaryButton fullWidth onClick={onClose}>Cancel</SecondaryButton>
          <DangerButton fullWidth onClick={onClose}>Reset</DangerButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
