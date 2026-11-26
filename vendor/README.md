# vendor/

Local package copies wired in through `overrides` in `package.json`. Each one exists
only because the fixed upstream release cannot be used as a drop-in override.

## decode-uri-component (0.5.1, CommonJS port)

- **Why:** `npm audit` flags `decode-uri-component <=0.5.0` (GHSA-qr28-fpjm-wq7f, high;
  GHSA-vcc3-ghjq-m6fr, moderate). It reaches us as expo-router 6 → query-string 7 →
  decode-uri-component 0.2.2. The fix is 0.5.1, but 0.5.x is ESM-only. query-string 7
  loads it with `require()` and calls the result as a function, which fails on an ESM
  namespace object.
- **What:** `index.js` is upstream 0.5.1 `index.js`, with one change: `export default`
  is replaced by `module.exports` (and `.default`). The license is copied unchanged.
- **Reachability:** expo-router only calls `queryString.stringify`, which does not
  decode. The vulnerable function is not called on the device today. The port keeps
  `parse` working if a future code path calls it.
- **Remove when:** expo-router stops depending on query-string 7, or upstream ships a
  CommonJS build. Then delete this folder and its `overrides` entry.
