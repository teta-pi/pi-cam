// Faux photo content + small visual helpers used across screens.
// Each "photo" is a deterministic colored gradient with a faint hash overlay,
// so the gallery / preview look populated without us hand-drawing SVG scenes.

const PHOTOS = [
  { id: 'p1', hue1: 220, hue2: 280, status: 'ca',     loc: 'Kyiv, Ukraine',    device: 'iPhone 16 Pro', date: '24 May 2026 14:32', key: 'A3F9...2B1C', hash: '3e4f...a1b2' },
  { id: 'p2', hue1: 35,  hue2: 15,  status: 'device', loc: 'Lviv, Ukraine',     device: 'iPhone 16 Pro', date: '24 May 2026 09:18', key: 'A3F9...2B1C', hash: '8c1d...4e92' },
  { id: 'p3', hue1: 165, hue2: 200, status: 'ca',     loc: 'Odesa, Ukraine',    device: 'iPhone 16 Pro', date: '23 May 2026 17:44', key: 'A3F9...2B1C', hash: 'b271...d501' },
  { id: 'p4', hue1: 280, hue2: 320, status: 'ca',     loc: 'Berlin, Germany',   device: 'iPhone 16 Pro', date: '21 May 2026 11:02', key: 'A3F9...2B1C', hash: '5a8e...7c34' },
  { id: 'p5', hue1: 12,  hue2: 350, status: 'device', loc: 'Warsaw, Poland',    device: 'iPhone 16 Pro', date: '19 May 2026 19:55', key: 'A3F9...2B1C', hash: 'f032...91bd' },
  { id: 'p6', hue1: 195, hue2: 230, status: 'ca',     loc: 'Vienna, Austria',   device: 'iPhone 16 Pro', date: '18 May 2026 13:20', key: 'A3F9...2B1C', hash: '4d77...e1a9' },
  { id: 'p7', hue1: 145, hue2: 95,  status: 'ca',     loc: 'Kyiv, Ukraine',     device: 'iPhone 16 Pro', date: '15 May 2026 08:11', key: 'A3F9...2B1C', hash: '227c...f8b3' },
  { id: 'p8', hue1: 50,  hue2: 25,  status: 'device', loc: 'Kyiv, Ukraine',     device: 'iPhone 16 Pro', date: '13 May 2026 16:40', key: 'A3F9...2B1C', hash: '9914...3acc' },
  { id: 'p9', hue1: 260, hue2: 220, status: 'ca',     loc: 'Kyiv, Ukraine',     device: 'iPhone 16 Pro', date: '11 May 2026 21:05', key: 'A3F9...2B1C', hash: '6b50...07ef' },
];

// A deterministic gradient photo card. `seed` controls hue. The faint hex grid
// over it sells the "this image is content-hashed" idea without being noisy.
function FauxPhoto({ photo, style, children, rounded = 0, video = false }) {
  const { hue1, hue2 } = photo;
  const grad = `linear-gradient(135deg, oklch(0.55 0.18 ${hue1}) 0%, oklch(0.35 0.14 ${hue2}) 100%)`;
  return (
    <div style={{
      position: 'relative', background: grad, borderRadius: rounded,
      overflow: 'hidden', ...style,
    }}>
      {/* hash-noise overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '6px 6px', mixBlendMode: 'overlay', opacity: 0.6,
      }} />
      {/* subtle horizon line so it reads as a scene */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom, transparent 0%, transparent 55%, oklch(0.25 0.1 ${hue2} / 0.5) 55%, transparent 75%)`,
      }} />
      {video && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.45)',
          display: 'grid', placeItems: 'center',
        }}>
          <IconPlay size={14} color="#fff" fill="#fff"/>
        </div>
      )}
      {children}
    </div>
  );
}

// A "hash stream" – a horizontal ticker of mono characters used in capture
// animations and headers when we want a cryptographic flavor.
function HashStream({ chars = '0123456789abcdef', height = 14, speed = 12, color = 'rgba(255,255,255,0.55)' }) {
  const str = React.useMemo(() => {
    let s = '';
    for (let i = 0; i < 200; i++) s += chars[Math.floor(Math.random()*chars.length)];
    return s + ' ' + s;
  }, []);
  return (
    <div style={{ overflow: 'hidden', height, opacity: 0.9 }}>
      <div style={{
        whiteSpace: 'nowrap', fontFamily: MONO_STACK, fontSize: 10, color,
        animation: `pic-hash-stream ${speed}s linear infinite`,
        width: 'max-content', letterSpacing: 2,
      }}>{str}</div>
    </div>
  );
}

// Pi mark — a stylized shield with a Pi glyph inside. Used as the app logo.
function PiMark({ size = 80, fill = 'url(#piGrad)' }) {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <defs>
        <linearGradient id={`piGrad-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C63FF"/>
          <stop offset="100%" stopColor="#8B85FF"/>
        </linearGradient>
        <linearGradient id={`piGloss-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
      <path d="M40 4 L10 14 v22 c0 18 12 32 30 40 18-8 30-22 30-40 V14 Z"
            fill={`url(#piGrad-${id})`} />
      <path d="M40 4 L10 14 v22 c0 18 12 32 30 40 18-8 30-22 30-40 V14 Z"
            fill={`url(#piGloss-${id})`} />
      {/* Pi glyph */}
      <g fill="#fff" transform="translate(40 44)">
        <rect x="-16" y="-10" width="32" height="3.5" rx="1.5"/>
        <rect x="-9" y="-6.5" width="3.5" height="20" rx="1"/>
        <rect x="5.5" y="-6.5" width="3.5" height="20" rx="1"/>
      </g>
    </svg>
  );
}

Object.assign(window, { PHOTOS, FauxPhoto, HashStream, PiMark });
