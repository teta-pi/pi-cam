// Shared UI primitives for Pi CAM. Built on tokens from lib/tokens.jsx.
// VerificationBadge, ShutterButton, SigningToast, button family, FocusRing.

// ── Verification Badge ─────────────────────────────────────────────────────
// Five states from S-01. Compact + standard sizes.
function VerificationBadge({ status = 'ca', size = 'md', label, style }) {
  const t = useTheme();
  const skin = {
    device: t.badgeDevice,
    ca: t.badgeCa,
    error: t.badgeError,
    signing: t.badgeSign,
    certifying: t.badgeSign,
  }[status];
  const text = label || {
    device: 'Device Signed',
    ca: 'Pi Verified',
    error: 'Verification failed',
    signing: 'Signing…',
    certifying: 'Certifying…',
  }[status];
  const Icon = {
    device: IconShield,
    ca: IconShieldCheck,
    error: IconShieldX,
    signing: IconShield,
    certifying: IconSparkle,
  }[status];
  const compact = size === 'sm';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: compact ? '4px 10px' : '6px 12px',
      borderRadius: RADIUS.full,
      background: skin.bg, border: `1px solid ${skin.border}`,
      color: skin.text,
      fontFamily: FONT_STACK, fontSize: compact ? 11 : 12, fontWeight: 600,
      letterSpacing: 0.1, ...style,
    }}>
      <Icon size={compact ? 12 : 14} color={skin.text} stroke={2.2}/>
      <span>{text}</span>
      {status === 'signing' && <Spinner size={10} color={skin.text}/>}
      {status === 'certifying' && <Pulse color={skin.text}/>}
    </div>
  );
}

