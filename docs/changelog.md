# Pi CAM — Changelog

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
