import { Capacitor } from "@capacitor/core";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreditCard, FileText, RefreshCw, XCircle } from "lucide-react";
import { CustomerPortalButton } from "./CustomerPortalButton";

const ITEMS = [
  { icon: CreditCard, title: "Manage payment method", desc: "Update card, billing address, and email" },
  { icon: RefreshCw, title: "Change plan", desc: "Upgrade or downgrade your membership" },
  { icon: XCircle, title: "Cancel subscription", desc: "End billing at the next renewal" },
  { icon: FileText, title: "Download invoices", desc: "Get receipts and tax documents" },
];

export function CustomerPortalPlaceholder({ configured = false }: { configured?: boolean }) {
  // Web-only (store policy) and only meaningful once Stripe is configured.
  if (Capacitor.isNativePlatform() || !configured) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <h2 className="font-semibold">Customer portal</h2>
        <p className="text-sm text-muted-foreground">
          Update your card, change plan, download invoices, or cancel — all in Stripe's secure portal.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="grid gap-2 sm:grid-cols-2">
          {ITEMS.map((i) => (
            <li key={i.title} className="rounded-xl border p-3 flex gap-3">
              <i.icon className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{i.title}</p>
                <p className="text-xs text-muted-foreground">{i.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <CustomerPortalButton size="sm" label="Open portal" />
      </CardContent>
    </Card>
  );
}
