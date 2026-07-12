# SPECS.md — Pi CAM pixel-perfect specification

Exact measurements for every screen, pulled from the prototype source. Units are **dp/px** (1:1 in the prototype). Pair this with `screenshots/` and the live `Pi CAM Design.html`. Colors reference token names from `CLAUDE.md` §3 (`theme.purple`, `theme.bg`, etc.).

**Frame reference:** iOS artboard 402 × 874, Android 412 × 892. Screens fill the frame (`position: absolute; inset: 0`). All `border: 0.5px` hairlines are device-pixel hairlines — use `StyleSheet.hairlineWidth` in RN.

**Global type scale** (see `CLAUDE.md` §3): titles 26/700, nav titles 16–17/700, section headers 17/600, body 14–16, captions 11–13, badge 11–12/600, mono labels 10–13. Letter-spacing −0.5 on big titles, +0.3–1.4 on uppercase mono/eyebrow labels.

---

## S-02 · Splash (`screens/splash.jsx`)

- **Background:** `theme.navy` `#1A1A2E` (always dark, ignores theme). `overflow: hidden`.
- **Layout:** column, centered (both axes).
- **Radial glow:** 360 × 360 circle, centered at `top:30% left:50%`, `radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)`.
- **Hash backdrop:** 6 `HashStream` rows, `opacity 0.18`, evenly spaced (`justify-content: space-around`), `paddingTop: 60`, color `#6C63FF`, speeds `20 + i*4`.
- **Logo:** `PiMark` size **88**, enters with `pic-fade-in 600ms`.
- **Wordmark:** "Pi CAM" — marginTop 18, 24/700, letter-spacing −0.4, white.
- **Tagline:** "Verified by Design" — marginTop 4, 14/400, `theme.purpleLt` `#8B85FF`.
- **Dots:** 3 × (8 × 8 circle, `theme.purple`), gap 6, marginTop 48, each `pic-dot-pulse 1.2s` staggered `i*0.15s`.
- **Status text:** marginTop 14, 12/400, `#888`, minHeight 16. States: `initializing` → "Initializing…", `generating-key` → "Generating secure key…", `error` → "Permission needed".
- **Footer:** absolute `bottom: 56`, mono 11, `#666`, letter-spacing 0.5 — "v1.0 · by Pi".

---

## S-09 · Onboarding (`screens/onboarding.jsx`)

State machine: steps 0–2 (slides) → step 3 (`KeyGenScreen`). Background `theme.bg`.

- **Skip button:** absolute `top:60 right:16`, 14/500, `theme.textMuted`. Hidden on last slide (jumps to slide index 2).
- **Illustration area:** top **45%** of height (`flex: 0 0 45%`), centered, `paddingTop: 40`.
- **Content area:** `flex: 1`, `padding: 8px 32px 28px`.
  - **Title:** 26/700, centered, letter-spacing −0.6, line-height 1.15.
  - **Body:** marginTop 12, 15/400, line-height 1.5, centered, `theme.textBody`, `text-wrap: pretty`.
  - Spacer (`flex: 1`) pushes dots + CTA to bottom.
  - **Progress dots:** 3 dots, gap 6, marginBottom 20. Active dot **24 × 8** `theme.purple`; inactive **8 × 8** `theme.grayLt`; radius 4; animate width over 250ms.
  - **CTA:** `PrimaryButton fullWidth` — "Next" (slides 0–1) / "Get Started" (slide 2).
- **Slide copy:**
  1. **"Every shot, verified."** — "Pi CAM signs every photo and video with a cryptographic proof. No one can fake what you captured." — illo: shield + 3 concentric pulsing rings (80/140/200) + glow + `PiMark` 120.
  2. **"Works offline, always."** — "Your device generates a secure key. Signing happens on-device — no internet needed." — illo: phone outline (130 × 200, radius 24, 2px purple border) with mono keygen log + floating padlock (80 × 80, radius 18, navy, `IconLock` 40).
  3. **"Trusted worldwide."** — "Online? We add a Pi Certificate Authority stamp — recognized by any C2PA-compatible tool." — illo: 200 × 200 SVG globe (green ellipses + 5 nodes) + center check badge (60 circle, `theme.verified`, `IconCheck` 32).

