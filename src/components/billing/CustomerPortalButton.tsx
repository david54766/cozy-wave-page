import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Opens the Stripe Customer Portal for the signed-in member. Web-only —
 * hidden in the native app (App Store / Play policy). Requires an active
 * billing account (created after a successful checkout).
 */
export function CustomerPortalButton({
  label = "Manage subscription",
  ...rest
}: Omit<ButtonProps, "onClick"> & { label?: string }) {
  const [loading, setLoading] = useState(false);

  if (Capacitor.isNativePlatform()) return null;

  const open = async () => {
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        toast.error("Please sign in again");
        return;
      }
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        toast.info("No active subscription yet", {
          description: "Start a membership first, then manage it here.",
        });
        return;
      }
      if (res.status === 503) {
        toast.info("Billing isn't activated yet.");
        return;
      }
      const out = (await res.json()) as { url?: string };
      if (out.url) window.location.href = out.url;
      else toast.error("Couldn't open the billing portal");
    } catch {
      toast.error("Couldn't open the billing portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={open} disabled={loading} {...rest}>
      <ExternalLink className="size-4 mr-1.5" />
      {loading ? "Opening…" : label}
    </Button>
  );
}
