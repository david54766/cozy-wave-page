# AGA — Firebase (push notifications) setup

Follow these in order. App identifier is **`com.aga.community`** (same for Android
and iOS). Estimated time: ~20 minutes. When done, tell Claude and it will flip
`PUSH_ENABLED = true`, wire the database webhook, and test a real push.

---

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com → **Add project**.
2. Name it (e.g. `AGA` or `Alpha Gamma Alpha`). Google Analytics is optional —
   you can disable it.
3. Create → wait for it to finish → **Continue**.

---

## 2. Add the ANDROID app  →  `google-services.json`
1. In the project, click the **Android** icon ("Add app").
2. **Android package name:** `com.aga.community`  (must match exactly)
   - App nickname: `AGA Android` (optional)
   - Debug signing SHA-1: optional (not needed for FCM push).
3. **Register app** → **Download `google-services.json`**.
4. Put that file at: **`android/app/google-services.json`** in the repo.
   (Do NOT commit it to a public fork — it's config, not a high-value secret, but
   there's no need to publish it.)
5. Skip the "add SDK / gradle" screens — Capacitor already wires that up. Click
   through **Next → Continue to console**.

---

## 3. Add the iOS app  →  `GoogleService-Info.plist` + APNs key
(Only needed for the iOS build; skip if you're Android-only for now.)
1. Click **Add app → iOS**.
2. **Apple bundle ID:** `com.aga.community` → **Register app**.
3. **Download `GoogleService-Info.plist`** → place it in **`ios/App/App/`**.
4. **APNs auth key** (lets Firebase deliver to Apple):
   - In the Apple Developer portal → Certificates, IDs & Profiles → **Keys** →
     create a key with **Apple Push Notifications service (APNs)** enabled →
     download the **`.p8`** (you can only download it once).
   - In Firebase → **Project settings → Cloud Messaging → Apple app config →
     APNs Authentication Key → Upload** the `.p8` (you'll enter the Key ID and
     your Team ID).

---

## 4. Service account key  →  `FCM_SERVICE_ACCOUNT_JSON` secret
This is what lets the AGA server send pushes (FCM HTTP v1).
1. Firebase → **⚙️ Project settings → Service accounts**.
2. Click **Generate new private key** → confirm → a **JSON file downloads**.
3. Open that JSON, copy the **entire contents**.
4. In **Lovable** (Cloud → Secrets, same place as your Stripe/Resend keys), add:
   - **`FCM_SERVICE_ACCOUNT_JSON`** = *(paste the whole JSON as the value)*
   - **`PUSH_WEBHOOK_SECRET`** = *(any long random string — make one up)*
5. Keep this JSON private. Treat it like a password.

---

## 5. Database webhook (so notifications trigger pushes)
In the **Supabase** dashboard → **Database → Webhooks → Create a new hook**:
- **Table:** `public.notifications`  ·  **Events:** **Insert**
- **Type:** HTTP Request · **Method:** POST
- **URL:** `https://joinagalink.com/api/public/push-fanout`
- **HTTP Headers:** add `x-webhook-secret` = the **same** value you used for
  `PUSH_WEBHOOK_SECRET` above.
- Save.

(This is what makes new chat messages and admin announcements fan out to devices.
Email notifications ride the same hook once `RESEND_API_KEY` is set.)

---

## 6. Turn it on + rebuild
1. Tell Claude "Firebase is set up" — it will set **`PUSH_ENABLED = true`** in
   `src/lib/push.ts` and rebuild the Android APK/AAB (and note the iOS step).
   *(The flag exists because the app crashes on login if push is enabled without
   `google-services.json` — so it must stay off until step 2 is done.)*
2. Publish in Lovable so the server-side sender + webhook route are live.

---

## 7. Test
1. Install the new build, sign in, and **turn on Push notifications** in
   Settings (it's opt-in) → accept the OS permission prompt.
2. Confirm a row appears in the Supabase `device_push_tokens` table for you.
3. From another account, send you a chat message → you get a push. Or send an
   admin announcement targeting you → you get a push.
4. Dead/expired tokens are pruned automatically.

---

## What you give Claude when done
- Confirmation that `google-services.json` is in `android/app/`.
- Confirmation the secrets `FCM_SERVICE_ACCOUNT_JSON` and `PUSH_WEBHOOK_SECRET`
  are set in Lovable.
- Confirmation the Supabase webhook is created.
Then Claude flips the flag, rebuilds, and verifies a live push.
