# AGA — iOS Update (incremental) for Codex

**Read this first, then follow the mechanics in `AGA-xcode-handoff-for-codex.md`.**
This doc covers ONLY what changed since the last TestFlight/App Store build. The
Xcode project, signing, capabilities, and archive steps are unchanged — reuse
the existing project on the Mac. Do **not** regenerate the iOS project.

---

## What's new in this update (the 2–3 things not yet submitted)

1. **Image upload from device + crop tool** — members can pick a photo from their
   library (or take one with the camera) for their **profile avatar** and
   **cover banner**, then crop it to the required ratio before it uploads to
   Supabase storage. New files: `src/components/ImageUpload.tsx`,
   `src/components/ImageCropper.tsx`, `src/lib/crop.ts`, `src/lib/upload.ts`.
2. **Images in chat** — members can attach an image to a direct message.
   (`MessageComposer.tsx`, `MessageBubble.tsx`.)
3. **App Store compliance features** (all web/JS, no native config):
   - In-app **account deletion** (Settings → Danger zone) via a Supabase RPC.
   - **Block user** on member profiles + a blocked-members list in Settings;
     blocked users' posts and messages are hidden.
   - **Terms of Use** (`/terms`) and **Privacy Policy** (`/privacy`) pages, plus a
     **required Terms/Privacy checkbox** on signup.
   - **Cookie consent** banner — web only; it is hidden inside the native app,
     so it will NOT appear on iOS. No action needed.

Only item **#1** touches native iOS config. Everything else ships automatically
with a fresh web build + `cap sync`.

---

## Step 0 — CONFIRM THE PREVIOUS SUBMISSION IS COMPLETE (do this first)

Before adding anything new, verify the foundation from the original handoff
(`AGA-xcode-handoff-for-codex.md`) is actually in place. If any box is
unchecked, **go finish that item in the original handoff first** — do not layer
this update on top of an incomplete build.

**iOS project & signing**
- [ ] The `ios/` project exists and is committed (like `android/`), and the app
      builds and runs (`npx cap open ios` → Run on a simulator).
- [ ] Target **App** → Signing: **Team** set to the owner's Apple Developer team,
      **Bundle Identifier = `com.aga.community`**, Display Name = `AGA`, signing
      succeeds (no red errors).
- [ ] **No** StoreKit / In-App Purchase capability is present (payments are
      web-only). No "Upgrade/Subscribe" button appears anywhere in the app.

**Info.plist carried over from last time**
- [ ] `ITSAppUsesNonExemptEncryption` = `NO` (Boolean) — stops the encryption
      question on every upload.
- [ ] `NSPhotoLibraryUsageDescription` and `NSCameraUsageDescription` present.
      (Re-confirmed in Step 2 below — if the last build somehow shipped without
      them, add them now.)

**Icons & splash**
- [ ] `Assets.xcassets` has the AppIcon set including the **1024×1024 App Store
      icon with NO alpha channel**, and the crest **fills** the tile (not small /
      over-padded). Splash background is white `#ffffff`.

**Prior build actually landed**
- [ ] The last version was **uploaded to App Store Connect** and is visible in
      **TestFlight** (or was submitted for review). If the previous build never
      reached App Store Connect, there is nothing to increment on top of — treat
      this as the first upload and set Version `1.0` / Build `1`.

**Owner/back-end prerequisites (flag if missing — not an iOS fix)**
- [ ] Supabase migrations applied: `blocked_users`, `delete_own_account`, and a
      **public `profiles` storage bucket with write policies**. Block, delete, and
      image upload will error at runtime without these.
- [ ] A **demo member login** is available for the smoke test and App Review.

> If everything above is already true, the previous submission is complete —
> proceed to Step 1. If not, resolve the unchecked items via the original handoff
> before continuing, and report any owner-dependent gaps.

---

## Step 1 — Pull latest and rebuild the web bundle

```bash
cd <path-to>/cozy-wave-page
git checkout main
git pull
npm install                      # ImageCropper uses react-easy-crop — new dep
MOBILE_BUILD=1 npm run build     # MUST have MOBILE_BUILD=1 (SPA build for the WebView)
npx cap sync ios                 # copies dist/client into the iOS app + pods
```

If `cap sync` reports a pod issue: `cd ios/App && pod install && cd ../..`.

---

## Step 2 — Info.plist usage strings (REQUIRED for image upload)

