# CLAUDE.md — Pi CAM, React Native (Expo) implementation guide

> **Read `README.md` first** for the product concept and the full screen-by-screen breakdown. This file is the build guide: how to turn the HTML/React prototype in this bundle into a real **React Native (Expo)** app. `SPECS.md` has the pixel-perfect measurements per screen — keep it open while building.

You (Claude Code) are implementing the Pi CAM app. The prototype in `Pi CAM Design.html` + `lib/` + `screens/` is the **source of truth for look, behavior, copy, and motion**. It is browser React with inline styles — do **not** copy it verbatim. Re-express every screen using React Native primitives and the libraries below, matching the prototype pixel-for-pixel.

---

## 0. Ground rules

- **Match the prototype exactly** — colors, spacing, type sizes, radii, copy, and motion are all final (hi-fi). When in doubt, open the HTML in a browser and inspect, or read `SPECS.md`.
- **No web-isms.** Replace `<div>`/`<button>`/`<span>` with `View`/`Pressable`/`Text`. Replace CSS `backdrop-filter` with `expo-blur`. Replace CSS `@keyframes`/`transition` with `react-native-reanimated`. Replace `box-shadow` with RN `shadow*`/`elevation`.
- **One styling system.** Use `StyleSheet.create` + a typed theme object (below). Don't scatter magic numbers — pull from `theme`, `space`, `radius`.
- **Theme is runtime.** Light/dark is a user setting (Settings screen) AND the camera viewfinder is **always dark (`#111`)** regardless of theme. Build a `ThemeProvider` exactly like the prototype's.
- **Don't port the tooling.** `canvas.jsx`, `ios-frame.jsx`, `android-frame.jsx`, `design-canvas.jsx`, `tweaks-panel.jsx`, and `_capture.html` are design-review scaffolding. Ignore them.

---

## 1. Stack & dependencies

Target **Expo SDK (latest stable)** with the **New Architecture** enabled and **expo-router** for navigation.

```bash
npx create-expo-app pi-cam --template tabs   # TS tabs template
cd pi-cam

# Core
npx expo install expo-router react-native-safe-area-context react-native-screens
# Motion & gestures
npx expo install react-native-reanimated react-native-gesture-handler
# Camera + media
npx expo install expo-camera expo-media-library expo-image expo-image-picker
# Visual effects
npx expo install expo-blur expo-linear-gradient
# Crypto / signing (real product pipeline — see §9)
npx expo install expo-crypto expo-secure-store expo-file-system
# Haptics for shutter
npx expo install expo-haptics
# Icons (or port the prototype's SVGs with react-native-svg)
npx expo install react-native-svg
```

| Prototype concern | Expo / RN library |
|---|---|
| Screens & navigation | `expo-router` (file-based: tabs + modals) |
| Animations (`@keyframes`, `transition`) | `react-native-reanimated` v3 |
| Tap-to-focus / drag / long-press | `react-native-gesture-handler` |
| `backdrop-filter: blur()` (camera controls, HUD) | `expo-blur` `<BlurView>` |
| Camera viewfinder | `expo-camera` `<CameraView>` |
| Photos / saving | `expo-media-library`, `expo-image` |
| Gradients (FauxPhoto stand-ins, splash glow) | `expo-linear-gradient` |
| Hashing / keypair / manifest signing | `expo-crypto` + `expo-secure-store` (keys) |
| SVG icons | `react-native-svg` |
| Shutter feedback | `expo-haptics` |

---

## 2. Project structure (expo-router)

