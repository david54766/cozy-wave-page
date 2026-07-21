# AGA — iOS/Xcode Build: Handoff for Codex

You are **Codex**, an autonomous coding agent working on **macOS with Xcode**.
Your mission: **add the iOS platform to an existing Capacitor app and produce a
working, App-Store-ready iOS build.** The web + Android app already exist and are
live; iOS reuses the exact same web bundle and Capacitor config. Do not change
app features or logic.

Read §0 (guardrails) and §9 (owner-dependent items) before you start.

- **Repo:** https://github.com/david54766/cozy-wave-page — branch `main`
- **App name:** `AGA` · **Bundle identifier:** `com.aga.community`
- **Backend:** Supabase (client keys below; nothing to change server-side)
- **Platform to add:** iOS. Android already ships from `android/`.

---

## 0. GUARDRAILS — do NOT violate these

1. **No in-app purchases / no purchase UI.** Payments are web-only by design and
   are already hidden on native (`CheckoutButton` and the upgrade card return
   `null` when `Capacitor.isNativePlatform()`). **Do not** re-enable them, add a
   "Subscribe/Upgrade" button, add Apple IAP/StoreKit, or add any link/button
   that sends users to the website to pay. Apple rejects both. If you think a
   purchase surface is needed, STOP and ask the owner.
2. **Do not change** `appId` / `appName` / `webDir` in `capacitor.config.ts`.
3. **Do not change** `vite.config.ts`, the auth flow, styling, or any shared
   React code except where this doc explicitly tells you to (Info.plist,
   Xcode project, iOS assets).
4. **Do not commit secrets.** `.env`, `GoogleService-Info.plist`, and signing
   assets stay out of git.
5. **Always run `MOBILE_BUILD=1 npm run build` before `npx cap sync ios`** — a
   plain build produces an SSR bundle that will not run in the WebView.
6. If a step needs an Apple Developer account, signing certificate, Supabase
   change, or an asset you don't have, STOP and list it for the owner (see §9).
   Do not fabricate credentials.

---

## 1. Environment setup

Install prerequisites:
```bash
xcode-select --install                 # Command Line Tools (if not present)
# Install Xcode from the App Store if missing.
sudo gem install cocoapods             # or: brew install cocoapods
node --version                         # need Node 18+ (20 LTS ideal)
```

Clone and install:
```bash
git clone https://github.com/david54766/cozy-wave-page
cd cozy-wave-page
npm install
```

Create `.env` in the repo root (these are client-side/public values — the
publishable key is meant to ship in the browser bundle, so it is safe here):
```
VITE_SUPABASE_URL=https://mwasrotzbdsipnjdpotu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GKp_6wv66jFlspeXbvMMww_84l5vQ1n
VITE_SUPABASE_PROJECT_ID=mwasrotzbdsipnjdpotu
VITE_PUBLIC_SITE_URL=https://joinagalink.com
```

Build the static web bundle Capacitor loads:
```bash
MOBILE_BUILD=1 npm run build
# Produces dist/client (this is capacitor.config.ts `webDir`).
```
Confirm `dist/client/index.html` exists before continuing.

---

## 2. Add the iOS platform

`capacitor.config.ts` already sets `appId: "com.aga.community"`,
`appName: "AGA"`, `webDir: "dist/client"`, and SplashScreen/StatusBar config —
these apply to iOS automatically.

```bash
npm install @capacitor/ios            # v8, matches existing @capacitor/* deps
npx cap add ios
npx cap sync ios                      # copies dist/client + installs pods
npx cap open ios                      # opens ios/App/App.xcworkspace in Xcode
```

Capacitor plugins already in the project (all support iOS):
`@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar`,
`@capacitor/push-notifications`. The Android back-button listener in
`src/components/native/NativeBootstrap.tsx` is a no-op on iOS (harmless).

Commit the generated `ios/` folder (like `android/` is committed) when the
build works. Ensure `ios/App/App/GoogleService-Info.plist` (if added later) and
any signing files are git-ignored.

---

## 3. Xcode configuration (target: `App`)

1. **Signing & Capabilities:**
   - Set **Team** to the owner's Apple Developer team (owner provides — §9).
   - Enable **Automatically manage signing** for the first pass.
   - Confirm **Bundle Identifier = `com.aga.community`**.
