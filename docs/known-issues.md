# Known Issues — Pi CAM

Severity: 🔴 blocker · 🟠 important · 🟡 minor.

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
