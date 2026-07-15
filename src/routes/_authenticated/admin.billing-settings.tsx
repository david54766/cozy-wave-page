import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { getPublicSiteUrl } from "@/lib/site-url";
import { fetchBillingSettings, updateBillingSettings, createBillingSettings, type BillingSettings } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/admin/billing-settings")({ component: BillingSettingsPage });

function BillingSettingsPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [s, setS] = useState<BillingSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !isAdmin) navigate({ to: "/dashboard" }); }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      let row = await fetchBillingSettings();
      if (!row) row = await createBillingSettings({ currency: "USD", tax_behavior: "exclusive" });
      setS(row);
    })();
  }, [isAdmin]);

  if (!isAdmin || !s) return null;

  const configured = !!s.stripe_publishable_key;
  const webhookUrl = `${getPublicSiteUrl()}/api/public/stripe-webhook`;

  const save = async () => {
    setSaving(true);
    try {
      // Only the publishable key + display defaults live in the DB. Real secrets
      // (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) are env-only and never stored here.
      await updateBillingSettings(s.id, {
        stripe_publishable_key: s.stripe_publishable_key,
        currency: s.currency,
        tax_behavior: s.tax_behavior,
        billing_support_email: s.billing_support_email,
      });
      toast.success("Billing settings saved");
    } catch (err: any) { toast.error(err?.message ?? "Save failed"); }
    finally { setSaving(false); }
  };

  const copyWebhook = async () => {
    try { await navigator.clipboard.writeText(webhookUrl); toast.success("Webhook URL copied"); }
    catch { toast.info(webhookUrl); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Billing settings</h1>
        <p className="text-muted-foreground mt-1">Connect Stripe to accept web payments. Purchases happen on the website; the mobile apps reflect access.</p>
      </header>

      {/* Setup checklist / status */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          <h2 className="font-semibold">Setup status</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <StatusRow done={configured} label="Publishable key set" hint="Set below — this switches on the Upgrade buttons." />
          <StatusRow done={undefined} label="STRIPE_SECRET_KEY in backend secrets" hint="Add in Lovable Cloud secrets (use a restricted key). Not stored here." />
          <StatusRow done={undefined} label="STRIPE_WEBHOOK_SECRET in backend secrets" hint="From your Stripe webhook endpoint. Not stored here." />
          <div className="rounded-xl border bg-muted/40 p-3 space-y-1.5">
            <p className="font-medium">Webhook endpoint</p>
            <p className="text-muted-foreground text-xs">Add this URL in Stripe → Developers → Webhooks, subscribed to <code className="text-foreground">checkout.session.completed</code>, <code className="text-foreground">customer.subscription.updated</code>, <code className="text-foreground">customer.subscription.deleted</code>.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-background border px-2 py-1 text-xs">{webhookUrl}</code>
              <Button size="sm" variant="outline" onClick={copyWebhook}>Copy</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><h2 className="font-semibold">Publishable key</h2></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Stripe publishable key</Label>
            <Input placeholder="pk_test_... / pk_live_..." value={s.stripe_publishable_key ?? ""} onChange={(e) => setS({ ...s, stripe_publishable_key: e.target.value })} />
            <p className="text-xs text-muted-foreground">Public by design (safe to expose). Setting it turns on checkout in the web app.</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Do not paste your secret key or webhook secret anywhere in this app — those belong only in backend secrets (env).
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><h2 className="font-semibold">Defaults</h2></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Default currency</Label>
            <Input value={s.currency} maxLength={3} onChange={(e) => setS({ ...s, currency: e.target.value.toUpperCase() })} />
          </div>
          <div className="space-y-1.5">
            <Label>Tax behavior</Label>
            <Select value={s.tax_behavior} onValueChange={(v) => setS({ ...s, tax_behavior: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="exclusive">Exclusive (added at checkout)</SelectItem>
                <SelectItem value="inclusive">Inclusive (included in price)</SelectItem>
                <SelectItem value="unspecified">Unspecified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Billing support email</Label>
            <Input type="email" value={s.billing_support_email ?? ""} onChange={(e) => setS({ ...s, billing_support_email: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
      </div>
    </div>
  );
}

function StatusRow({ done, label, hint }: { done: boolean | undefined; label: string; hint: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {done ? (
        <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
      ) : (
        <Circle className={`size-4 shrink-0 mt-0.5 ${done === false ? "text-muted-foreground" : "text-muted-foreground/60"}`} />
      )}
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
