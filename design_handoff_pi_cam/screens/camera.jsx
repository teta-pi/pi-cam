// Camera Screen — S-03 & S-04. The hero. Three HUD variants × three capture
// animations. Viewfinder is always #111 regardless of theme.
//
// props:
//   hudVariant:      'classic' | 'minimal' | 'cinematic'
//   captureVariant:  'hash' | 'ring' | 'stamp'
//   onOpenPreview:   () => void   — tap thumbnail
//   onOpenSettings:  () => void   — gear icon
//   online:          bool         — controls device/ca badge state

function CameraScreen({
  hudVariant = 'classic', captureVariant = 'hash',
  online = true, onOpenPreview, onOpenSettings,
}) {
  const t = useTheme();
  const [mode, setMode] = React.useState('photo');
  const [flash, setFlash] = React.useState(false);
  const [zoom, setZoom] = React.useState('1x');
  const [recording, setRecording] = React.useState(false);
  const [focusKey, setFocusKey] = React.useState(0);
  const [focusPos, setFocusPos] = React.useState({ x: 0, y: 0 });
  const [captureFx, setCaptureFx] = React.useState(null); // {variant, ts}
  const [toast, setToast] = React.useState(null); // {phase}
  const [lastShot, setLastShot] = React.useState(PHOTOS[0]);

  const onShutter = () => {
    if (mode === 'video') { setRecording(r => !r); return; }
    // Photo flow
    const newPhoto = PHOTOS[Math.floor(Math.random() * 3)];
    setCaptureFx({ variant: captureVariant, ts: Date.now() });
    setToast({ phase: 'signing' });
    setTimeout(() => setToast({ phase: 'signed' }), 700);
    setTimeout(() => setToast({ phase: 'certifying' }), 1700);
    setTimeout(() => setToast({ phase: 'verified' }), 3000);
    setTimeout(() => setToast(null), 4500);
    setTimeout(() => setLastShot(newPhoto), 1000);
  };

  const onViewfinderTap = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setFocusPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    setFocusKey(k => k + 1);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#111',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Viewfinder content (always dark) */}
      <div onClick={onViewfinderTap} style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #2a2438 0%, #1a1428 45%, #0f0a1a 65%, #0a0814 100%)',
        cursor: 'crosshair',
      }}>
        {/* faint scene — silhouette horizon + sun glow */}
        <div aria-hidden style={{
          position: 'absolute', top: '38%', left: '50%', width: 180, height: 180, marginLeft: -90, marginTop: -90,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.35) 0%, transparent 65%)',
        }}/>
        <div aria-hidden style={{
          position: 'absolute', bottom: '32%', left: 0, right: 0, height: 1,
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)',
        }}/>
        {/* grid */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '33.333% 33.333%',
        }}/>
      </div>

      {/* HUD overlay */}
      {hudVariant === 'classic'   && <ClassicHUD   {...{ online, flash, setFlash, zoom, onOpenSettings }}/>}
      {hudVariant === 'minimal'   && <MinimalHUD   {...{ online, flash, setFlash, zoom, onOpenSettings }}/>}
      {hudVariant === 'cinematic' && <CinematicHUD {...{ online, flash, setFlash, zoom, onOpenSettings, lastShot }}/>}

      {/* focus ring */}
      {focusKey > 0 && (
        <div key={focusKey} style={{
          position: 'absolute', left: focusPos.x - 30, top: focusPos.y - 30,
          width: 60, height: 60, border: '2px solid #F5A623', pointerEvents: 'none',
          animation: 'pic-focus 1.5s ease-out forwards', zIndex: 12,
        }}/>
      )}

      {/* capture FX layer */}
      {captureFx && (
        <CaptureFX key={captureFx.ts} variant={captureFx.variant}
                   photo={lastShot}
                   onDone={() => setCaptureFx(null)} />
      )}

      {/* signing toast */}
      <SigningToast visible={!!toast} phase={toast?.phase}/>

      {/* Photo/Video mode pill — sits above the shutter row so it can't
          collide with the shutter button no matter the HUD variant. */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 196,
        display: 'flex', justifyContent: 'center', zIndex: 15, pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <PillToggle value={mode} onChange={setMode} options={[
            { value: 'photo', label: 'Photo' }, { value: 'video', label: 'Video' },
          ]}/>
        </div>
      </div>

      {/* Bottom controls row — thumb · shutter · flip. Lifted above the tab
          bar (56) + extra clearance so iOS home indicator and the tab bar
          icons read cleanly. */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 72,
        height: 96, padding: '0 24px', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 15,
      }}>
        {/* thumbnail */}
        <button onClick={onOpenPreview} aria-label="Open last capture" style={{
          width: 52, height: 52, borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)',
          padding: 0, background: 'transparent', cursor: 'pointer', overflow: 'hidden',
        }}>
          <FauxPhoto photo={lastShot} rounded={8} style={{ width: '100%', height: '100%' }}/>
        </button>

        {/* Shutter */}
        <div style={{ position: 'relative' }}>
          <ShutterButton mode={mode} recording={recording} onPress={onShutter}/>
          {mode === 'video' && recording && (
            <div style={{
              position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
              background: '#E74C3C', color: '#fff', fontFamily: MONO_STACK, fontSize: 11, fontWeight: 700,
              padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', letterSpacing: 0.5,
            }}>● 00:24</div>
          )}
        </div>

        {/* Flip */}
        <CamControl label="Switch camera"><IconFlip size={22} color="#fff"/></CamControl>
      </div>

      {/* Tab bar lives outside this — the App shell renders it */}
    </div>
  );
}

