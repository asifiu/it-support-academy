# Publishing to app stores (later)

The app is a Progressive Web App (PWA): one code base for phone, tablet and computer. Store packages wrap the same code; nothing has to be rewritten. Check each store's current rules and fees before you start.

| Platform | Tool | What you need |
|---|---|---|
| Android (Google Play) | PWABuilder (pwabuilder.com) or Bubblewrap: creates a Trusted Web Activity | Google Play developer account (one-time fee), the assetlinks.json file on the website to prove ownership |
| Windows (Microsoft Store) | PWABuilder: creates an MSIX package | Microsoft Partner Center developer account |
| iPhone / iPad (App Store) | Capacitor wraps the web app in a native shell; Apple expects app-like features (offline use, which this app has) | A Mac with Xcode, Apple Developer Program membership (yearly fee) |
| macOS, Linux, Windows desktop | Tauri (small) or Electron (larger) builds an installable desktop program | Free; code signing certificates are recommended |

Before submitting to any store:
1. Privacy policy page (the app stores progress only on the device; say so). If the KI tutor is enabled, explain that messages go to Anthropic with the user's own key.
2. Store listing: screenshots for phone and tablet (see docs/screenshots), a short and a long description, category Education.
3. Test the offline mode and the install on real devices.
4. Decide on the app name and check it is not a registered trademark.
