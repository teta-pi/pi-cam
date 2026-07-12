// Splash screen — S-02. Dark navy bg, Pi shield logo with pulse, status text.
// On launch the dots cycle. We render in three flavors via `status` prop:
// initializing | generating-key | error.

function SplashScreen({ status = 'initializing' }) {
  const t = useTheme();
  const statusText = {
    initializing: 'Initializing…',
    'generating-key': 'Generating secure key…',
    error: 'Permission needed',
  }[status];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.navy,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: FONT_STACK, color: '#fff',
      overflow: 'hidden',
    }}>
      {/* faint radial highlight to ground the logo */}
      <div aria-hidden style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)',
      }} />
      {/* hash backdrop drifting */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.18,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingTop: 60 }}>
        {[...Array(6)].map((_, i) => <HashStream key={i} speed={20 + i*4} color="#6C63FF"/>)}
      </div>

      <div style={{ position: 'relative', animation: 'pic-fade-in 600ms ease-out' }}>
        <PiMark size={88}/>
      </div>
      <div style={{ marginTop: 18, fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>Pi CAM</div>
      <div style={{ marginTop: 4, fontSize: 14, color: t.purpleLt }}>Verified by Design</div>

      <div style={{ marginTop: 48, display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: t.purple,
            animation: `pic-dot-pulse 1.2s ${i*0.15}s ease-in-out infinite`,
          }}/>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: '#888', minHeight: 16 }}>{statusText}</div>

      <div style={{
        position: 'absolute', bottom: 56, fontSize: 11, color: '#666',
        fontFamily: MONO_STACK, letterSpacing: 0.5,
      }}>v1.0 · by Pi</div>
    </div>
  );
}

Object.assign(window, { SplashScreen });
