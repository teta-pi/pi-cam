# Known Issues — Pi CAM

Severity: 🔴 blocker · 🟠 important · 🟡 minor.

## Android local build blocked by network access to Google's Maven repo — 2026-09-06 (session 14.4)

Goal: build the app with `npx expo run:android` (a real native build, no
EAS/Expo account) to sidestep the Expo Go / New Architecture crash
documented in `README.md`, and confirm whether a local dev-client build
actually works.

### 🔴 3. `npx expo run:android` fails before it can even test the New Architecture issue — this sandbox cannot reach `dl.google.com`
Environment setup all succeeded: `npx expo-doctor` → 17/18 (1 harmless patch
version mismatch, `expo`/`expo-constants`/`expo-file-system`/`jest-expo`
each one patch behind — unrelated to this issue), a full Android SDK was
already present at `/usr/local/share/android-commandlinetools` (cmdline-tools,
platform-tools, NDK 27.1.12297006, platforms 34/36, build-tools 36.0.0,
emulator), a portable JDK 17 was installed user-locally (Homebrew's
`temurin@17` cask needs `sudo`, which this session cannot supply — worked
around with the plain Adoptium tarball extracted to `~/android-tools`), and
the existing `PiCam_Test` AVD (Pixel 6, Android 14, `google_apis/x86_64`)
booted and reached `sys.boot_completed=1` without issue.

The actual Gradle build then failed — not with the reanimated/New
Architecture runtime crash, but earlier, at dependency resolution:
`react-native-reanimated`'s own `android/build.gradle` hardcodes
`classpath "com.android.tools.build:gradle:8.2.1"` in its `buildscript`
block, and Gradle could not fetch that (or several other
`com.android.tools.*`-namespaced artifacts) because **`dl.google.com`
returns a genuine 404 from Google's own infrastructure for every path
tried** — `/android/repository/platform-tools-latest-darwin.zip`,
`/android/maven2/...`, `/dl/android/maven2/...` — confirmed both via `curl`
and via a real browser tab (Google's own "Error 404 (Not Found)!!1" page,
`server: downloads` header). General internet access is fine (`google.com`,
`github.com` return 200); only this specific Google CDN is unreachable from
this sandbox's egress IP, almost certainly a datacenter-IP block on Google's
side rather than a local proxy issue.

**Diagnostic (not a fix, reverted after testing):** temporarily bumped the
hardcoded `8.2.1` to a version already cached locally (`8.5.0`) to see how
far the build would get. It failed at the same point, on the same class of
Google-exclusive artifacts (`com.android.tools.build:builder-test-api`,
`com.android.tools.layoutlib:layoutlib-api`, `androidx.databinding:*`,
`com.android.tools.utp:*`, etc.) — Maven Central was searched too and
correctly doesn't have them. This confirms the blocker is precisely and
only `dl.google.com`'s CDN, not a broader dependency or code problem, and
that the reanimated/New Architecture question from `README.md` was **not
re-tested** this session — the build never got far enough to reach it.

**What's needed:** either run this build from a machine/environment whose
egress IP isn't blocked by Google's `dl.google.com` CDN, or pre-populate
`~/.gradle/caches/modules-2` with the exact `com.android.tools.build:gradle`
version `react-native-reanimated` requires (currently `8.2.1`) plus its full
transitive graph from a machine that does have access, then retry offline.
Status: **OPEN / BLOCKED on network access to Google's Maven repo.** Chain
14.2 → 14.4 → 14.5 remains blocked, now for this reason rather than the
previously-suspected reanimated bug (which is still separately unresolved
upstream, just unconfirmed against a real local build).

## Live device QA — 2026-07-14 (session 14.2)

Goal was a full-chain live QA pass (QR-link → capture → upload → public
profile → MCP proof) against prod (`api.tetapi.dev`), plus a re-check of a
previously flagged web bug. Run from an agent session with no physical
device.

### 🔴 1. Steps 1–5 (full hardware round trip) not executed — needs a human with a physical device
This session has no camera, no Secure Enclave/Android Keystore, and cannot
sign in as the account owner (entering credentials is off-limits for an
agent). This is the same limitation already logged in this repo's
`CLAUDE.md` under "Not verified" from the prior session (2026-07-13) — it
has not changed since. Nothing here was run: no QR scan, no capture, no
device-upload, no check of `/e/{slug}`, `GET /businesses/{id}/proof`, or MCP
`teta_get_proof`.
**What's needed:** a human opens the app on a real iOS or Android device
(Expo Go or a dev build), signs into `app.tetapi.dev/profile` normally
(not via `/claim`), taps "Connect Pi CAM", scans the QR, captures a photo
and a video, and confirms:
1. `entity_id`/`entity_slug` are stored on-device after scan,
2. the C2PA manifest's producer assertion points at
   `https://app.tetapi.dev/e/{entity_slug}`,
3. `device-upload` succeeds and the capture lands in the "Pi CAM Captures"
   block on `/e/{slug}` with `c2pa_verified=true`,
4. `GET /businesses/{id}/proof` includes the capture,
5. MCP `teta_get_proof` surfaces the same proof.
Status: **OPEN / BLOCKED on hardware access.**

### 🟠 2. "Connect Pi CAM" on `/profile` ignores an existing `/login` or `/settings` session — forces a duplicate sign-in
Confirmed by reading the current code (not silently a no-op as originally
worded, but functionally broken the same way): `web/src/app/profile/page.tsx`
`PiCamSection.handleConnect` (around line 1268) reads its auth token only from
`useProfileStore().authToken` or the raw `localStorage["auth_token"]` key —
both of which are written to *only* by the `/claim` flow
(`web/src/app/claim/page.tsx`, `useProfileStore.setAuthToken`,
`web/src/stores/useProfileStore.ts:113`).

Meanwhile `/login` (`web/src/app/login/page.tsx:35,54`) and `/settings`
(`web/src/app/settings/page.tsx:26,216,285`) authenticate through a
completely separate store, `useAuthStore` (`web/src/stores/useAuthStore.ts`,
zustand `persist` under localStorage key `"tetapi-auth"`), and never touch
`useProfileStore.authToken` or `localStorage["auth_token"]`.

Net effect: a user who signs in via `/login` or sets a password via
`/settings`, then visits `/profile` and clicks "Connect Pi CAM", has
`authToken` resolve to `null` — `handleConnect` hits
`if (!token) { setShowLogin(true); return; }` and pops the `SignInModal`
again instead of using the session they already have. Only a user who
arrived via `/claim` (which populates `useProfileStore`/`auth_token`) sees
"Connect Pi CAM" work on the first click.

**Repro:** sign in at `app.tetapi.dev/login` (not `/claim`) → go to
`/profile` → click "Connect Pi CAM" → expect QR immediately; actually get
prompted to sign in again.
**Fix (belongs in `teta-pi/web`, not this repo):** `PiCamSection` should
read from `useAuthStore` (or both stores, with `useAuthStore` first) instead
of only `useProfileStore`/`auth_token`.
Status: **OPEN — still reproduces as of 2026-07-14.** Fix required in
`teta-pi/web`; flagging for the manager session (this repo, `pi-cam`, has no
ownership of `web/src/app/profile/page.tsx`).