// ── HUD: Classic (spec canonical) ──────────────────────────────────────────
function ClassicHUD({ online, flash, setFlash, zoom, onOpenSettings }) {
  return (
    <>
      {/* top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 16px 12px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', zIndex: 15,
      }}>
        <CamControl onClick={() => setFlash(!flash)} label="Toggle flash">
          {flash ? <IconZap size={22} color="#F5A623" fill="#F5A623"/> : <IconZapOff size={22} color="#fff"/>}
        </CamControl>
        <VerificationBadge status={online ? 'ca' : 'device'} size="sm"
          label={online ? 'Pi Verified' : 'Device Only'}/>
        <CamControl onClick={onOpenSettings} label="Settings"><IconSettings size={20} color="#fff"/></CamControl>
      </div>
      {/* zoom pill */}
      <div style={{
        position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
        padding: '5px 12px', borderRadius: 9999,
        background: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#fff', fontFamily: MONO_STACK, fontSize: 12, fontWeight: 600,
        zIndex: 15,
      }}>{zoom}</div>
    </>
  );
}

// ── HUD: Minimal — everything tucked away ─────────────────────────────────
function MinimalHUD({ online, flash, setFlash, onOpenSettings }) {
  return (
    <>
      {/* Floating Pi mark only — taps to expand */}
      <div style={{
        position: 'absolute', top: 16, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', zIndex: 15,
      }}>
        <div style={{
          padding: '6px 10px 6px 8px', borderRadius: 9999,
          background: 'rgba(26,26,46,0.55)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', gap: 8,
          border: `0.5px solid ${online ? '#27AE60' : '#F5A623'}66`,
        }}>
          <PiMark size={22}/>
          <span style={{
            color: online ? '#7EE2A8' : '#FDD17A', fontFamily: FONT_STACK,
            fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
          }}>● {online ? 'PI VERIFIED' : 'DEVICE ONLY'}</span>
        </div>
      </div>

      {/* side rail */}
      <div style={{
        position: 'absolute', right: 16, top: 80, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 15,
      }}>
        <CamControl onClick={() => setFlash(!flash)} label="Toggle flash">
          {flash ? <IconZap size={20} color="#F5A623"/> : <IconZapOff size={20} color="#fff"/>}
        </CamControl>
        <CamControl onClick={onOpenSettings} label="Settings"><IconSettings size={18} color="#fff"/></CamControl>
      </div>
    </>
  );
}

