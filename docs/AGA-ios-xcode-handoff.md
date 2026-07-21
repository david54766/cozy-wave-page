# AGA — iOS / Xcode Build Handoff

Scope: **add the iOS platform and ship an iOS build** for the AGA app. The web +
mobile codebase already exists and is cross-platform (Capacitor). This doc is
only the iOS-specific work — it must be done on **macOS with Xcode** (it cannot
be built on the Windows machine the rest of the project lives on).

The Android app is already built and shipping; iOS reuses the exact same web
bundle and Capacitor config. Nothing about the app's features/logic changes.

- Repo: https://github.com/david54766/cozy-wave-page (branch `main`)
- App name: **AGA** · Bundle identifier: **com.aga.community**
- Backend: Supabase project `mwasrotzbdsipnjdpotu` (no changes needed for iOS)
- Brand: primary `#4E89C4`; logo/crest at `src/assets/aga-logo.png`

**Current state (2026-07-15):** the web app is live at joinagalink.com with
Stripe subscriptions ($10.99/mo, $120/yr) handled **entirely on the website**.
The native apps (Android already, iOS here) **deliberately hide all purchase
UI** — this is an App Store compliance decision, see §4 below. The admin area,
auth, styling, and native behaviors are all working and shared. There is no
iOS-specific product work beyond native config, signing, icons, push, and
submission.

---

## 0. Prerequisites (Mac)

- macOS + **Xcode** (latest stable) + Command Line Tools (`xcode-select --install`)
- **CocoaPods** (`sudo gem install cocoapods` or `brew install cocoapods`)
- **Node.js LTS** + npm
- **Apple Developer Program** membership ($99/yr) — required for device
  installs, push, TestFlight, and App Store. Get the Team ID.
