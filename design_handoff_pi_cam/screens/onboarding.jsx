// Onboarding — S-09. 3 slides + key generation screen.
// Internally a tiny state machine. `onDone` fires after key gen.

function OnboardingScreen({ onDone }) {
  const t = useTheme();
  const [step, setStep] = React.useState(0); // 0..2 slides, 3 keygen
  const next = () => setStep((s) => Math.min(3, s + 1));

  if (step === 3) return <KeyGenScreen onDone={onDone}/>;

  const slides = [
    {
      title: 'Every shot, verified.',
      body: 'Pi CAM signs every photo and video with a cryptographic proof. No one can fake what you captured.',
      illo: <SlideIlloShield/>,
    },
    {
      title: 'Works offline, always.',
      body: 'Your device generates a secure key. Signing happens on-device — no internet needed.',
      illo: <SlideIlloLock/>,
    },
    {
      title: 'Trusted worldwide.',
      body: 'Online? We add a Pi Certificate Authority stamp — recognized by any C2PA-compatible tool.',
      illo: <SlideIlloGlobe/>,
    },
  ];
  const s = slides[step];
  const last = step === 2;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, color: t.text,
      display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK,
    }}>
      {/* skip */}
      {!last && (
        <button onClick={() => setStep(2)} style={{
          position: 'absolute', top: 60, right: 16, background: 'transparent',
          border: 'none', color: t.textMuted, fontSize: 14, fontWeight: 500,
          fontFamily: FONT_STACK, cursor: 'pointer', zIndex: 5,
        }}>Skip</button>
      )}

      {/* illustration area (top 45%) */}
      <div style={{ flex: '0 0 45%', display: 'grid', placeItems: 'center', position: 'relative', paddingTop: 40 }}>
        {s.illo}
      </div>

      {/* content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 32px 28px' }}>
        <h1 style={{
          fontSize: 26, fontWeight: 700, textAlign: 'center', margin: 0,
          color: t.text, letterSpacing: -0.6, lineHeight: 1.15,
        }}>{s.title}</h1>
        <p style={{
          marginTop: 12, fontSize: 15, lineHeight: 1.5, textAlign: 'center',
          color: t.textBody, textWrap: 'pretty',
        }}>{s.body}</p>

        <div style={{ flex: 1 }}/>

        {/* dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? t.purple : t.grayLt,
              transition: 'all 250ms',
            }}/>
          ))}
        </div>
        <PrimaryButton fullWidth onClick={next}>
          {last ? 'Get Started' : 'Next'}
        </PrimaryButton>
      </div>
    </div>
  );
}

function SlideIlloShield() {
  return (
    <div style={{ position: 'relative', animation: 'pic-fade-in 500ms ease-out' }}>
      {/* glow */}
      <div style={{
        position: 'absolute', inset: -40, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)',
      }}/>
      {/* concentric verification rings */}
      {[80, 140, 200].map((r, i) => (
        <div key={r} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: r, height: r, marginTop: -r/2, marginLeft: -r/2,
          border: `1px solid rgba(108,99,255,${0.3 - i*0.08})`,
          borderRadius: '50%', animation: `pic-pulse ${2 + i*0.4}s ease-in-out infinite`,
        }}/>
      ))}
      <PiMark size={120}/>
    </div>
  );
}

function SlideIlloLock() {
  return (
    <div style={{ position: 'relative', width: 200, height: 220 }}>
      {/* phone outline */}
      <div style={{
        position: 'absolute', left: 20, top: 0, width: 130, height: 200,
        borderRadius: 24, border: '2px solid #6C63FF',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.08), transparent)',
      }}>
        <div style={{ padding: 16, fontFamily: MONO_STACK, fontSize: 9, color: '#6C63FF', lineHeight: 1.4 }}>
          <div>$ key.generate()</div>
          <div style={{ opacity: 0.7 }}>──────────────</div>
          <div>priv: <span style={{ color: '#27AE60' }}>0xA3F9…</span></div>
          <div>pub:  <span style={{ color: '#27AE60' }}>0x2B1C…</span></div>
          <div style={{ marginTop: 8 }}>✓ sealed</div>
        </div>
      </div>
      {/* big padlock floating */}
      <div style={{
        position: 'absolute', right: 0, top: 60, width: 80, height: 80,
        borderRadius: 18, background: '#1A1A2E',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 12px 28px rgba(26,26,46,0.35)',
        animation: 'pic-fade-in 600ms 100ms ease-out backwards',
      }}>
        <IconLock size={40} color="#fff"/>
      </div>
    </div>
  );
}