// ── HUD: Cinematic — wide letterbox, manifest peek strip ─────────────────
function CinematicHUD({ online, flash, setFlash, onOpenSettings, lastShot }) {
  return (
    <>
      {/* letterbox */}
      <div aria-hidden style={{ position:'absolute', top: 0, left: 0, right: 0, height: 80, background: '#000', zIndex: 10 }}/>
      <div aria-hidden style={{ position:'absolute', bottom: 240, left: 0, right: 0, height: 60, background: '#000', zIndex: 10 }}/>

      {/* top bar (inside letterbox) */}
      <div style={{
        position: 'absolute', top: 8, left: 0, right: 0, height: 64,
        padding: '16px 16px 0', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 16,
      }}>
        <button onClick={() => setFlash(!flash)} style={{
          background: 'transparent', border: 'none', color: '#fff', padding: 8,
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT_STACK, fontSize: 11, fontWeight: 600, cursor: 'pointer',
        }}>
          {flash ? <IconZap size={16} color="#F5A623"/> : <IconZapOff size={16} color="#fff"/>}
          FLASH {flash ? 'ON' : 'OFF'}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: MONO_STACK, fontSize: 10, color: '#8B85FF', letterSpacing: 1.2 }}>● REC READY</div>
          <div style={{ fontFamily: MONO_STACK, fontSize: 9, color: '#666', letterSpacing: 0.5, marginTop: 2 }}>
            KEY A3F9···2B1C
          </div>
        </div>
        <button onClick={onOpenSettings} style={{
          background: 'transparent', border: 'none', color: '#fff', padding: 8,
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT_STACK, fontSize: 11, fontWeight: 600, cursor: 'pointer',
        }}>
          <IconSettings size={16} color="#fff"/> SETUP
        </button>
      </div>

      {/* lower letterbox strip: hash stream + signed-by chip */}
      <div style={{
        position: 'absolute', bottom: 248, left: 0, right: 0, height: 44, zIndex: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: online ? '#27AE60' : '#F5A623',
            boxShadow: `0 0 8px ${online ? '#27AE60' : '#F5A623'}`,
          }}/>
          <span style={{
            fontFamily: MONO_STACK, fontSize: 10, letterSpacing: 1.4,
            color: online ? '#7EE2A8' : '#FDD17A',
          }}>{online ? 'PI CA · READY' : 'OFFLINE · DEVICE ONLY'}</span>
        </div>
        <div style={{ flex: 1, margin: '0 16px', overflow: 'hidden' }}>
          <HashStream speed={28} color="rgba(108,99,255,0.55)"/>
        </div>
        <span style={{ fontFamily: MONO_STACK, fontSize: 10, color: '#888', letterSpacing: 0.5 }}>SHA-256</span>
      </div>
    </>
  );
}

// ── Capture FX layer ──────────────────────────────────────────────────────
function CaptureFX({ variant, photo, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, []);

  // Shared white flash
  const flash = (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff',
      animation: 'pic-flash 220ms ease-out forwards', pointerEvents: 'none', zIndex: 19,
    }}/>
  );

  if (variant === 'hash') {
    const chars = '0123456789abcdef';
    return (
      <>
        {flash}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20, overflow: 'hidden' }}>
          {[...Array(28)].map((_, i) => {
            const left = 10 + Math.random() * 80;
            const startY = 50 + Math.random() * 35;
            const delay = Math.random() * 250;
            return (
              <span key={i} style={{
                position: 'absolute', left: `${left}%`, top: `${startY}%`,
                color: 'rgba(108,99,255,0.95)', fontFamily: MONO_STACK, fontSize: 12 + Math.random()*5, fontWeight: 700,
                textShadow: '0 0 8px rgba(108,99,255,0.7)',
                animation: `pic-glyph-rise 1.2s ${delay}ms ease-out forwards`,
                opacity: 0,
              }}>{chars[Math.floor(Math.random()*chars.length)]}</span>
            );
          })}
        </div>
      </>
    );
  }
  if (variant === 'ring') {
    return (
      <>
        {flash}
        <div style={{
          position: 'absolute', left: '50%', bottom: 188, width: 4, height: 4, zIndex: 20,
          pointerEvents: 'none',
        }}>
          {[0, 200, 400].map((d) => (
            <div key={d} style={{
              position: 'absolute', left: 0, top: 0, width: 80, height: 80, marginLeft: -40, marginTop: -40,
              borderRadius: '50%', border: '2px solid #6C63FF',
              animation: `pic-shockwave 1.1s ${d}ms ease-out forwards`,
            }}/>
          ))}
        </div>
      </>
    );
  }
  // 'stamp' variant — Pi mark imprints + scan line
  return (
    <>
      {flash}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 30,
          background: 'linear-gradient(to bottom, rgba(108,99,255,0.5), transparent)',
          animation: 'pic-scan 800ms 100ms ease-in forwards',
        }}/>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          animation: 'pic-stamp 800ms 300ms ease-out backwards', opacity: 0.92,
        }}>
          <PiMark size={140}/>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { CameraScreen });
