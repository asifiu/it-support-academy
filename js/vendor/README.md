# Vendored libraries

The app loads these files from its own origin, so the Content Security Policy in `index.html`
can allow scripts from `'self'` only and the KI tutor also works without a third-party CDN.

| File | Package | Version | Licence |
|---|---|---|---|
| `anthropic-sdk-1.14.0.js` | `@anthropic-ai/sdk` (npm) | 1.14.0, pinned | Apache-2.0, see `LICENSE-anthropic-sdk.txt` |

SHA-256 of `anthropic-sdk-1.14.0.js`: `1375a14f7141c1c6b6e17b684ce6f43c4fb0994fb00bb2fae8ce65d7786bf3fc`

## How it was built (2026-11-27)

```bash
npm init -y
npm install --save-exact --ignore-scripts @anthropic-ai/sdk@1.14.0 esbuild@0.28.2
echo 'export { default } from "@anthropic-ai/sdk";' > entry.mjs
npx esbuild entry.mjs --bundle --format=esm --platform=browser --minify --target=es2020 --legal-comments=eof --outfile=anthropic-sdk-1.14.0.js
```

To update: build the new version the same way, give the file the new version in its name,
change the path in `js/ki.js` and in `FILES` in `sw.js`, update this table, and bump `VERSION` in `sw.js`.