```
app/
  _layout.tsx              Root stack: tabs + modal group + onboarding/splash
  index.tsx                Boot → splash → (onboarding | tabs)
  splash.tsx               S-02
  onboarding.tsx           S-09
  (tabs)/
    _layout.tsx            Bottom Tab navigator (Camera / Gallery / Settings)
    camera.tsx             S-03 / S-04  (default tab)
    gallery.tsx            S-06
    settings.tsx           S-08
  (modal)/
    _layout.tsx            Stack with presentation: 'modal' / 'fullScreenModal'
    preview/[id].tsx       S-05
    verify.tsx             S-07
    manifest/[id].tsx      S-10
theme/
  tokens.ts                Palettes, space, radius, type  (§3 — paste-ready)
  ThemeProvider.tsx        Context + useTheme()
components/
  VerificationBadge.tsx    (§6 — fully ported example)
  ShutterButton.tsx
  PillToggle.tsx
  CamControl.tsx
  SigningToast.tsx
  TabBar.tsx               (or style the expo-router tab bar)
  PiMark.tsx
  icons.tsx                ported from lib/icons.jsx via react-native-svg
lib/
  capture.ts               capture → sign → certify pipeline (§9)
  manifest.ts              C2PA manifest shape + sample
  format.ts                hash/key truncation helpers
data/
  photos.ts                port of lib/photos.jsx (mock until pipeline is live)
```

**Navigation mapping** (from `lib/app.jsx`):
- Tabs: Camera / Gallery / Settings → `(tabs)`.
- Full-screen overlays Preview / Verify / Manifest → `(modal)` group with `presentation: 'fullScreenModal'` (they cover the tab bar in the prototype).
- Splash & Onboarding → top-level routes outside the tabs, shown before the user reaches the tabs.
- The camera tab uses a **dark** tab bar; Gallery/Settings use the themed (light/dark) tab bar. Either swap tab-bar style per route or render a custom `<TabBar>` (the prototype uses a custom one — see `lib/components.jsx`).

---

## 3. Theme tokens (paste-ready `theme/tokens.ts`)

Ported 1:1 from `lib/tokens.jsx`. **Do not invent colors — use these.**

```ts
// theme/tokens.ts
export type BadgeSkin = { bg: string; border: string; text: string };

export const PI_LIGHT = {
  // Brand
  navy: '#1A1A2E',
  purple: '#6C63FF',
  purpleLt: '#8B85FF',
  lavender: '#F0EFFF',
  // Status
  verified: '#27AE60',
  device: '#F5A623',
  alert: '#E74C3C',
  // Neutrals
  camBlack: '#111111',
  white: '#FFFFFF',
  offWhite: '#F7F6FF',
  grayMid: '#888888',
  grayLt: '#CCCCCC',
  // Semantic — light surface
  bg: '#FFFFFF',
  bgAlt: '#F7F6FF',
  bgCode: '#F4F4F8',
  text: '#1A1A2E',
  textBody: '#444444',
  textMuted: '#888888',
  border: '#CCCCCC',
  borderSoft: 'rgba(0,0,0,0.08)',
  // Badge skins
  badgeDevice: { bg: '#FFFBEB', border: '#F5A623', text: '#92400E' } as BadgeSkin,
  badgeCa:     { bg: '#ECFDF5', border: '#27AE60', text: '#065F46' } as BadgeSkin,
  badgeError:  { bg: '#FEF2F2', border: '#E74C3C', text: '#991B1B' } as BadgeSkin,
  badgeSign:   { bg: '#F0EFFF', border: '#6C63FF', text: '#4C1D95' } as BadgeSkin,
  // Mono accent
  mono: '#5B21B6',
  isDark: false,
};

export const PI_DARK = {
  ...PI_LIGHT,
  bg: '#0D0D1A',
  bgAlt: '#12122A',
  bgCode: '#12122A',
  text: '#FFFFFF',
  textBody: '#CCCCCC',
  textMuted: '#888888',
  border: '#2A2A4A',
  borderSoft: 'rgba(255,255,255,0.08)',
  lavender: '#1F1B3F',
  badgeDevice: { bg: '#2A1F0E', border: '#F5A623', text: '#FDD17A' } as BadgeSkin,
  badgeCa:     { bg: '#0C2A1A', border: '#27AE60', text: '#7EE2A8' } as BadgeSkin,
  badgeError:  { bg: '#2A0F0F', border: '#E74C3C', text: '#FCA5A5' } as BadgeSkin,
  badgeSign:   { bg: '#1A1840', border: '#6C63FF', text: '#C7C3FF' } as BadgeSkin,
  mono: '#C7C3FF',
  isDark: true,
};

export type Theme = typeof PI_LIGHT;

export const space  = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 20, full: 9999 };

// Type scale (px == dp). Use the system font; for mono load a real mono face.
export const type = {
  title:      { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  section:    { fontSize: 17, fontWeight: '600' },
  body:       { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '500' },
  caption:    { fontSize: 13, fontWeight: '500' },
  badge:      { fontSize: 12, fontWeight: '600', letterSpacing: 0.1 },
  monoLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
} as const;
```