2. **General → Display Name:** `AGA`.
3. **Deployment target:** leave Xcode's default (Capacitor 8 supports iOS 14+).
4. **Do not** add StoreKit/In-App Purchase capability (see §0).

---

## 4. Info.plist — REQUIRED additions

Add these keys to `ios/App/App/Info.plist`:

- **`ITSAppUsesNonExemptEncryption`** = `NO` (Boolean). Standard HTTPS/TLS only,
  which is exempt; stops Apple asking on every upload.
- **`NSPhotoLibraryUsageDescription`** = `AGA needs access to your photos so you
  can set a profile picture or share images in chat.` — REQUIRED: the app now
  lets members upload/crop a profile or cover image and attach images in chat.
  Without this the photo picker can crash/be rejected.
- **`NSCameraUsageDescription`** = `AGA needs camera access if you choose to take
  a new photo.` — the file input may offer "Take Photo".
- **No App Transport Security exceptions** — all endpoints are HTTPS.

> Image upload, the crop tool (react-easy-crop, canvas-based), and chat image
> attachments are all in the shared web code — they work on iOS automatically
> once these Info.plist strings are present. Nothing else to build for them.

---

## 5. Icons & splash

Source art is the AGA crest. The full-bleed icon source and separate splash
source already exist in the repo: `assets/icon-only.png`,
`assets/icon-foreground.png`, `assets/icon-background.png`, `assets/splash.png`,
`assets/splash-dark.png`. Generate iOS assets:
```bash
npx @capacitor/assets generate --ios \
  --iconBackgroundColor '#ffffff' --splashBackgroundColor '#ffffff'
```
Verify `ios/App/App/Assets.xcassets` has the AppIcon set including the **1024×1024
App Store icon (no alpha channel)** and the splash (white `#ffffff` background).

> **Icon must fill the tile.** The crest should be large (it was fixed to fill on
> Android). If Xcode's generated AppIcon looks small/over-padded, replace the
> generated PNGs with resized versions of `assets/icon-only.png` (full-bleed
> crest) at the required sizes so the crest fills the icon.

---

## 6. Push notifications (APNs) — do this only when the owner provides Firebase/APNs assets

The app side is already scaffolded: `src/lib/push.ts` uses
`@capacitor/push-notifications`, which on iOS registers with **APNs** and upserts
the device token into the Supabase `device_push_tokens` table. iOS setup:
1. Xcode → Signing & Capabilities → add **Push Notifications** and
   **Background Modes → Remote notifications**.
2. Owner creates an **APNs Auth Key (.p8)** in the Apple Developer portal and
   decides the sender path:
   - **Firebase (recommended, unified with Android):** add an iOS app to the
     Firebase project, place **`GoogleService-Info.plist`** in `ios/App/App/`,
     upload the APNs .p8 to Firebase, add the Firebase iOS SDK. FCM delivers to
     iOS via APNs.
   - Or send to APNs directly server-side for iOS tokens.
3. If Firebase assets aren't available yet, **skip push** — the scaffold stays
   dormant and the app builds/runs fine without it. Do not block the build on push.

The `device_push_tokens.platform` column will read `ios` for these tokens (set
from `Capacitor.getPlatform()`), so a server sender can route iOS vs Android.

---

## 7. App Store compliance already implemented (verify present; do not remove)

These exist in the shared code and satisfy App Review requirements:
- **In-app account deletion** (Guideline 5.1.1(v)): Settings → Danger zone →
  "Delete account" → confirm dialog → calls Supabase RPC `delete_own_account`.
- **Block user** (Guideline 1.2, UGC): Block/Unblock on a member's profile;
  blocked members' feed posts and chat messages are hidden; managed in
  Settings → Blocked members.
- **Report content** (Guideline 1.2): report actions in chat and feed.
- **Terms/EULA acceptance**: signup requires agreeing to the Terms of Use +
  Privacy Policy (checkbox); in-app pages at `/terms` and `/privacy`.
- **Cookie consent**: shown on web only, hidden in the native app (correct — do
  not try to surface it on iOS).
- **Sign in with Apple:** NOT required (email/password only, no social login).