### Key generation (`KeyGenScreen`)
- **Background:** `#1A1A2E`, centered column, `padding: 24`, white text.
- **Hash backdrop:** 8 `HashStream` rows, `opacity 0.14`, alternating `#8B85FF` / `#27AE60`.
- **Progress ring:** 96 × 96 SVG, radius **36**, strokeWidth 4, rotated −90°. Track `rgba(255,255,255,0.08)`; progress stroke `#6C63FF` → `#27AE60` when done, round caps, dashoffset animates. Progress +4 every 90ms.
- **Center icon:** `IconLock` 28 (in progress) → `IconCheck` 36 (done, with `pic-stamp 400ms`).
- **Heading:** marginTop 28, 22/700, max-width 280 — "Generating your secure key" → "Your key is ready".
- **Sub:** marginTop 8, 14, `#8B85FF`, line-height 1.5 — "Your private key never leaves this device."
- **Stage line:** marginTop 28, mono 13, `#8B85FF`, minHeight 18 — cycles "Initializing…" (0ms) → "Creating key pair…" (700ms) → "Securing…" (1500ms) → "Done!" (100%). `onDone` fires at 3500ms.

---

## S-03 / S-04 · Camera (`screens/camera.jsx`)

Root: `position:absolute; inset:0; background:#111`, column, `overflow:hidden`. **Viewfinder is always `#111` / dark gradient regardless of theme.**

- **Viewfinder backdrop:** full-bleed `linear-gradient(180deg, #2a2438 0%, #1a1428 45%, #0f0a1a 65%, #0a0814 100%)`. `cursor: crosshair`.
  - **Sun glow:** 180 × 180 circle at `top:38% left:50%`, `radial-gradient(circle, rgba(245,166,35,0.35) 0%, transparent 65%)`.
  - **Horizon line:** 1px line at `bottom:32%`, white gradient fade.
  - **Rule-of-thirds grid:** `rgba(255,255,255,0.05)` 1px lines, cells `33.333%`.
- **Mode pill** (`PillToggle` Photo/Video): absolute, centered, `bottom: 196`, zIndex 15.
- **Bottom controls row:** absolute `bottom: 72`, height **96**, padding `0 24`, space-between, zIndex 15:
  - **Thumbnail:** 52 × 52, radius 10, `1.5px solid rgba(255,255,255,0.35)`, holds last capture.
  - **Shutter:** `ShutterButton` (see Components).
  - **Flip:** `CamControl` 44 × 44 with `IconFlip` 22.
  - **REC chip** (video + recording): absolute `top:-28`, centered, `theme.alert` bg, white mono 11/700, padding `2px 8px`, radius 4 — "● 00:24".
- **Focus ring:** 60 × 60, `2px solid #F5A623`, at tap point (offset −30/−30), `pic-focus 1.5s`, zIndex 12.

### HUD: Classic (canonical default)
- **Top bar:** absolute top, padding `16 16 12`, space-between, zIndex 15:
  - Left: `CamControl` flash toggle (`IconZapOff` white / `IconZap` `#F5A623` when on).
  - Center: `VerificationBadge size="sm"` — online → `ca` "Pi Verified", offline → `device` "Device Only".
  - Right: `CamControl` settings (`IconSettings` 20).
- **Zoom pill:** absolute `top:80`, centered, padding `5 12`, radius full, `rgba(26,26,46,0.6)` + blur 10, white mono 12/600 — "1x".

### HUD: Minimal
- **Floating badge:** absolute `top:16`, centered. Pill padding `6 10 6 8`, radius full, `rgba(26,26,46,0.55)` + blur 12, `0.5px` border tinted by status (`#27AE60` / `#F5A623` at 66 alpha). Contains `PiMark` 22 + label 11/600 ("● PI VERIFIED" green `#7EE2A8` / "● DEVICE ONLY" amber `#FDD17A`).
- **Side rail:** absolute `right:16 top:80`, column, gap 12: flash `CamControl` (icon 20) + settings `CamControl` (icon 18).

