import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

// Native push-notification registration.
//
// Dormant until a Firebase config (android/app/google-services.json) exists:
// without it PushNotifications.register() throws, which we swallow so the app
// keeps working. Once google-services.json is added and a server-side sender
// is wired to the device_push_tokens table (see supabase migration
// 20260707_device_push_tokens.sql), this starts delivering pushes with no
// further client changes.

let started = false;

// Push stays OFF until Firebase is configured (android/app/google-services.json
// + iOS APNs). Without it, the native PushNotifications.register() call throws a
// "Default FirebaseApp is not initialized" exception on the native side — which a
// JS try/catch CANNOT catch — and the app hard-crashes right after login (that is
// exactly when AppShell calls this). Keep this false until google-services.json
// exists, then flip to true and rebuild. See PUSH-NOTIFICATIONS-SETUP.md.
const PUSH_ENABLED = false;

export async function registerForPush(userId: string): Promise<void> {
  if (!PUSH_ENABLED || !Capacitor.isNativePlatform() || started) return;
  started = true;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") {
      started = false; // let a later login retry after the user enables it
      return;
    }

    await PushNotifications.addListener("registration", async (token) => {
      const db = supabase as unknown as {
        from: (t: string) => {
          upsert: (v: unknown, o: unknown) => Promise<{ error: unknown }>;
        };
      };
      await db
        .from("device_push_tokens")
        .upsert(
          { user_id: userId, token: token.value, platform: Capacitor.getPlatform() },
          { onConflict: "token" },
        );
    });

    await PushNotifications.addListener("registrationError", (err) => {
      console.warn("[push] registration error", err);
    });

    // Tapping a push can carry a `url` in its data payload to deep-link in-app.
    await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const data = action.notification.data as Record<string, string> | undefined;
      if (data?.url) window.location.assign(data.url);
    });

    await PushNotifications.register();
  } catch (e) {
    // No FCM config yet (or plugin unavailable) — stay dormant, don't crash.
    console.warn("[push] not available:", e);
    started = false;
  }
}
