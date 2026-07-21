# Stripe web payments — setup & test

Web-based subscriptions are now implemented. Payments happen on the **website**;
the native apps hide all purchase UI (App Store / Play policy), so those
submissions stay clean.

## How it works
- `POST /api/checkout` (server) creates a Stripe Checkout Session from a plan
  and returns its hosted URL. Subscriptions for monthly/annual plans, one-time
  payment otherwise. It reads `STRIPE_SECRET_KEY` from env (never in code).
- The pricing/plan "Upgrade" button calls it and redirects to Stripe Checkout.
- `POST /api/public/stripe-webhook` verifies the Stripe signature, then on
  `checkout.session.completed` activates a **subscription** row (or records a
  one-time **purchase**); `customer.subscription.updated/deleted` syncs status.
  Access is computed from active subscriptions, so activation unlocks content.
- In the native app, `CheckoutButton` and the upsell card render nothing.

## What YOU do (I never handle the secret keys)

### 1. Add secrets in Lovable Cloud
In your Lovable project → **backend/secrets** (or the linked Supabase project's
env), add:
- `STRIPE_SECRET_KEY` — from Stripe → Developers → API keys. **Use the TEST key
  (`sk_test_...`) first.**
- `STRIPE_WEBHOOK_SECRET` — created in step 3 below (`whsec_...`).
- Confirm `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` are present (used by the
  webhook/checkout to write billing rows) — they already power other server code.

> These are **server-side** secrets. Never put them in `.env` with a `VITE_`
> prefix or anywhere client-side.

### 2. Turn on the "configured" flag
The app shows the Upgrade button only when Stripe is "configured", which is
driven by the **publishable key** in billing settings. In **Admin → Billing
Settings**, set the Stripe **publishable key** (`pk_test_...`). (Plans also need
a non-zero price and a monthly/annual interval.)

### 3. Create the webhook endpoint in Stripe
Stripe → Developers → **Webhooks** → Add endpoint:
- URL: `https://joinagalink.com/api/public/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted` (add `invoice.paid` if you want invoice logs).
- Copy the **Signing secret** (`whsec_...`) → that's `STRIPE_WEBHOOK_SECRET`
  from step 1.

### 4. Publish
Publish the web app in Lovable so the new `/api/checkout` route and webhook
processing are live.

## Test (in Stripe TEST mode first)
1. On joinagalink.com, sign in, go to Pricing/Plans, click Upgrade on a paid plan.
2. You should land on Stripe Checkout. Pay with test card `4242 4242 4242 4242`,
   any future expiry, any CVC/ZIP.
3. After redirect to `/checkout/success`, confirm in Supabase that a
   `subscriptions` row exists for your user with status `active`, and that the
   paid content is now unlocked.
4. Check Stripe → Webhooks → your endpoint shows `200` for the events, and
   `payment_webhook_events` has rows with `processed = true`.
5. In Stripe, cancel the test subscription → confirm the row flips to
   `canceled` and access is removed.

## Go live
Once test mode works: swap the secrets to **live** keys (`sk_live_...`,
`pk_live_...`), create a **live** webhook endpoint (new `whsec_...`), update the
secrets, and publish. Do a single real transaction to confirm.

## Customer portal (now included)
Members can self-serve (update card, change plan, download invoices, cancel) via
Stripe's hosted portal. To turn it on:
1. In Stripe → **Settings → Billing → Customer portal**, click **Activate** and
   choose what members may do (cancel, switch plans, update payment method).
2. That's it — the "Manage subscription" / "Open portal" buttons on the Billing
   page call `POST /api/billing-portal`, which creates a portal session for the
   member's Stripe customer. (Web-only; hidden in the native app. Only appears
   once the member has an active billing account.)

## API key restrictions — IMPORTANT
**Do not use your full secret key (`sk_...`).** Create a **Restricted key** and
give it only the access this integration needs. Stripe → Developers → API keys →
**Create restricted key**:

Grant **Write**:
- **Checkout Sessions** — create checkout (`/api/checkout`)
- **Billing Portal** (Customer portal) — open the portal (`/api/billing-portal`)

Grant **Read** (nice to have, not strictly required):
- **Customers**, **Subscriptions**, **Prices/Products** — for future features/debugging

Set **everything else to None**. Notes:
- Use that restricted key value as `STRIPE_SECRET_KEY`. Keep a **separate test
  and live** restricted key.
- If a restricted key ever leaks, roll just that key — your account's main secret
  key is untouched.
- The **publishable key** (`pk_...`) is safe to expose and goes in Admin →
  Billing Settings; it can't be meaningfully restricted (it's public by design).
- The **webhook signing secret** (`whsec_...`) is NOT an API key — it's only used
  to verify signatures. Keep it in `STRIPE_WEBHOOK_SECRET`, server-side only.
- Never put any of these in a `VITE_`-prefixed var or anywhere client-side.
- Optional hardening: in Stripe, restrict the key's **allowed IPs** if your
  Lovable/Cloudflare egress IPs are known (usually not, so skip).

## Not included yet (say the word)
- One-time bundle purchases beyond simple plan payments.
- Coupons are recorded but not yet applied as Stripe discounts at checkout.