### HUD: Cinematic
- **Letterbox:** top bar 80px solid `#000` (zIndex 10); lower bar 60px solid `#000` at `bottom:240`.
- **Top readout bar:** absolute `top:8`, height 64, padding `16 16 0`, items flex-start, space-between, zIndex 16:
  - Left text button: flash icon 16 + "FLASH ON/OFF" (11/600 white).
  - Center: "● REC READY" (mono 10, `#8B85FF`, ls 1.2) + "KEY A3F9···2B1C" (mono 9, `#666`, ls 0.5).
  - Right text button: `IconSettings` 16 + "SETUP".
- **Lower strip:** absolute `bottom:248`, height 44, padding `0 16`, space-between, zIndex 16:
  - Left: 6px status dot (glowing, green/amber) + "PI CA · READY" / "OFFLINE · DEVICE ONLY" (mono 10, ls 1.4).
  - Center: `HashStream` speed 28, color `rgba(108,99,255,0.55)`, `flex:1`, margin `0 16`.
  - Right: "SHA-256" (mono 10, `#888`).

### Capture FX (on shutter, photo mode) — see `CLAUDE.md` §7 for Reanimated mapping
- **Shared flash:** full-bleed white, `pic-flash 220ms`, zIndex 19. FX auto-clears at 1400ms.
- **`hash`:** 28 hex glyphs, random `left 10–90%`, `top 50–85%`, mono 12–17/700, `rgba(108,99,255,0.95)` with glow, `pic-glyph-rise 1.2s` staggered up to 250ms.
- **`ring`:** 3 concentric 80 × 80 rings, `2px solid #6C63FF`, origin at `left:50% bottom:188`, `pic-shockwave 1.1s` stagger 0/200/400ms.
- **`stamp`:** top scan gradient (height 30, purple→transparent, `pic-scan 800ms 100ms`) + centered `PiMark` 140, `pic-stamp 800ms 300ms`, opacity 0.92.

### Signing toast sequence (every photo)
`signing` (0ms) → `signed` (700ms) → `certifying` (1700ms) → `verified` (3000ms) → hide (4500ms). New thumbnail swaps in at 1000ms.

---

## S-05 · Preview (`screens/preview.jsx`)

Root: `theme.bg` / `theme.text`, column.

- **Nav bar:** height **52**, paddingTop 4, padding `0 16`, space-between, bottom hairline `theme.border`. Left `IconClose` 24, center "Preview" 17/700, right `IconMore` 24 (both icon buttons padding 8).
- **Media:** `aspect-ratio 4/3`, bg `#000`. `VerificationBadge` overlaid at `bottom:12`, centered — `ca` "Pi Verified" / `device` "Device Signed".
- **Tabs:** two tabs, each `flex:1`, height **44**, 14/600, capitalized; active `theme.purple` text + 2px bottom border, inactive `theme.textMuted`. Bottom hairline. Tabs: **Details**, **Technical**.
- **Details rows** (`DetailsRow`): height **56**, padding `0 16`, bottom hairline `theme.borderSoft`. Icon column 32 wide (`theme.purple` icon 20). Label 11/600 uppercase `theme.textMuted` ls 0.3; value 14 (`theme.textBody`) or mono 13 (`theme.mono`) marginTop 2. Optional trailing copy button (`IconCopy` 16, `theme.grayLt`).
  - Order: Captured · Device · Location · (inline trust badge, padding 16) · Public Key (mono, copy) · SHA-256 (mono, copy) · CA Certificate (only if `ca`) · Timestamp (RFC 3161, mono). 24px tail spacer.
  - Inline trust badge: `VerificationBadge` "Pi Verified · L1 trust" / "Device Signed · L0 trust".
