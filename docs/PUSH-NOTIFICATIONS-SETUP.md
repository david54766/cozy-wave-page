# Push notifications — setup & activation

The **sender is now built.** Push fires automatically whenever an in-app
notification is created, so the two you asked for are already covered:

- **New chat message** → `new_message` notification (DB trigger `tg_notify_on_message`)
- **Admin message / announcement** → `admin_announcement` notification (`send_announcement` RPC)

Both write a row to `public.notifications`; a webhook on that table sends the
push. To add more push types later, edit `PUSH_TYPES` in
`src/routes/api/public/push-fanout.ts`.

## What's already in the code
- **Receiving:** `@capacitor/push-notifications`, `src/lib/push.ts` (registers the
  device token into `device_push_tokens` after login), called by `AppShell`.
  Gated behind `PUSH_ENABLED` (see step 4) so it can't crash before Firebase exists.
- **Sending:** `src/lib/server/fcm.ts` (FCM HTTP v1 sender, service-account OAuth,
  dead-token pruning) + `src/routes/api/public/push-fanout.ts` (webhook receiver).
- **Triggers already create the notifications** — no new DB code needed.

## Activation — one-time owner steps

### 1. Firebase project + Android/iOS apps
- Create a project at https://console.firebase.google.com.
- Add an **Android app**, package `com.aga.community` → download
  **`google-services.json`** → place at `android/app/google-services.json`.
- For iOS: add an **iOS app** (bundle `com.aga.community`), download
  **`GoogleService-Info.plist`** into `ios/App/App/`, and upload your **APNs Auth
  Key (.p8)** in Firebase → Cloud Messaging.

### 2. Secrets (Lovable Cloud / Supabase project secrets)
- **`FCM_SERVICE_ACCOUNT_JSON`** — Firebase Console → Project settings → Service
  accounts → **Generate new private key**. Paste the **entire JSON** as the value.
- **`PUSH_WEBHOOK_SECRET`** — any long random string; used to authenticate the DB
  webhook to the fan-out route.

### 3. Database webhook (Supabase → Database → Webhooks)
- **Create a webhook** on table `public.notifications`, event **Insert**.
- **URL:** `https://joinagalink.com/api/public/push-fanout`
- **HTTP headers:** add `x-webhook-secret` = the same value as `PUSH_WEBHOOK_SECRET`.
- Method POST, default payload. That's it — inserts now trigger a push.

### 4. Turn on device registration + rebuild
- In `src/lib/push.ts`, set **`PUSH_ENABLED = true`** (it's `false` today so the
  app doesn't crash without Firebase).
- Rebuild the Android APK/AAB (and iOS build) so `google-services.json` /
  `GoogleService-Info.plist` are bundled.

## Test checklist
1. Fresh install → sign in on the native app → accept the notification prompt →
   confirm a row appears in `device_push_tokens` for your user.
2. From another account, **send that user a chat message** → the device gets a
   "New message…" push (foreground and background).
3. In Admin → Announcements, **create + send** an announcement targeting that
   user → the device gets the announcement push.
4. Bad/expired tokens are pruned automatically (the route deletes tokens FCM
   reports as unregistered).

## Email notifications (same fan-out)

The notification fan-out route also sends **email** for the same `new_message` /
`admin_announcement` events, to members who have **Email notifications** on. It
uses Resend.

1. Create a Resend account, verify the **joinagalink.com** domain.
2. Set secrets: **`RESEND_API_KEY`**, and optionally **`EMAIL_FROM`**
   (default `Alpha Gamma Alpha <noreply@joinagalink.com>`).
3. That's it — the same `notifications` webhook now emails opted-in members, and
   the **Resend invite** button (Admin → Invitations) sends a real invite email
   (falls back to copying the invite link if `RESEND_API_KEY` isn't set).

## Notes
- Push currently goes to **every registered device** for the recipient (having a
  token means the user granted OS notification permission). A user-facing on/off
  switch can be added later by wiring the Settings "Push notifications" toggle to
  delete/register tokens.
- The sender is a normal server API route (like the Stripe webhook), so it
  deploys with the web app via Lovable — no separate Edge Function to deploy.
