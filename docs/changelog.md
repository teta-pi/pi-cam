# Pi CAM — Changelog

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