- **Technical tab:** padding 16. Header row: "C2PA Manifest" (13/600 `theme.textMuted`) + "Copy All" ghost button (`theme.purple`). `<pre>` block: padding 12, `theme.bgCode` bg, radius 8, mono 12, `theme.textBody`, line-height 1.5. (JSON shape in `sampleManifest`.)
- **Action bar:** padding `12 16`, gap 12, top hairline, soft top shadow. `PrimaryButton fullWidth` (icon Share) "Share" + `SecondaryButton fullWidth` "Save".
- **Copy toast:** absolute `bottom:100`, centered, padding `8 14`, `theme.navy` bg, white 12/600, radius full, `pic-toast-in 250ms` — "Copied!" (1600ms).

---

## S-06 · Gallery (`screens/gallery.jsx`)

Root: `theme.bg`, column.

- **Header:** height **56**, padding `0 16`, space-between, bottom hairline. Title "Pi CAM Gallery" 22/700 ls −0.3. Add button 36 × 36 circle, `theme.lavender` bg, `IconPlus` 20 `theme.purple`.
- **Filter chips:** row, gap 8, padding `10 16`, horizontal scroll. Each chip height **32**, padding `0 14`, radius full. Active `theme.purple` bg / white text; inactive `theme.lavender` bg / `theme.purple` text; 13/600. Optional 6px status dot. Chips: "All · {n}", "Device" (amber dot), "Pi Verified" (green dot).
- **Grid:** 3 columns, **gap 2**, each cell `aspect-ratio 1`.
  - **Status pip:** top-right `6/6`, 22 × 22 circle, `#27AE60` (ca) / `#F5A623` (device), drop shadow; icon `IconShieldCheck`/`IconShield` 12 white.
  - **Selection control** (when selecting): bottom-right `6/6`, 22 × 22 circle; selected = `theme.purple` + `IconCheck` 14; unselected = white w/ 1.5px border.
- **Selection enters** via long-press (prototype uses right-click → `onContextMenu`). Tap toggles when selecting, else opens Preview.
- **Selection action bar:** padding `12 16`, gap 10, top hairline, `pic-fade-in 200ms`: `SecondaryButton` "Share · {n}" + `SecondaryButton` "Export" + 48 × 48 trash button (radius 20, 1.5px `theme.alert` border, `IconTrash` 18).
- **Empty state:** padding 40, centered, `IconCamera` 48 `theme.grayLt` + "No matching photos" 15.

---

## S-07 · Verify (`screens/verify.jsx`)

Root: `theme.bg`, column. State: `idle → verifying → (ca | device | tampered | none)`.

- **Nav bar:** height **52**, padding `0 16`, bottom hairline. `IconBack` 24 left, "Verify Content" 17/700 center, 32px right spacer.
- **Body:** `flex:1`, padding 16, column gap 16.
- **Drop zone:** height **200**, radius 16, `2px dashed theme.purple` (idle) / `2px solid` (verifying), bg `theme.lavender`. Centered column gap 12, padding 24: `IconCloudUp` 44 `theme.purple` + label 15/500 `theme.textMuted` ("Drop photo or video here" / "Analyzing…") + `SecondaryButton` "Choose File" (idle only). Verifying overlays a faint `HashStream` (speed 4).
- **Verifying file row:** padding 12, `theme.bgAlt`, radius 12, gap 12. Thumb 56 × 56 radius 8. Right: "IMG_3892.heic" 13/600, "4.2 MB" 12, progress bar (height 4, `theme.lavender` track, `theme.purple` fill, +8% / 60ms over 1400ms), "Checking C2PA manifest…" mono 11. 
- **Sample chips** (idle): eyebrow "TRY A SAMPLE" 11/600 uppercase ls 0.6. 2 × 2 grid gap 8, each chip height **44**, radius 12, padding `0 12`, `theme.bgAlt` bg, 1px `theme.borderSoft`, 13/600, colored label: "✓ Pi Verified" (verified), "● Device Only" (device), "✕ Tampered" (alert), "?  No manifest" (grayMid).
- **Result card:** radius 12, `theme.bg`, soft shadow, **4px top border** in status color, `pic-fade-in 300ms`.
  - Header: gap 12, padding `16 20`, bg = badge skin bg; status icon 28 + title 18/700 in badge text color. Titles: "Content Authentic" / "Device Verified" / "Tampering Detected" / "No Verification Data".
  - Body: `DetailsRow`s per state (see source) — `ca`: Captured/Device/CA cert/SHA-256✓; `device`: Device/Public Key/SHA-256✓/CA none; `tampered`: Hash Mismatch/Expected/Computed; `none`: paragraph 14 line-height 1.5.
  - Footer: padding 12, centered ghost "Verify Another" (`theme.purple`).