- Access to the GitHub repo (push access if you'll commit the `ios/` folder).

---

## 1. Get the project building (web bundle)

```bash
git clone https://github.com/david54766/cozy-wave-page
cd cozy-wave-page
npm install
```

Create `.env` (git-ignored) — same values the web/Android app uses:
```
VITE_SUPABASE_URL=https://mwasrotzbdsipnjdpotu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key — ask the owner>
VITE_SUPABASE_PROJECT_ID=mwasrotzbdsipnjdpotu
VITE_PUBLIC_SITE_URL=https://joinagalink.com
```

Build the static web bundle Capacitor loads (this is the key step — the app
ships as a static SPA in `dist/client`, NOT SSR):
```bash
MOBILE_BUILD=1 npm run build
# produces dist/client  (webDir in capacitor.config.ts)
```
> `MOBILE_BUILD=1` switches vite.config.ts to TanStack Start SPA mode. Without
> it you get an SSR build that won't work in a native shell.

---

## 2. Add the iOS platform

`capacitor.config.ts` already sets `appId: "com.aga.community"`, `appName: "AGA"`,
`webDir: "dist/client"`, plus SplashScreen/StatusBar plugin config — these apply
to iOS automatically.

```bash
npm install @capacitor/ios      # matches the existing @capacitor/* v8 deps
npx cap add ios
npx cap sync ios                # copies dist/client + installs pods for plugins
```

Installed Capacitor plugins that now need iOS handling (all have iOS support):
`@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar`,
`@capacitor/push-notifications`. (The Android back-button listener in
`src/components/native/NativeBootstrap.tsx` is a no-op on iOS — harmless.)

Open the workspace:
```bash
npx cap open ios     # opens ios/App/App.xcworkspace in Xcode
```

---

## 3. What already works cross-platform (no iOS work needed)

These are in the shared codebase and behave correctly on iOS via
`Capacitor.isNativePlatform()`:
- **Start at sign-in:** `/` redirects to `/auth` on native (`src/routes/index.tsx`);
  "Back to home" link hidden.
- **Safe areas:** CSS uses `env(safe-area-inset-*)` and the viewport meta has
  `viewport-fit=cover` — iOS notch/home-indicator insets are respected.
- **Splash/status bar/offline overlay:** `NativeBootstrap` hides the splash on
  mount, styles the status bar, shows an offline screen.
- **No purchase UI in native:** `CheckoutButton` and the upgrade-prompt card
  return `null` when `Capacitor.isNativePlatform()` — so on iOS there are no
  "Upgrade"/"Buy" buttons and no checkout. This is intentional (see §4). Members
  who already paid on the web get their access reflected in the app normally.
- **Styling pass, branding, logo, getPublicSiteUrl()** — all shared.

So most of the "app feel" is already done; the iOS work is native config,
signing, icons/splash, push (APNs), and App Store submission.

---

## 4. Payments & App Store compliance — READ THIS FIRST

AGA sells subscriptions, and Apple is strict about this. Getting it wrong is the
most common rejection for community/subscription apps.

**The chosen model: payments are web-only; the iOS app has NO purchase flow.**
- The app already hides all purchase/upgrade UI on native (see §3). **Keep it
  that way** — do not re-enable `CheckoutButton`, do not add a "Subscribe" or
  "Upgrade" button, and do **not** add a link/button that sends users to the
  website to pay. Apple rejects both in-app external-payment flows *and*
  "steering" links to an external purchase for digital goods.
- The iOS app is a **companion** to the web service: members sign in and use
  what their (web-purchased) membership unlocks. That is allowed.

**Do NOT, in the iOS build:**
- Show prices with a buy button, or any checkout.
- Add "manage/upgrade your membership on our website" links or buttons.
- Mention that a subscription can be purchased elsewhere.

**If App Review asks how users get a paid account:** answer honestly that
accounts are created and subscriptions are managed on the website; the app is a
companion that shows the member's existing content. Provide a working demo
login (see §8) so reviewers can see the app without needing to purchase.

**If the owner later wants to sell inside the iOS app:** that requires Apple
**In-App Purchase (StoreKit)** with Apple's cut — a separate build-out. Flag it
to the owner; don't improvise a workaround.

> Note: the pricing/plans routes still exist in the shared code. On native they
> render plan info without a buy button because `CheckoutButton` is hidden. If
> App Review objects to *any* price display, the cleanest fix is to also hide
> the pricing/plans entry points on native (gate on `isNativePlatform()`);
> coordinate with the owner before doing so.

---

## 5. iOS-specific configuration (in Xcode / Info.plist)

1. **Signing & Capabilities** (Xcode → target `App` → Signing & Capabilities):
   - Set **Team** (your Apple Developer team). Use **Automatically manage
     signing** for the first pass.
   - Confirm **Bundle Identifier = com.aga.community**.
2. **Display name:** target → General → Display Name = `AGA` (Xcode also reads
   `CFBundleDisplayName`).
3. **Deployment target:** Capacitor 8 supports iOS 14+; leave Xcode's default
   unless there's a reason to raise it.
4. **Status bar / splash background:** the splash uses white (`#ffffff`) to
   match `capacitor.config.ts`. Verify `ios/App/App/Assets.xcassets` splash +
   the `Info.plist` status bar style read well (light background, dark text).
5. **Privacy usage strings (Info.plist):** the app currently uses **URL-based**
   avatars/covers (no camera/photo library access), so no camera/photos strings
   are required today. If image *upload* from device is added later, add
   `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription`.
6. **App Transport Security:** all traffic is HTTPS (Supabase, joinagalink.com);
   no ATS exceptions needed.

---

## 6. Icons & splash

Reuse the crest. Put a padded square PNG (~1024px, logo on white) at
`assets/logo.png` in the repo, then:
```bash
npx @capacitor/assets generate --ios \
  --iconBackgroundColor '#ffffff' --splashBackgroundColor '#ffffff'
```
This fills `ios/App/App/Assets.xcassets`. Verify the 1024×1024 App Store icon is
present (required, no alpha). The Android generation already produced
`assets/logo.png`-style source; reuse the same crest so both stores match.

---

## 7. Push notifications on iOS (APNs) — optional, do when ready

The app side is already scaffolded (`src/lib/push.ts` uses
`@capacitor/push-notifications`, which on iOS registers with **APNs** and returns
a device token that's upserted into the `device_push_tokens` Supabase table).
iOS extras needed:
1. In Xcode → Signing & Capabilities, add **Push Notifications** and
   **Background Modes → Remote notifications**.
2. Create an **APNs Auth Key (.p8)** in the Apple Developer portal (Keys). Note
   the Key ID + Team ID.
3. Decide the sender path:
   - If using **Firebase Cloud Messaging** as the unified sender, add an iOS app
     to the Firebase project, download **GoogleService-Info.plist** into
     `ios/App/App/`, upload the APNs .p8 to Firebase, and add the Firebase iOS
     SDK. FCM then delivers to iOS via APNs.
   - Or send to **APNs directly** from the server for iOS tokens.
4. Run the `device_push_tokens` migration in Supabase if not already applied
   (`supabase/migrations/20260707000000_device_push_tokens.sql`). The server-side
   sender (Supabase Edge Function) is not built yet — coordinate with the owner.
5. iOS shows the notification-permission prompt on first `register()` after login.

> Note: the `platform` column in `device_push_tokens` will read `ios` for these
> tokens (the client sets it from `Capacitor.getPlatform()`), so a sender can
> route iOS vs android tokens correctly.

---

## 8. Build, test, submit

1. **Every JS change:** `MOBILE_BUILD=1 npm run build && npx cap sync ios`, then
   build in Xcode. (`cap sync` re-copies `dist/client` and updates pods.)
2. **Run on simulator/device:** select a target in Xcode → Run. Verify: opens on
   the sign-in screen, signup → onboarding → dashboard, tabs, keyboard doesn't
   cover fields, safe-area insets look right on a notch device, offline screen,
   sign out. (Test login: ask the owner for the throwaway test account.)
3. **Archive for the store:** Xcode → Product → Archive → Distribute App →
   App Store Connect / TestFlight.
4. **App Store Connect:** create the app (bundle id com.aga.community), upload
   the build, set up **TestFlight** for testing first. For submission you'll
   need: screenshots (iPhone 6.7" + 6.5" at minimum), description, keyword list,
   support URL, marketing URL, **privacy policy URL**, and the **App Privacy
   ("nutrition label")** answers — the app collects name, email, user content,
   and usage data via Supabase; no third-party ad tracking.

---

## 9. Versioning

Keep iOS in sync with the product version. In Xcode set **Version**
(`CFBundleShortVersionString`, e.g. 1.0) and **Build**
(`CFBundleVersion`, increment every upload). Android is currently versionName
"1.0" / versionCode 1 — match "1.0" for the first iOS release.

---

## 10. Gotchas / notes

- **Static SPA, not SSR** — always `MOBILE_BUILD=1` before `cap sync`.
- **WebView origin is a local scheme** (`capacitor://` on iOS) — the app already
  routes shareable/email links through `getPublicSiteUrl()`; don't use
  `window.location.origin` for links.
- **Deploying the web is separate** — the owner publishes the web app via
  Lovable; you don't need to touch web hosting for the iOS build.
- **Commit the `ios/` folder** (like `android/` is committed) if you want it in
  the repo; keep `GoogleService-Info.plist` / signing assets out of public
  forks. `.gitignore` already excludes keystores; add iOS signing secrets if
  needed.
- **Don't change** `appId`/`appName` in `capacitor.config.ts` — they must stay
  `com.aga.community` / `AGA` to match the Android app and the intended bundle id.

---

## 11. What to hand back

- The `ios/` project (committed or as a PR).
- The built/archived iOS app in App Store Connect (TestFlight link).
- Any iOS signing assets (APNs key, provisioning) documented for the owner.
- A note of the deployment target and any Info.plist additions you made.

Reference docs on the owner's machine (Desktop): `AGA-replica-playbook.md`
(the full Android/Capacitor build process, most of which is shared),
`aga-play-store/PUSH-NOTIFICATIONS-SETUP.md`, `aga-play-store/STRIPE-PAYMENTS-SETUP.md`
(context on the web-only payment model referenced in §4).
