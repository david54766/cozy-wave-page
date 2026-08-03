# Prompt for Codex (macOS + Xcode) — build & ship AGA for iOS

Paste everything between the lines into Codex on the Mac.

---

You are Codex, working on **macOS with Xcode**. Your job: build the **iOS**
version of an existing Capacitor app and get it uploaded to App Store Connect /
TestFlight. The web and Android apps are already live — iOS reuses the exact same
web bundle. **Do not change app features, logic, or styling.**

## Project facts
- **Repo:** https://github.com/david54766/cozy-wave-page — branch `main`
- **App name:** `AGA` · **Bundle ID:** `com.aga.community`
- **Operating entity:** Classroom Panda LLC · **Support:** info@easyfill.ai
- **Backend:** Supabase (client keys below are publishable — safe in the bundle)
- **Website:** https://joinagalink.com

## GUARDRAILS — do not violate
1. **No in-app purchases and no purchase UI.** Payments are web-only by design and
   are already hidden on native (`Capacitor.isNativePlatform()`). Do **not** add
   StoreKit/IAP, a "Subscribe/Upgrade" button, or any link that sends users to the
   website to pay. Apple rejects both. If you think a purchase surface is needed,
   STOP and ask.
2. **Keep the Sign up tab.** Free account creation is allowed and expected; an app
   that requires an account with no way to create one gets rejected.
3. **Do not change** `appId` / `appName` / `webDir` in `capacitor.config.ts`, or
   `vite.config.ts`, or any shared React code — except the iOS-specific files this
   prompt names (Info.plist, Xcode project, iOS assets).
4. **Always run `MOBILE_BUILD=1 npm run build` before `npx cap sync ios`.** A plain
   build produces an SSR bundle that will not run in the WebView.
5. **Do not commit secrets** — `.env`, `GoogleService-Info.plist`, signing assets.
6. If a step needs an Apple Developer account, certificate, or an asset you don't
   have, STOP and list exactly what you need. Do not fabricate credentials.

## 1. Environment
```bash
xcode-select --install            # if needed; install Xcode from the App Store
sudo gem install cocoapods        # or: brew install cocoapods
node --version                    # Node 20 LTS ideal
git clone https://github.com/david54766/cozy-wave-page
cd cozy-wave-page
npm install
```

Create `.env` in the repo root (publishable/client-side values):
```
VITE_SUPABASE_URL=https://mwasrotzbdsipnjdpotu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GKp_6wv66jFlspeXbvMMww_84l5vQ1n
VITE_SUPABASE_PROJECT_ID=mwasrotzbdsipnjdpotu
VITE_PUBLIC_SITE_URL=https://joinagalink.com
```

Build the static bundle Capacitor loads:
```bash
MOBILE_BUILD=1 npm run build      # produces dist/client
```
Confirm `dist/client/index.html` exists before continuing.

