// Minimal Lucide-style icon set. Stroke-based, 24×24 viewport, color via
// `currentColor` so they inherit. Pi-specific glyphs (shield-check, shield-x)
// hand-tuned to read at small sizes.

function _svg(d, props = {}) {
  return ({ size = 24, color = 'currentColor', stroke = 1.8, fill = 'none', style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
         stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
         style={style} {...props}>{d}</svg>
  );
}

const IconCamera = _svg(<>
  <path d="M14.5 4h-5l-1.5 2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3z"/>
  <circle cx="12" cy="13" r="3.5"/>
</>);

const IconVideo = _svg(<>
  <rect x="3" y="6" width="13" height="12" rx="2"/>
  <path d="m16 10 5-3v10l-5-3z"/>
</>);

const IconZap = _svg(<polygon points="13 2 4 14 11 14 10 22 19 10 12 10 13 2"/>);
const IconZapOff = _svg(<>
  <polyline points="12.41 6.75 13 2 10.57 4.92"/>
  <polyline points="18.57 12.91 21 10 15.66 10"/>
  <polyline points="8 8 3 14 12 14 11 22 16 16"/>
  <line x1="2" y1="2" x2="22" y2="22"/>
</>);

const IconFlip = _svg(<>
  <path d="M3 8a2 2 0 0 1 2-2h3l2-2h4l2 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <path d="M9 13a3 3 0 0 0 6 0"/>
  <path d="m13 11 2 2-2 2M11 15l-2-2 2-2"/>
</>);

const IconShield = _svg(<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>);
const IconShieldCheck = _svg(<>
  <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>
  <path d="m8.5 12 2.5 2.5L15.5 10"/>
</>);
const IconShieldX = _svg(<>
  <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>
  <path d="m9 9 6 6M15 9l-6 6"/>
</>);

const IconImage = _svg(<>
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <circle cx="9" cy="9" r="2"/>
  <path d="m21 15-5-5L5 21"/>
</>);
const IconShare = _svg(<>
  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
  <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5"/>
</>);
const IconSettings = _svg(<>
  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
  <circle cx="12" cy="12" r="3"/>
</>);
const IconKey = _svg(<>
  <circle cx="7.5" cy="15.5" r="3.5"/>
  <path d="M10 13 21 2M16 7l3 3M14 9l2 2"/>
</>);
const IconFileJson = _svg(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <path d="M14 2v6h6"/>
  <path d="M10 12c-1 0-2 .5-2 2v1c0 .5-.5 1-1 1m3 4c-1 0-2-.5-2-2v-1c0-.5-.5-1-1-1M14 12c1 0 2 .5 2 2v1c0 .5.5 1 1 1m-3 4c1 0 2-.5 2-2v-1c0-.5.5-1 1-1"/>
</>);
const IconCloudUp = _svg(<>
  <path d="M16 19h2a4 4 0 0 0 .9-7.9 6 6 0 0 0-11.7-.6A4.5 4.5 0 0 0 6 19h2"/>
  <path d="m12 12 4 4M12 12l-4 4M12 12v9"/>
</>);
const IconCheck = _svg(<><circle cx="12" cy="12" r="10"/><path d="m8.5 12.5 2.5 2.5L15.5 10"/></>);
const IconAlert = _svg(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h0"/></>);
const IconTrash = _svg(<>
  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
</>);
const IconCal = _svg(<>
  <rect x="3" y="4" width="18" height="18" rx="2"/>
  <path d="M16 2v4M8 2v4M3 10h18"/>
</>);
const IconDevice = _svg(<>
  <rect x="6" y="2" width="12" height="20" rx="2"/>
  <line x1="11" y1="18" x2="13" y2="18"/>
</>);
const IconPin = _svg(<>
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
  <circle cx="12" cy="10" r="3"/>
</>);
const IconHash = _svg(<><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></>);
const IconClock = _svg(<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>);
const IconCopy = _svg(<>
  <rect x="9" y="9" width="13" height="13" rx="2"/>
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</>);
const IconClose = _svg(<><path d="m6 6 12 12M6 18 18 6"/></>);
const IconBack = _svg(<><path d="m15 18-6-6 6-6"/></>);
const IconMore = _svg(<><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>);
const IconPlus = _svg(<><path d="M12 5v14M5 12h14"/></>);
const IconChev = _svg(<><path d="m9 18 6-6-6-6"/></>);
const IconChevDown = _svg(<><path d="m6 9 6 6 6-6"/></>);
const IconLock = _svg(<>
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</>);
const IconUser = _svg(<>
  <circle cx="12" cy="12" r="10"/>
  <circle cx="12" cy="10" r="3"/>
  <path d="M6.5 19a6 6 0 0 1 11 0"/>
</>);
const IconAward = _svg(<>
  <circle cx="12" cy="9" r="6"/>
  <path d="m9 14-1.5 7L12 18l4.5 3L15 14"/>
</>);
const IconSparkle = _svg(<>
  <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2"/>
</>);
const IconDroplet = _svg(<path d="M12 2c-3 4-7 8-7 12a7 7 0 1 0 14 0c0-4-4-8-7-12z"/>);
const IconDownload = _svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>);
const IconPlay = _svg(<><polygon points="6 4 20 12 6 20"/></>);
const IconBolt = _svg(<polygon points="13 2 3 14 11 14 11 22 21 10 13 10 13 2"/>);
const IconInfo = _svg(<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h0"/></>);
const IconFile = _svg(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>);

Object.assign(window, {
  IconCamera, IconVideo, IconZap, IconZapOff, IconFlip,
  IconShield, IconShieldCheck, IconShieldX,
  IconImage, IconShare, IconSettings, IconKey, IconFileJson,
  IconCloudUp, IconCheck, IconAlert, IconTrash, IconCal, IconDevice,
  IconPin, IconHash, IconClock, IconCopy, IconClose, IconBack, IconMore,
  IconPlus, IconChev, IconChevDown, IconLock, IconUser, IconAward,
  IconSparkle, IconDroplet, IconDownload, IconPlay, IconBolt, IconInfo, IconFile,
});
