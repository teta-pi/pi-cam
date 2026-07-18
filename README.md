# Pi CAM

**Verified by Design** — C2PA-signed camera app for iOS & Android.

Part of [TETA+PI](https://github.com/teta-pi/infra) — Trust Infrastructure
for Digital Entities. Every capture signed on-device becomes a verified
block on the creator's TETA+PI profile: link an account via QR
(`modules/account`), then each photo/video uploads through
[`teta-pi/api`](https://github.com/teta-pi/api)'s `/media/device-upload` →
C2PA/OpenTimestamps verification → publicly provable via
[`teta-pi/mcp`](https://github.com/teta-pi/mcp)'s `teta_get_proof`.

## Quick Start

**⚠️ Expo Go will NOT run this app — see below before you scan the QR code.**

```bash
# Node 20 LTS or newer (tested with v24.16.0)
node --version

# Install dependencies
npm install

# Start the dev server
npx expo start
```

### Why Expo Go doesn't work

This app uses **React Native Reanimated 4** (`react-native-reanimated` +
`react-native-worklets`), which only supports the **New Architecture**. Expo
Go's prebuilt client app does not correctly initialize the New Architecture
for third-party projects using `react-native-worklets` yet — opening the app
in Expo Go crashes immediately on launch with:

```
[Reanimated] Reanimated 4 supports only the React Native New Architecture and web.
```

This is a known, currently-unresolved upstream limitation
([reanimated#8235](https://github.com/software-mansion/react-native-reanimated/issues/8235)),
not a bug in this repo — `app.json` already has the New Architecture correctly
enabled (`npx expo config --type introspect` confirms `RCTNewArchEnabled: true`
for both platforms), and all dependency versions are aligned to the installed
Expo SDK (`npx expo-doctor` → 18/18 checks pass).

**You must run a custom dev client instead of Expo Go.** Two ways to get one:

**A. Local build (needs full Xcode / Android Studio installed, not just the
Command Line Tools):**
```bash
npx expo run:ios       # builds + launches in the iOS Simulator
npx expo run:android   # builds + launches in an Android emulator/device
```

**B. Cloud build via EAS (no Xcode/Android Studio needed — needs a free Expo
account):**
```bash
npm install -g eas-cli
eas login
eas build --profile development --platform ios      # or: --platform android
```
EAS gives you an install link (or QR code) when the build finishes — install
that build on your phone like a TestFlight/internal build. Then:
```bash
npx expo start --dev-client
```
and open the project from **inside the installed dev-client app** (not Expo
Go) — scan the QR it prints, or tap the dev server it shows in the launcher.

## Build for Physical Device

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build iOS (requires Apple Developer account)
eas build --platform ios --profile preview

# Build Android APK
eas build --platform android --profile preview
```

## Architecture

```
app/            Expo Router screens (file-based navigation)
  index.tsx     Entry: checks keypair → splash → onboarding or camera
  onboarding    3-slide + key generation flow
  (tabs)/       Tab navigator: Camera | Gallery | Settings
  preview       Modal: photo preview + C2PA details
  verify        Modal: verify external content
  manifest      Modal: C2PA manifest JSON viewer

components/     Shared UI (pixel-perfect per design handoff)
  VerificationBadge  5 states × 2 sizes
  ShutterButton      photo/video/recording modes
  SigningToast       4-phase animated status
  PiMark             Shield + π SVG logo
  HashStream         Cinematic hex ticker
  JsonTree           Collapsible C2PA manifest viewer

modules/
  crypto/       Keypair generation + Secure Enclave / Keystore storage
  c2pa/         Offline C2PA manifest build + sign + verify
  watermark/    Badge overlay on shared copies (Phase 2)
  certificate/  Online Pi CA upgrade (Phase 2)

hooks/
  useDeviceKey      Keypair lifecycle (generate / check / reset)
  useNetworkStatus  Online/offline detection via NetInfo
```

## Verification Trust Levels

| Level | Indicator | Description |
|-------|-----------|-------------|
| 🟢 Pi Verified | CA-signed | Pi CA server stamp + RFC 3161 timestamp |
| 🟡 Device Signed | Device-only | ECDSA signature from device Secure Enclave |
| 🔴 Tampered | Error | Hash mismatch detected |

## Offline-First

All signing happens on-device with no network required:
1. Capture → raw bytes
2. SHA-256 hash of content
3. C2PA manifest assembled locally
4. Signed with device ECDSA keypair (Secure Enclave / Keystore)
5. Manifest saved as JSON sidecar
6. Saved to device gallery

Online CA upgrade (Phase 2) adds RFC 3161 timestamp + X.509 certificate.
