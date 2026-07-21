# Push notifications — what's done and what you need to finish

The **app side is scaffolded and dormant.** It will start delivering pushes once
you add a Firebase config and a server-side sender. No further client code is
needed.

## Already done (in the app)
- `@capacitor/push-notifications` installed.
- `src/lib/push.ts` — after a member signs in on the native app, it requests
  notification permission (Android 13+), registers with FCM, and saves the
  device token to the `device_push_tokens` table. It stays dormant (no crash)
  until Firebase config exists.
- `src/components/app/AppShell.tsx` calls it on login.
- `supabase/migrations/20260707000000_device_push_tokens.sql` — the token
  table + RLS. **Run this in the AGA Supabase** (same way as the other SQL).
- Tapping a push with a `url` in its data payload deep-links in the app.

## What YOU need to provide (one-time)
1. **Create a Firebase project** (free) at https://console.firebase.google.com
   → Add an **Android app** with package name `com.aga.community`.
2. Download the generated **`google-services.json`** and place it at
   `android/app/google-services.json`. (Keep it out of public forks; it's not a
   high-value secret but there's no need to publish it.)
3. Rebuild the APK/AAB. From that point the device-token registration works.

## What still needs building (server-side sender) — I can do this
A **Supabase Edge Function** that, on an event (new message, announcement,
event reminder), looks up the recipient's rows in `device_push_tokens` and calls
**FCM** (Firebase Cloud Messaging HTTP v1 API) to deliver the push. It needs a
Firebase **service-account key** stored as a Supabase secret. Tell me when the
Firebase project exists and I'll write the function + wire the triggers.

## Test checklist (once Firebase is added)
- Fresh install → sign in → Android prompts for notification permission.
- Confirm a row appears in `device_push_tokens` for your user.
- Send a test message from Firebase Console → device receives it (foreground
  and background).
