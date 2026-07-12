# Pi CAM

**Verified by Design** — C2PA-signed camera app for iOS & Android.

## Quick Start

```bash
# Install dependencies
npm install   # or: bun install

# Start Expo dev server
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

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