## 2. Add the iOS platform
`capacitor.config.ts` already sets appId/appName/webDir and Splash/StatusBar.
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync ios                  # copies dist/client + installs pods
npx cap open ios                  # opens ios/App/App.xcworkspace
```
Existing plugins (all iOS-compatible): `@capacitor/app`, `@capacitor/splash-screen`,
`@capacitor/status-bar`, `@capacitor/push-notifications`. The Android back-button
listener in `NativeBootstrap.tsx` is a harmless no-op on iOS.

Commit the generated `ios/` folder once it builds. Keep signing files and
`GoogleService-Info.plist` git-ignored.

## 3. Xcode config (target `App`)
- **Signing & Capabilities:** set **Team** to the owner's Apple Developer team,
  enable automatic signing, confirm **Bundle Identifier = `com.aga.community`**.
- **General → Display Name:** `AGA`
- **Version:** `1.0` · **Build:** `1`
- Leave the deployment target at Xcode's default (Capacitor 8 supports iOS 14+).
- **Do NOT** add In-App Purchase / StoreKit.

## 4. Info.plist — REQUIRED
The app lets members pick photos for profile/cover and attach images in chat, and
plays lesson videos. Add:

| Key | Value |
|---|---|
| `NSPhotoLibraryUsageDescription` | `AGA needs access to your photos so you can set your profile picture, cover image, and share images in chat.` |
| `NSCameraUsageDescription` | `AGA needs camera access if you choose to take a new photo for your profile, cover, or a chat message.` |
| `ITSAppUsesNonExemptEncryption` | `NO` (Boolean) — standard HTTPS only; stops Apple asking on every upload |

No App Transport Security exceptions — all endpoints are HTTPS.
No extra Capacitor plugins are needed: uploads use a standard HTML file input,
which WKWebView handles with the system picker via the strings above.

## 5. App icon
A ready **1024×1024, opaque (no alpha)** App Store icon is committed at
**`assets/appicon-ios-1024.png`** — it is the AGA crest, emblem-only, correctly
cropped and centered (this matches the fixed Android icon).

In Xcode → `Assets.xcassets` → **AppIcon**, set the 1024pt "App Store" slot to
that file (single-size is fine; Xcode generates the rest). The icon must have
**no alpha channel** and must not be pre-rounded — iOS rounds it.

Splash: `npx @capacitor/assets generate --ios --splashBackgroundColor '#ffffff'`
using the repo's `assets/splash.png` / `splash-dark.png`.

## 6. Push notifications (only if the owner supplies Firebase/APNs assets)
The client is already wired (`src/lib/push.ts` → `device_push_tokens`), and the
server sender exists. For iOS:
1. Xcode → Signing & Capabilities → add **Push Notifications** and
   **Background Modes → Remote notifications**.
2. Owner provides `GoogleService-Info.plist` (from the existing Firebase project
   **`aga-community`**) → place in `ios/App/App/`, and uploads an **APNs Auth Key
   (.p8)** to Firebase → Cloud Messaging.
3. If those assets aren't available yet, **skip push** — the app builds and runs
   fine without it. Do not block the build on push.

## 7. Build, run, smoke-test
```bash
MOBILE_BUILD=1 npm run build && npx cap sync ios
```
Run on an iPhone simulator (use a 6.7"/6.9" for screenshots). Sign in with the
demo member account:
```
appreview@agatester.dev / AgaReview!2026
```
Verify:
- Opens on the **Sign in** screen (native starts at `/auth`, not the marketing page).
- Sign in → dashboard. Bottom tabs (Home, Spaces, Feed, Chat, Profile) navigate.
- **Spaces** list shows Spaces with cover images; opening one works.
- **Feed** loads posts; you can publish a post (pick a Space first).
- **Events** lists upcoming events; **tapping an event opens its detail page** and
  RSVP works. *(This was a bug fixed recently — verify it explicitly.)*
- **Courses → a course → a lesson**: the lesson video shows a **thumbnail** and
  plays (one lesson uses a direct .mp4, one uses YouTube — check both).
- **Chat → New → pick a member → Start chat**, then send a message. Must work
  with **no permission errors**.
- **Members** directory lists members and search filters them.
- Settings shows **Delete account**, **Blocked members**, and Terms/Privacy links.
- **No "Upgrade"/purchase buttons anywhere** (correct — payments are web-only).
- Keyboard doesn't cover inputs; safe-area insets look right on a notch device.

Report anything broken with the exact error before archiving.

## 8. Archive & upload
1. Select **Any iOS Device (arm64)** → Product → **Archive**.
2. Distribute App → **App Store Connect** → Upload.
3. In App Store Connect: create the app (bundle id `com.aga.community`), attach
   the build to **TestFlight** internal testing first.
4. The owner has a prepared answers file for the listing and App Privacy —
   ask for `AGA-app-store-submission-packet.md`.

## 9. What to hand back
- The committed `ios/` project (or a PR against `main`).
- The build in App Store Connect + a TestFlight link.
- The Info.plist keys you added and the deployment target you set.
- Smoke-test results from §7, explicitly confirming: event detail opens, chat
  creation works, lesson video shows a thumbnail and plays, and no purchase UI.
- Anything still blocked (signing, APNs, etc.).

## 10. Gotchas
- **`MOBILE_BUILD=1` every time before `cap sync ios`** — otherwise the WebView
  loads a broken SSR bundle (blank screen/errors).
- **WebView origin is `capacitor://localhost`.** Never introduce relative
  `/api/*` calls in native paths — shareable links use `getPublicSiteUrl()` and
  account deletion uses a Supabase RPC for exactly this reason.
- **Pods:** if a build fails right after `cap sync`, run `cd ios/App && pod install`
  and reopen the workspace.
- Deploying the website is separate (the owner publishes via Lovable); you don't
  touch web hosting.

---

---

# ADDENDUM — Capture App Store screenshots (do this after §7 smoke-test passes)

Apple requires **6.9" iPhone** screenshots: **1290 × 2796** portrait.
Uploading one 6.9" set is enough — Apple scales it for other sizes.

## Simulator to use
`iPhone 16 Pro Max` (or the newest "Pro Max" available) — it renders natively at
1290×2796, so no resizing is needed.

```bash
xcrun simctl list devices | grep -i "Pro Max"        # find the device
open -a Simulator                                     # boot it, then run the app from Xcode
```

## Capture
With the app running and signed in as `appreview@agatester.dev / AgaReview!2026`:

```bash
mkdir -p ~/Desktop/aga-ios-screenshots
shot() { xcrun simctl io booted screenshot ~/Desktop/aga-ios-screenshots/$1; }
```
Navigate to each screen in the simulator, then run the matching command:

| # | Screen | Command |
|---|--------|---------|
| 1 | Dashboard (Home tab) | `shot 01-dashboard.png` |
| 2 | Spaces (shows cover images) | `shot 02-spaces.png` |
| 3 | Feed | `shot 03-feed.png` |
| 4 | Events (upcoming list) | `shot 04-events.png` |
| 5 | A lesson with the video visible | `shot 05-course-lesson.png` |
| 6 | Chat (Messages list or a thread) | `shot 06-chat.png` |
| 7 | Members directory | `shot 07-members.png` |

## Verify before uploading
```bash
cd ~/Desktop/aga-ios-screenshots && sips -g pixelWidth -g pixelHeight *.png
```
Every file must read **1290 × 2796**. If the simulator produced a different size,
re-run on a Pro Max device rather than scaling the images.

## Rules
- Do **not** upscale Android screenshots — they have Android status bars and will
  look wrong. Capture on the iOS simulator.
- No purchase/upgrade UI may appear in any screenshot.
- Avoid capturing anything still labelled with test/debug text.
