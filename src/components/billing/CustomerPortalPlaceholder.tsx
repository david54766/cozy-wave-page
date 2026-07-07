// Hidden until the Stripe Customer Portal is actually connected. Kept as a
// no-op (with its prop signature) so existing imports/usages don't break.
export function CustomerPortalPlaceholder({ configured = false }: { configured?: boolean }) {
  void configured;
  return null;
}
