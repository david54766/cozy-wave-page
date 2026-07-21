import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "aga-cookie-consent";

/**
 * Cookie/consent banner shown once on the web until accepted. Hidden in the
 * native app (cookie banners are a web/GDPR concern, not an app-store one).
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage unavailable — don't block the app */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-muted-foreground flex-1">
          We use essential cookies to keep you signed in and basic analytics to improve the app.
          See our{" "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">Accept</Button>
      </div>
    </div>
  );
}