---

## S-08 · Settings (`screens/settings.jsx`)

Root: `theme.bgAlt` (grouped-list background), column, scroll.

- **Title:** padding `24 16 8`, 26/700, ls −0.5 — "Settings".
- **Section** (`Section`): eyebrow label padding `20 16 8`, 11/600 uppercase `theme.textMuted` ls 0.6. Card: margin `0 16`, radius 12, `theme.bg`, hairline-ring shadow, clips children.
- **Row** (`Row`): height **56**, padding `0 16`, bottom hairline `theme.borderSoft`. Leading icon 20 (`theme.purple`, or `theme.alert` if danger). Label marginLeft 12, 16/500. Optional trailing `value` + `action` (chevron `IconChev` 16 `theme.grayLt`).
- **ToggleRow:** height **64**. Icon 20, label 15/500 + sub 12 `theme.textMuted` (marginTop 1). Trailing `Switch`.
- **Switch:** 51 × 31, radius 999, padding 2. On = `theme.purple`, off = `theme.grayLt`. Knob 27 × 27 white circle, shadow, translateX 20 when on, 200ms.
- **Sections & rows:**
  - **Account:** "Sign in to Pi" (chevron).
  - **Security:** "Device Key" (mono "A3F9···2B1C" `theme.mono` + copy), "Trust Level" (`VerificationBadge sm`), "Reset Device Key" (danger, opens sheet).
  - **Capture:** toggles — "Include Location" / GPS in manifest (off), "Watermark on Share" / Pi badge on shared images (on), "Auto CA Upgrade" / Re-certify when online (on; **also flips the global online/badge state**), "Save to Photos" / Auto-save to camera roll (on).
  - **Tools:** "Verify external content" → S-07, "View latest manifest" → S-10 (both chevron).
  - **Appearance:** "Theme" — segmented Light/Dark pill (height 26 buttons, radius full, active `theme.purple`/white). Drives the app theme.
  - **About:** "Version" → "1.0.0 · Build 42", "Privacy Policy" (chevron).
  - 32px tail spacer.
- **Reset sheet** (`ResetSheet`): dim `rgba(0,0,0,0.5)`, bottom-anchored, `pic-fade-in 200ms`. Sheet `theme.bg`, top radius 24, padding 24 / paddingBottom 40. Grabber 36 × 4 `theme.grayLt`. Icon tile 56 × 56 radius 16, `theme.badgeError.bg`, `IconAlert` 28 `theme.alert`. Title 20/700 centered "Reset Device Key?". Body 14 `theme.textBody` centered line-height 1.5. Buttons row gap 12: `SecondaryButton` "Cancel" + `DangerButton` "Reset".

---

## S-10 · Manifest viewer (`screens/manifest.jsx`)

Root: `theme.bgCode`, column. Sample data = `MANIFEST_SAMPLE` (port to `lib/manifest.ts`).