function Spinner({ size = 12, color = '#fff' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.5px solid ${color}33`, borderTopColor: color,
      animation: 'pic-spin 0.8s linear infinite',
    }} />
  );
}

function Pulse({ color = '#fff' }) {
  return (
    <div style={{
      width: 6, height: 6, borderRadius: '50%', background: color,
      animation: 'pic-pulse 1.2s ease-in-out infinite',
    }} />
  );
}

// ── Shutter ─────────────────────────────────────────────────────────────────
// 80dp white circle, 88dp purple ring. Spring-press scale via CSS.
function ShutterButton({ mode = 'photo', recording = false, onPress }) {
  const t = useTheme();
  const [press, setPress] = React.useState(false);
  return (
    <button
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerLeave={() => setPress(false)}
      onClick={onPress}
      aria-label="Take photo, button"
      style={{
        width: 88, height: 88, borderRadius: '50%',
        border: `3px solid ${t.purple}`,
        background: 'transparent', padding: 0, cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        transform: press ? 'scale(0.92)' : 'scale(1)',
        transition: 'transform 200ms cubic-bezier(.2,1.2,.4,1)',
        position: 'relative',
      }}
    >
      <div style={{
        width: mode === 'video' ? (recording ? 28 : 70) : 74,
        height: mode === 'video' ? (recording ? 28 : 70) : 74,
        borderRadius: mode === 'video' && recording ? 6 : '50%',
        background: mode === 'video' ? t.alert : '#FFFFFF',
        transition: 'all 220ms cubic-bezier(.2,1.2,.4,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
      {recording && (
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: `3px solid ${t.alert}`, opacity: 0.6,
          animation: 'pic-ring 1.2s ease-in-out infinite',
        }} />
      )}
    </button>
  );
}

// ── Camera control button (44dp round, dark backdrop) ──────────────────────
function CamControl({ children, onClick, active, label }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: 44, height: 44, borderRadius: '50%', border: 'none', padding: 0,
      background: active ? 'rgba(108,99,255,0.9)' : 'rgba(26,26,46,0.55)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'grid', placeItems: 'center', cursor: 'pointer',
      color: '#fff', transition: 'background 150ms',
    }}>{children}</button>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, fullWidth, style, icon: Icon }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      height: 52, padding: '0 24px', borderRadius: RADIUS.lg, border: 'none',
      background: t.purple, color: '#fff', fontFamily: FONT_STACK,
      fontSize: 16, fontWeight: 700, cursor: 'pointer',
      width: fullWidth ? '100%' : undefined,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: '0 8px 20px rgba(108,99,255,0.3)', ...style,
    }}>
      {Icon && <Icon size={18} color="#fff"/>}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, fullWidth, style }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      height: 48, padding: '0 20px', borderRadius: RADIUS.lg,
      border: `1.5px solid ${t.purple}`,
      background: 'transparent', color: t.purple, fontFamily: FONT_STACK,
      fontSize: 15, fontWeight: 600, cursor: 'pointer',
      width: fullWidth ? '100%' : undefined, ...style,
    }}>{children}</button>
  );
}

function GhostButton({ children, onClick, style }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      height: 44, padding: '0 16px', borderRadius: RADIUS.md, border: 'none',
      background: 'transparent', color: t.textBody, fontFamily: FONT_STACK,
      fontSize: 15, fontWeight: 500, cursor: 'pointer', ...style,
    }}>{children}</button>
  );
}

function DangerButton({ children, onClick, fullWidth, style }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      height: 48, padding: '0 20px', borderRadius: RADIUS.lg, border: 'none',
      background: t.alert, color: '#fff', fontFamily: FONT_STACK,
      fontSize: 15, fontWeight: 700, cursor: 'pointer',
      width: fullWidth ? '100%' : undefined, ...style,
    }}>{children}</button>
  );
}

// ── Pill toggle (Photo | Video) ────────────────────────────────────────────
function PillToggle({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex', height: 32, padding: 3, borderRadius: 9999,
      background: 'rgba(26,26,46,0.55)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          height: 26, padding: '0 14px', borderRadius: 9999, border: 'none',
          background: value === o.value ? '#fff' : 'transparent',
          color: value === o.value ? '#1A1A2E' : '#fff',
          fontFamily: FONT_STACK, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          transition: 'background 150ms',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ── Signing Toast ──────────────────────────────────────────────────────────
function SigningToast({ phase, visible }) {
  if (!visible) return null;
  const t = useTheme();
  const cfg = {
    signing:    { text: 'Signing…',     icon: <Spinner size={12} color="#fff"/>, bg: 'rgba(26,26,46,0.9)', fg: '#fff' },
    signed:     { text: 'Device Signed', icon: <IconShieldCheck size={14} color="#FCD34D"/>, bg: 'rgba(26,26,46,0.9)', fg: '#fff' },
    certifying: { text: 'Certifying…',  icon: <IconSparkle size={14} color="#C7C3FF"/>, bg: 'rgba(26,26,46,0.9)', fg: '#fff' },
    verified:   { text: 'Pi Verified',  icon: <IconShieldCheck size={14} color="#7EE2A8"/>, bg: 'rgba(6,95,70,0.92)', fg: '#fff' },
    error:      { text: 'Signing failed — Retry', icon: <IconAlert size={14} color="#FCA5A5"/>, bg: 'rgba(153,27,27,0.92)', fg: '#fff' },
  }[phase] || {};
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: 248, transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', borderRadius: RADIUS.full,
      background: cfg.bg, color: cfg.fg, backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      fontFamily: FONT_STACK, fontSize: 13, fontWeight: 600,
      animation: 'pic-toast-in 250ms cubic-bezier(.2,1.2,.4,1)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
      zIndex: 30,
    }}>
      {cfg.icon}<span>{cfg.text}</span>
    </div>
  );
}

// ── Tab Bar ────────────────────────────────────────────────────────────────
function TabBar({ tab, onChange, theme = 'dark' }) {
  const t = useTheme();
  const dark = theme === 'dark';
  const tabs = [
    { id: 'camera', label: 'Camera', Icon: IconCamera },
    { id: 'gallery', label: 'Gallery', Icon: IconImage },
    { id: 'settings', label: 'Settings', Icon: IconSettings },
  ];
  return (
    <div style={{
      display: 'flex', height: 56,
      background: dark ? t.navy : t.bg,
      borderTop: dark ? 'none' : `0.5px solid ${t.border}`,
      paddingBottom: 0,
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 2, border: 'none', background: 'transparent',
            color: active ? t.purple : (dark ? '#888' : t.textMuted),
            fontFamily: FONT_STACK, fontSize: 10, fontWeight: 600, cursor: 'pointer',
          }}>
            <Icon size={24} stroke={active ? 2.2 : 1.8}/>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Focus ring overlay (camera screen tap-to-focus) ───────────────────────
function FocusRing({ x, y, key: k }) {
  return (
    <div style={{
      position: 'absolute', left: x - 30, top: y - 30,
      width: 60, height: 60, border: '2px solid #F5A623',
      pointerEvents: 'none',
      animation: 'pic-focus 1.5s ease-out forwards',
    }} />
  );
}

// ── Inject global keyframes (one-shot) ─────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('pic-kf')) {
  const s = document.createElement('style');
  s.id = 'pic-kf';
  s.textContent = `
    @keyframes pic-spin { to { transform: rotate(360deg); } }
    @keyframes pic-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.7); } }
    @keyframes pic-ring { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.08); } }
    @keyframes pic-toast-in { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
    @keyframes pic-focus { 0% { opacity: 1; transform: scale(1.4); } 60% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1); } }
    @keyframes pic-flash { 0%,100% { opacity: 0; } 30% { opacity: 0.9; } }
    @keyframes pic-dot-pulse { 0%,80%,100% { opacity: 0.2; transform: scale(0.7); } 40% { opacity: 1; transform: scale(1); } }
    @keyframes pic-dash { to { stroke-dashoffset: 0; } }
    @keyframes pic-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pic-glyph-rise { 0% { opacity: 0; transform: translate(var(--gx,0px), 20px) scale(0.6); } 60% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--gx,0px), -60px) scale(1); } }
    @keyframes pic-shockwave { 0% { opacity: 0.8; transform: translate(-50%,-50%) scale(0.4); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(3); } }
    @keyframes pic-stamp { 0% { opacity: 0; transform: translate(-50%,-50%) scale(2.2); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(0.95); } 70% { transform: translate(-50%,-50%) scale(1.02); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
    @keyframes pic-scan { 0% { transform: translateY(-100%); opacity: 0.8; } 100% { transform: translateY(100%); opacity: 0; } }
    @keyframes pic-hash-stream { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  VerificationBadge, ShutterButton, CamControl,
  PrimaryButton, SecondaryButton, GhostButton, DangerButton,
  PillToggle, SigningToast, TabBar, FocusRing, Spinner, Pulse,
});