**Fonts.** The prototype uses the system UI font (`-apple-system` / Roboto) — on RN that's the default, so no font file needed for sans. For the mono passages (hashes, keys, the manifest viewer, the cinematic HUD) load a real monospace face, e.g. **JetBrains Mono** or **Roboto Mono**, via `expo-font`/`@expo-google-fonts`, and apply `fontFamily: 'JetBrainsMono_400Regular'` (700 for labels). Without it, RN falls back to `monospace`/`Menlo` which is acceptable but less crisp.

---

## 4. ThemeProvider (`theme/ThemeProvider.tsx`)

```tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { PI_DARK, PI_LIGHT, Theme } from './tokens';

type Mode = 'light' | 'dark';
const Ctx = createContext<{ t: Theme; mode: Mode; setMode: (m: Mode) => void }>({
  t: PI_LIGHT, mode: 'light', setMode: () => {},
});

export function ThemeProvider({ children, initial = 'light' as Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const t = mode === 'dark' ? PI_DARK : PI_LIGHT;
  return <Ctx.Provider value={{ t, mode, setMode }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
```

For the camera, wrap that subtree in a **forced-dark** palette (`PI_DARK`) or just hardcode the viewfinder background to `camBlack` (`#111`) — see `SPECS.md` S-03. The prototype keeps the viewfinder dark even in light mode.

---

## 5. HTML → React Native cheatsheet

| Prototype (HTML/CSS) | React Native |
|---|---|
| `<div style={{display:'flex'}}>` | `<View>` (flex is the default; `flexDirection` defaults to `column`, so set `'row'` explicitly) |
| `<button onClick>` | `<Pressable onPress>` (+ `android_ripple` / pressed style) |
| `<span>` / text | `<Text>` (all text MUST be inside `<Text>`) |
| `gap: 12` in flex row | `gap: 12` (supported) or `columnGap`/`rowGap` |
| `position:absolute; inset:0` | `StyleSheet.absoluteFill` |
| `border: '1px solid X'` | `borderWidth: 1, borderColor: 'X'` |
| `borderRadius: '50%'` | `borderRadius: size/2` |
| `box-shadow: 0 1px 3px rgba(...)` | iOS: `shadowColor/Opacity/Radius/Offset`; Android: `elevation` |
| `backdrop-filter: blur(12px)` | `<BlurView intensity={..} tint="dark">` from `expo-blur` |
| `background: linear-gradient(...)` | `<LinearGradient colors={[...]}>` from `expo-linear-gradient` |
| `transition: transform 200ms` | Reanimated `withTiming`/`withSpring` on a shared value |
| `@keyframes` (flash, rise, shockwave, pulse, spin) | Reanimated timelines (§7) |
| `letterSpacing`, `textTransform:'uppercase'` | same prop names; `textTransform` supported |
| `cursor`, `:hover` | drop them (touch only); use `pressed` state for feedback |
| inline SVG icons | `react-native-svg` (`<Svg><Path .../></Svg>`) — port `lib/icons.jsx` |

---

## 6. Worked example — `VerificationBadge`

This is the most-reused component (5 states, 2 sizes). Here it is fully ported from `lib/components.jsx` so the rest follow the same pattern.