function SlideIlloGlobe() {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, animation: 'pic-fade-in 500ms ease-out' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="84" fill="none" stroke="#27AE60" strokeWidth="1.5" opacity="0.4"/>
        <ellipse cx="100" cy="100" rx="84" ry="40" fill="none" stroke="#27AE60" strokeWidth="1" opacity="0.4"/>
        <ellipse cx="100" cy="100" rx="40" ry="84" fill="none" stroke="#27AE60" strokeWidth="1" opacity="0.4"/>
        <ellipse cx="100" cy="100" rx="84" ry="20" fill="none" stroke="#27AE60" strokeWidth="1" opacity="0.25"/>
        {/* nodes */}
        {[[40,60],[160,80],[60,150],[150,150],[100,30]].map(([x,y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill="#27AE60"/>
            <circle cx={x} cy={y} r="10" fill="none" stroke="#27AE60" strokeWidth="1" opacity="0.4"/>
          </g>
        ))}
      </svg>
      {/* center checkmark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 60, height: 60, borderRadius: '50%', background: '#27AE60',
        display: 'grid', placeItems: 'center', boxShadow: '0 10px 24px rgba(39,174,96,0.4)',
      }}>
        <IconCheck size={32} color="#fff" stroke={2.4}/>
      </div>
    </div>
  );
}

// ── Key generation screen ─────────────────────────────────────────────────
function KeyGenScreen({ onDone }) {
  const [progress, setProgress] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [statusIdx, setStatusIdx] = React.useState(0);
  const stages = ['Initializing…', 'Creating key pair…', 'Securing…', 'Done!'];

  React.useEffect(() => {
    let t1 = setInterval(() => {
      setProgress(p => {
        const np = Math.min(100, p + 4);
        if (np >= 100) { clearInterval(t1); setDone(true); setStatusIdx(3); }
        return np;
      });
    }, 90);
    const t2 = setTimeout(() => setStatusIdx(1), 700);
    const t3 = setTimeout(() => setStatusIdx(2), 1500);
    const t4 = setTimeout(() => onDone?.(), 3500);
    return () => { clearInterval(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const R = 36, C = 2 * Math.PI * R;
  const off = C - (progress/100) * C;
  const color = done ? '#27AE60' : '#6C63FF';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#1A1A2E',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: FONT_STACK, color: '#fff', padding: 24,
    }}>
      {/* drifting hash backdrop */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.14,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        {[...Array(8)].map((_, i) => <HashStream key={i} speed={18 + i*3} color={i%2 ? '#8B85FF' : '#27AE60'}/>)}
      </div>

      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
          <circle cx="48" cy="48" r={R} fill="none" stroke={color} strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={off}
                  style={{ transition: 'stroke-dashoffset 250ms linear, stroke 300ms' }}/>
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          animation: done ? 'pic-stamp 400ms ease-out' : 'none',
        }}>
          {done ? <IconCheck size={36} color="#fff" stroke={2.4}/>
                : <IconLock size={28} color="#fff"/>}
        </div>
      </div>

      <h2 style={{ marginTop: 28, fontSize: 22, fontWeight: 700, textAlign: 'center', maxWidth: 280 }}>
        {done ? 'Your key is ready' : 'Generating your secure key'}
      </h2>
      <p style={{ marginTop: 8, fontSize: 14, color: '#8B85FF', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
        Your private key never leaves this device.
      </p>
      <div style={{
        marginTop: 28, fontFamily: MONO_STACK, fontSize: 13, color: '#8B85FF',
        opacity: 0.9, minHeight: 18,
      }}>{stages[statusIdx]}</div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, KeyGenScreen });