Because members can now pick photos and optionally use the camera, iOS **will
reject the build** without these purpose strings. In Xcode open
`ios/App/App/Info.plist` (or the target's Info tab) and confirm BOTH keys exist.
If they're already there from a prior attempt, leave them.

| Key | Value |
|-----|-------|
| `NSPhotoLibraryUsageDescription` | `AGA needs access to your photos so you can set your profile picture, cover image, and share images in chat.` |
| `NSCameraUsageDescription` | `AGA needs camera access if you choose to take a new photo for your profile, cover, or a chat message.` |

Raw XML if editing Info.plist as source:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>AGA needs access to your photos so you can set your profile picture, cover image, and share images in chat.</string>
<key>NSCameraUsageDescription</key>
<string>AGA needs camera access if you choose to take a new photo for your profile, cover, or a chat message.</string>
```

No new Capacitor plugins are required — uploads use a standard HTML file input,
which the WKWebView handles with the system photo/camera picker via the strings
above.

---

## Step 2.5 — App icon (use the ready emblem icon)

The Android launcher icon was fixed to use the **emblem only** (crest without the
"INCORPORATED" text banner), centered. Match iOS to it. A ready **1024×1024,
opaque (no alpha)** App Store icon is committed at **`assets/appicon-ios-1024.png`**.

- Simplest: in Xcode → `Assets.xcassets` → AppIcon, set the 1024pt "App Store"
  slot to `assets/appicon-ios-1024.png` (and let Xcode use single-size, or
  generate the smaller sizes from it).
- Or regenerate all sizes: `npx @capacitor/assets generate --ios` after copying
  `assets/appicon-ios-1024.png` over `assets/icon-only.png` — but the committed
  1024 is already the correct crop, so dropping it into the AppIcon set is enough.
- The icon must have **no alpha channel** (this file already has none). Do not add
  transparency or pre-round the corners — iOS rounds them.

## Step 3 — Bump the build number

In Xcode → target **App** → **General**:

- **Build** (`CURRENT_PROJECT_VERSION`): increment by 1 (e.g. `3` → `4`).
- **Version** (`MARKETING_VERSION`): only bump if the last one is already live on
  the App Store; otherwise a build-number bump is enough for a new TestFlight
  upload.

---

## Step 4 — Smoke test on a device/simulator before archiving

Run the app and confirm:

- [ ] **Profile avatar**: Settings/Profile → change photo → system picker opens →
      pick an image → **crop dialog** appears with the ratio hint → *Use image* →
      it uploads and the new avatar shows. (First run prompts for Photos access —
      that's the Info.plist string working.)
- [ ] **Cover banner**: same flow, wide 3:1 crop.
- [ ] **Chat image**: open a conversation → attach (image icon) → pick a photo →
      it sends and renders in the thread.
- [ ] **Account deletion**: Settings → Danger zone → Delete account → confirm →
      you're signed out and returned to the landing/auth screen.
- [ ] **Block**: open another member → Block → their posts/messages disappear;
      unblock from Settings restores them.
- [ ] **Terms gate**: sign up with a new email → the submit button stays disabled
      until the Terms/Privacy checkbox is ticked; `/terms` and `/privacy` open.
- [ ] Cookie banner does **not** appear (correct — native suppresses it).

If anything fails, report the exact error before archiving. Uploads depend on the
Supabase `profiles` storage bucket being public with write policies — that's an
owner/back-end step, not an iOS one; a "Bucket not found" or 403 on upload means
the back-end policies aren't applied yet, not an app bug.

---

## Step 5 — Archive & submit

Same as before: **Any iOS Device (arm64)** → Product → **Archive** → Distribute
App → **App Store Connect** → Upload. Then release to TestFlight / submit for
review.

### Review-notes addendum (App Store Connect)

Add to the review notes so the reviewer can find the compliance features:

> This update adds: photo upload with cropping for profile/cover and chat
> images (Photos/Camera permission strings included); in-app account deletion
> (Settings → Danger zone); block/hide other members (member profile → Block, and
> Settings → Blocked members); and Terms of Use / Privacy Policy pages with a
> required consent checkbox at signup. Payments remain web-only; no purchases are
> offered inside the app.

---

## Nothing else changed

Signing, bundle id (`com.aga.community`), push scaffold, splash, and icons are
unchanged from the last build. Do not touch them.