- **Header:** height **52**, padding `0 16`, space-between, `theme.bg`, bottom hairline, soft shadow. `IconClose` 22 left; center "C2PA Manifest" 16/700 with `IconFileJson` 18 `theme.purple` (gap 8); right copy `IconCopy` 20 `theme.purple`.
- **Tree body:** `flex:1`, scroll, `paddingBottom 80`.
- **Leaf node** (`JsonNode`, primitive): height **36**, `paddingLeft 16 + depth*16`, paddingRight 16, mono 12, bottom hairline `theme.borderSoft`. Depth > 0 → bg `theme.bgCode` + **2px left rail** `theme.purple`. Key `theme.purple`/700, colon `theme.textMuted`, value colored by type: string → `theme.verified`, number → `theme.device`, boolean → `theme.alert`, null → `theme.textMuted`. Strings wrapped in quotes.
- **Branch node:** height **44**, same indent + left rail. Chevron (`IconChevDown`/`IconChev` 14 `theme.grayLt`) + key (mono 13/700 `theme.purple`) + preview (`array · N items` or `{ k, k… }`, mono 11 `theme.textMuted`). `assertions` defaults open.
- **Footer:** absolute bottom, padding `12 16`, `theme.bg`, top hairline, soft top shadow. `SecondaryButton fullWidth` — "Copy Full JSON" → "Copied to clipboard ✓" (1800ms).

---

## Components (`lib/components.jsx`) — exact dims

### VerificationBadge
- Pill: `inline-flex`, gap 6, radius full, 1px border. `md`: padding `6 12`, font 12/600, icon 14. `sm`: padding `4 10`, font 11/600, icon 12. Icon stroke 2.2.
- Skin per status (bg/border/text from theme badge skins): `ca`→badgeCa + `IconShieldCheck`, `device`→badgeDevice + `IconShield`, `error`→badgeError + `IconShieldX`, `signing`→badgeSign + `IconShield` + trailing Spinner, `certifying`→badgeSign + `IconSparkle` + trailing Pulse dot.
- Default labels: "Pi Verified" / "Device Signed" / "Verification failed" / "Signing…" / "Certifying…".

### ShutterButton
- Outer: **88 × 88** circle, `3px solid theme.purple`, transparent fill. Press → `scale(0.92)`, spring `cubic-bezier(.2,1.2,.4,1)` 200ms.
- Inner: photo → 74 circle white; video idle → 70 circle `theme.alert`; video recording → 28 rounded-square (radius 6) `theme.alert`; 220ms morph. Inner shadow `0 1px 3px rgba(0,0,0,0.4)`.
- Recording adds an outer pulsing ring (inset −8, 3px `theme.alert`, opacity 0.6, `pic-ring 1.2s`).

### CamControl
- **44 × 44** circle, no border. Bg `rgba(26,26,46,0.55)` + **blur 12** (active → `rgba(108,99,255,0.9)`). White icon centered. 150ms bg transition. → `expo-blur` `<BlurView tint="dark">`.

### Spinner / Pulse
- Spinner: size px circle, 1.5px border, top-color = accent, `pic-spin 0.8s linear infinite`.
- Pulse: 6 × 6 dot, `pic-pulse 1.2s ease-in-out infinite`.

### Animation tokens (CSS keyframes → Reanimated, see `CLAUDE.md` §7)
| Keyframe | Duration / easing |
|---|---|
| `pic-flash` | 220ms ease-out |
| `pic-focus` | 1.5s ease-out |
| `pic-glyph-rise` | 1.2s ease-out (stagger ≤250ms) |
| `pic-shockwave` | 1.1s ease-out (0/200/400ms) |
| `pic-stamp` | 800ms 300ms ease-out backwards |
| `pic-scan` | 800ms 100ms ease-in |
| `pic-fade-in` | 200–600ms |
| `pic-toast-in` | 250ms |
| `pic-spin` | 0.8s linear ∞ |
| `pic-pulse` / `pic-dot-pulse` / `pic-ring` | 1.2s ease-in-out ∞ |

---

## Mock data (`lib/photos.jsx` → `data/photos.ts`)

`PHOTOS` is an array of 9 items, each: `{ id, status: 'ca'|'device', date, device, loc, key, hash, grad }`. `FauxPhoto` renders a diagonal gradient placeholder from `grad`. In production, replace `FauxPhoto` with `expo-image` `<Image>` and feed real capture metadata. Filters: All / Device (`status==='device'`) / Pi Verified (`status==='ca'`).
