# Pi CAM — Changelog

## 2026-10-06 · crypto · real ECDSA P-256 keys, SecureStore not Secure Enclave (session 14.12)
Done: replaced the fake crypto in `modules/crypto` — `generateKeypair()` used
to SHA-256 a random seed and wrap the hash in a fake PEM header, and `sign()`
was HMAC-SHA256, despite docs/comments/`algorithm:'ECDSA-P256'` claiming real
ECDSA (confirmed in prod: none of the then-5 registered devices had a valid
key). Owner decision 2026-10-05: real ECDSA P-256 via
`react-native-quick-crypto` (OpenSSL/BoringSSL-backed, Margelo/Austria —
origin-checked against the no-RU/BY-authors rule before installing; ruled out
`@noble/curves`, `elliptic`, and the PKI.js/ASN1.js family, all
Russian-origin authors), private key in `expo-secure-store` — **not**
hardware-backed (no Secure Enclave/StrongBox; that native module was
rejected, needs an EAS prebuild per change). Also fixed a real bug while in
there: `signMedia()`/`verifyMedia()` hashed `sha256(base64(bytes))` — the
*text* of the base64 encoding — never the same hash a backend computing
`sha256(bytes)` from the uploaded file would get. Now hashes
`File.bytes()` directly (`sha256Bytes`, backed by `expo-crypto`'s
`digest()`), and signs that content hash (not the manifest JSON) — the
signature travels as new `content_signature`/`signature_alg` FormData
fields on `POST /media/device-upload`, alongside the existing
`manifest_json` (contract proposed here, not yet implemented backend-side —
see `teta-pi/infra` roadmap 1.29). Migration: a key stored before this
session (no `picam_key_format` marker) is detected as legacy on next launch
(`app/index.tsx`, `hooks/useDeviceKey.ts`) and wiped along with the local
account link — `clearLocalAccountOnly()` — then the user is sent through
onboarding again with an honest "we upgraded your key, re-link your account"
message, instead of every sign/upload silently failing forever against a
key that was never valid.
Changed: `modules/crypto/{index,keystore}.ts` (real keygen/sign, format
marker), `modules/c2pa/{index,manifest}.ts` (raw-bytes hash, sign the hash,
`signatureAlg`), `modules/account/index.ts` (`content_signature`/
`signature_alg` fields, `clearLocalAccountOnly()`), `hooks/useDeviceKey.ts`,
`app/index.tsx`, `app/onboarding.tsx`, `app/(tabs)/camera.tsx` (thread the
signature through); `package.json` (+`react-native-quick-crypto`,
`react-native-nitro-modules`, `react-native-quick-base64`, `@types/jest`
dev); `README.md`/`CLAUDE.md` — dropped every "Secure Enclave" claim, now
says SecureStore + real ECDSA P-256 honestly. New: 13 jest unit tests
(`modules/{crypto,c2pa}/__tests__`) — keygen/sign/verify round trip, legacy-
key detection, the content-hash regression, **and** an independent `openssl
ec -pubin` / `openssl dgst -verify` cross-check of the exported PEM and a
real signature (not just our own code agreeing with itself). `npx tsc
--noEmit` clean, `expo-doctor` 17/18 (the 1 failure is pre-existing patch-
version drift, unrelated).
Risk: `react-native-quick-crypto` is a native Nitro module — needs `expo
prebuild` + a real EAS build before any of this runs on a device; this
sandbox can't reach `dl.google.com` for a local Android build (same
long-standing blocker as 14.4/14.5), so the real device round-trip
(generate → sign → upload → backend verifies `content_signature`) is
**unverified end-to-end**. The jest tests prove the wrapper logic and the
PEM/signature format are correct against an independent tool, not that the
on-device native binding behaves identically — Nitro's C++/OpenSSL path is
a different code path from the Node `crypto` stand-in the tests mock it
with.
Next: owner runs an EAS build, confirms `generateKeypair()` produces a real
key on-device and `openssl ec -pubin` still accepts it (same test, by eye,
on a real export). Backend session (1.29, `teta-pi/api`) implements
`content_signature`/`signature_alg` verification on `/media/device-upload`
against this contract (proposed in `teta-pi/infra` docs PR, roadmap 14.12).
Separately: every device that registered a key before this migration will
silently get a *new* key and lose its account link next launch — worth a
heads-up to any real users before this ships, since `/profile` → unlink →
relink is manual.

## 2026-09-06 · build · Android local build attempt via `npx expo run:android` (session 14.4, reissued)
Done: reissue of a previously-issued but never-completed boot (0 new PRs
since). Set up a full local Android toolchain from scratch in this session's
environment — portable JDK 17 (Adoptium tarball, since Homebrew's cask
needs `sudo` this session can't supply), confirmed the pre-existing Android
SDK at `/usr/local/share/android-commandlinetools` (cmdline-tools,
platform-tools, NDK 27.1.12297006, platforms 34/36, build-tools 36.0.0,
emulator + `PiCam_Test` AVD), booted the AVD successfully, ran
`npx expo-doctor` (17/18, harmless), then `npx expo run:android`.
Changed: `docs/known-issues.md` — new entry #3 for this session's finding.
Risk: the build fails at Gradle dependency resolution, before it can even
reach the reanimated/New Architecture code path — `dl.google.com` (Google's
Maven/SDK download CDN) returns a genuine 404 for every path tried from this
sandbox's network, confirmed via curl and a real browser tab. This is a new,
distinct blocker from the previously-documented Expo Go/New Architecture
crash in `README.md` — that question remains unconfirmed against a real
local build. Diagnostic patch (bumping the AGP version reanimated hardcodes)
was tried and reverted; it hit the same class of Google-exclusive artifacts,
confirming the network block is the sole cause here.
Next: either run this build from an environment with unblocked access to
`dl.google.com`, or pre-seed `~/.gradle/caches/modules-2` with
`com.android.tools.build:gradle:8.2.1` and its transitive deps from a
machine that has access, then retry. Chain 14.2 → 14.4 → 14.5 stays
blocked, now for this reason.

## 2026-07-14 · QA · live device round-trip attempt + web bug re-check (session 14.2)
Done: attempted full-chain live QA (QR-link → capture → C2PA → device-upload
→ `/e/[slug]` → `GET /proof` → MCP `teta_get_proof`) against prod. Steps
1–5 could not be executed — no physical device/camera/Secure Enclave
available to this session, and signing in as the account owner is off-limits
for an agent. Re-checked the previously flagged `/profile` "Connect Pi CAM"
bug by reading current code instead: confirmed still open, and more
precisely characterized (forces a duplicate sign-in rather than a silent
no-op) — root cause is `PiCamSection` reading only `useProfileStore`/
`localStorage["auth_token"]` (populated by `/claim` only) while `/login` and
`/settings` authenticate via the separate `useAuthStore`.
Changed: added `docs/known-issues.md` to this repo (didn't exist before).
Risk: full hardware round trip for this repo is still unverified end-to-end
on real hardware — this has now been true across two sessions
(2026-07-13, 2026-07-14) and needs a human to unblock.
Next: a human runs the 5-step live QA pass on a real device; separately, a
`teta-pi/web` session fixes `PiCamSection` to also check `useAuthStore`.