```tsx
// components/VerificationBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { IconShield, IconShieldCheck, IconShieldX, IconSparkle } from './icons';
import { Spinner, Pulse } from './Indicators';

type Status = 'ca' | 'device' | 'error' | 'signing' | 'certifying';

export function VerificationBadge({
  status = 'ca', size = 'md', label,
}: { status?: Status; size?: 'sm' | 'md'; label?: string }) {
  const { t } = useTheme();
  const skin = {
    ca: t.badgeCa, device: t.badgeDevice, error: t.badgeError,
    signing: t.badgeSign, certifying: t.badgeSign,
  }[status];
  const text = label ?? {
    ca: 'Pi Verified', device: 'Device Signed', error: 'Verification failed',
    signing: 'Signing…', certifying: 'Certifying…',
  }[status];
  const Icon = {
    ca: IconShieldCheck, device: IconShield, error: IconShieldX,
    signing: IconShield, certifying: IconSparkle,
  }[status];
  const compact = size === 'sm';

  return (
    <View style={[
      styles.badge,
      {
        paddingVertical: compact ? 4 : 6,
        paddingHorizontal: compact ? 10 : 12,
        backgroundColor: skin.bg,
        borderColor: skin.border,
      },
    ]}>
      <Icon size={compact ? 12 : 14} color={skin.text} stroke={2.2} />
      <Text style={{
        color: skin.text, fontSize: compact ? 11 : 12,
        fontWeight: '600', letterSpacing: 0.1,
      }}>{text}</Text>
      {status === 'signing' && <Spinner size={10} color={skin.text} />}
      {status === 'certifying' && <Pulse color={skin.text} />}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 6, borderRadius: radius.full, borderWidth: 1,
  },
});
```

`ShutterButton`, `CamControl`, `PillToggle`, `SigningToast`, `PiMark`, and the icon set follow the same translation rules. Their exact dimensions and states are in `lib/components.jsx` and `SPECS.md`.

---

## 7. Animations (Reanimated)

The prototype's CSS keyframes (defined in `screens/camera.jsx` and `lib/components.jsx`) map to Reanimated as follows. Durations/easings are in `README.md` → "Animations".

| Effect | Reanimated approach |
|---|---|
| Shutter press (`scale 0.92`) | `useSharedValue(1)` → `withSpring(0.92)` on pressIn, `withSpring(1)` on pressOut; `transform:[{scale}]` |
| Capture flash (`pic-flash`) | full-screen white `<Animated.View>`, opacity `0→1→0` via `withSequence(withTiming(1,{duration:60}), withTiming(0,{duration:160}))` |
| Hash glyphs rise (`pic-glyph-rise`) | ~28 absolutely-positioned `<Text>` glyphs; each `translateY` from 0→-160 + `opacity` 1→0 with a staggered `withDelay(i*8, ...)` |
| Shockwave ring (`pic-shockwave`) | 3 rings, `scale` 0→4 + `opacity` 0.8→0, stagger 0/200/400ms |
| Pi-mark stamp (`pic-stamp`) + scan line | mark `scale` 1.4→1 + opacity, plus a `translateY` scan line |
| Signing toast phases | drive a state machine with `setTimeout` (signing→signed 700ms→certifying 1700ms→verified 3000ms→hide 4500ms), animate enter/exit with `entering={SlideInDown}` / `exiting={SlideOutDown}` from `reanimated` |
| Tap-to-focus ring | on tap, place a 60×60 box at touch coords; `opacity`/`scale` fade over 1.5s |
| Spinner / pulse | `withRepeat(withTiming(...), -1)` rotation / scale |

Use `react-native-gesture-handler`'s `Gesture.Tap()` on the viewfinder to get focus coordinates, and `Gesture.LongPress()` in Gallery to enter selection mode.

---

## 8. Screen build order

Mirrors `README.md`'s checklist, tuned for Expo:

1. **theme/** — `tokens.ts`, `ThemeProvider.tsx`. Load mono font.
2. **components/icons.tsx** — port `lib/icons.jsx` to `react-native-svg`.
3. **components/** primitives — `VerificationBadge` (done above), `ShutterButton`, `CamControl`, `PillToggle`, `SigningToast`, `PiMark`, `TabBar`.
4. **Splash** (`app/splash.tsx`) + **Onboarding** (`app/onboarding.tsx`) — isolate-test theme + components. Splash is navy `#1A1A2E` with the drifting hash backdrop + pulsing shield.
5. **Navigation shell** — `app/_layout.tsx`, `(tabs)/_layout.tsx`, `(modal)/_layout.tsx`. Wire boot flow: splash → onboarding (first run) → tabs.
6. **Camera** (`(tabs)/camera.tsx`) — `expo-camera` viewfinder (always dark). Start with **Classic HUD + Hash capture FX** as the default; stub Minimal/Cinematic + Ring/Stamp behind a variant prop so they stay swappable (these were approved alternates).
7. **Preview** (`(modal)/preview/[id].tsx`) + **Manifest** (`(modal)/manifest/[id].tsx`) — wire to a real photo + manifest object.
8. **Gallery** (`(tabs)/gallery.tsx`) — `FlatList` 3-col grid, filter chips, long-press selection.
9. **Verify** (`(modal)/verify.tsx`) — file picker (`expo-image-picker`/`expo-document-picker`) → verifying → result state.
10. **Settings** (`(tabs)/settings.tsx`) — grouped rows, toggles, theme switch (drives `ThemeProvider`), online toggle (drives camera badge), destructive key-reset confirm sheet.

---

## 9. The capture → sign → certify pipeline (real product)

The prototype **fakes** this with timers and the `PHOTOS` array. The real behavior to implement:

1. **On first run** generate a device keypair; store the private key in **`expo-secure-store`** (Keychain / Keystore). This is the "Generating secure key…" splash state and the onboarding keygen step.
2. **On capture** (`expo-camera` `takePictureAsync`): hash the image bytes (`expo-crypto` SHA-256), build a C2PA-style manifest (see `lib/manifest.ts` shape ported from `screens/manifest.jsx`'s `MANIFEST_SAMPLE`), and sign the claim with the device key → badge state `device` ("Device Signed", orange). This works **offline**.
3. **When online** (and if "Auto CA Upgrade" is on in Settings): submit the signed manifest to the Pi CA, receive a certificate, embed it → badge upgrades to `ca` ("Pi Verified", green). This is the `signing → signed → certifying → verified` toast sequence.
4. **Verify screen**: re-hash an external file, parse its embedded manifest, check the signature + CA cert → one of `ca` / `device` / `tampered` / `none`.

Keep the real crypto in `lib/capture.ts` / `lib/manifest.ts` behind the same interface the screens already assume, so the UI doesn't change when you swap mock → real.

---

## 10. Gotchas

- **All text in `<Text>`.** Bare strings inside `<View>` throw.
- **`flexDirection` defaults to `column`** in RN (opposite of web). Every prototype row needs `flexDirection: 'row'`.
- **`gap` works** in modern RN — use it for rows/grids, matching the prototype.
- **Shadows differ per platform** — set both `shadow*` (iOS) and `elevation` (Android); the prototype's shadows are subtle, don't overdo `elevation`.
- **BlurView is the only real blur** — the camera controls and cinematic HUD rely on it; don't fake it with opacity.
- **Camera viewfinder stays `#111`** in both themes — don't let the theme repaint it.
- **Percent-positioned overlays**: use `StyleSheet.absoluteFill` + flex alignment instead of CSS `inset`/`%` tricks.
- **Safe areas**: wrap screens in `SafeAreaView` / use `useSafeAreaInsets()`; the prototype's device frames faked the notch — real devices need real insets. The camera top bar and bottom controls must clear the notch / home indicator.
- **HEIC**: the sample manifest uses `image/heic`; handle iOS HEIC capture/format explicitly if you mirror that.
```
