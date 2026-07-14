// Kept for import compatibility; now a thin wrapper over the real, web-only
// portal button (hidden in the native app).
import { CustomerPortalButton } from "./CustomerPortalButton";

export function CustomerPortalButtonPlaceholder() {
  return <CustomerPortalButton size="sm" />;
}