> These depend on Supabase migrations/config the **owner** must apply
> (`blocked_users`, `delete_own_account`, and a public `profiles` storage bucket
> with write policies for image upload). If block/delete/upload error at runtime,
> that's the owner's DB/storage step, not an iOS bug — flag it, don't try to fix
> it in the app. Image upload uses `supabase.storage` (works cross-platform); it
> does NOT use a relative `/api/*` route.

---

## 8. Build, run, and smoke-test

Rebuild the web bundle and sync after any JS change:
```bash
MOBILE_BUILD=1 npm run build && npx cap sync ios
```
Then in Xcode: select an **iPhone Simulator** (a Pro Max for screenshots) → Run.

Smoke test (get a demo member login from the owner — §9):
- App opens on the **Sign in** screen (native starts at `/auth`, not the marketing page).
- Sign in → onboarding (if new) → dashboard.
- Bottom tabs (Home, Spaces, Feed, Chat, Profile) all navigate.
- Keyboard does not cover form fields; safe-area insets look correct on a notch device.
- Offline: toggle the simulator's network off → the offline overlay shows.
- **No "Upgrade"/purchase buttons anywhere** (correct — payments are web-only).
- Settings shows **Delete account** and **Blocked members** sections.
- Profile → **Upload photo** opens the photo picker → a **crop dialog** (square)
  appears → saving uploads and shows the new avatar. Cover uses a 3:1 crop.
- Chat has an **image attach** button that sends an image message.
  (Upload/crop need the owner's `profiles` bucket set up — see §7.)
- Sign out returns to the sign-in screen.

Report anything broken with the exact error before proceeding to archive.

---

## 9. Owner-dependent items — STOP and request these; do not fabricate

- **Apple Developer Program** membership + **Team ID** (for signing, push, TestFlight).
- **Signing:** either automatic-signing under the owner's team, or a distribution
  certificate + provisioning profile the owner supplies.
- **Demo member login** (email + password) for the smoke test and App Review.
- **Push:** Firebase iOS config (`GoogleService-Info.plist`) and/or APNs `.p8`
  key — only if push is in scope now.
- **Supabase migrations run** (`blocked_users`, `delete_own_account`) — owner's task.
- **App Store Connect listing content** — the owner has a prepared answers file
  (`AGA-app-store-submission-answers.md`): app description, keywords, App Privacy
  ("nutrition label") answers, age-rating answers, review notes, privacy-policy
  and EULA URLs. Ask for it when filling the listing.

---

## 10. Archive & submit

1. Xcode → set **Version** (`CFBundleShortVersionString`) = `1.0` and
   **Build** (`CFBundleVersion`) = `1` (match Android's 1.0).
2. Product → **Archive** → Distribute App → **App Store Connect** → upload.
3. In App Store Connect: create the app (bundle id `com.aga.community`), attach
   the build to a **TestFlight** internal test first.
4. Fill the listing from the owner's answers file; add screenshots captured on
   the iPhone 6.7" simulator; provide the demo login in App Review notes.

---

## 11. What to hand back to the owner

- The committed `ios/` project (or a PR against `main`).
- The archived build in App Store Connect + a TestFlight link.
- Any Info.plist additions and the deployment target you set.
- A list of anything from §9 you still need.
- Confirmation of the smoke-test results (§8), including that no purchase UI
  appears and Delete-account / Block features are present.

---

## 12. Gotchas

- **`MOBILE_BUILD=1` every time before `cap sync ios`** — else the WebView loads
  a broken SSR bundle (blank/errors).
- **WebView origin is `capacitor://localhost`.** Relative `/api/*` fetches would
  hit the local origin, not the server. The app already handles this: shareable
  links use `getPublicSiteUrl()`, account deletion uses a Supabase **RPC** (not a
  server route), and purchase server routes are never called on native (UI hidden).
  Do not introduce new relative `/api/*` calls in native paths.
- **Deploying the web is separate** (owner publishes via Lovable). You don't touch
  web hosting for the iOS build.
- **Pods:** if a build fails after `cap sync`, run `cd ios/App && pod install`
  then reopen the workspace.
- **Reference:** `AGA-ios-xcode-handoff.md` (human version of this) and
  `AGA-app-store-submission-answers.md` live on the owner's machine.
