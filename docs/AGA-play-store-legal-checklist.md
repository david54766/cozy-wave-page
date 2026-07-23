# AGA — Google Play legal & disclosure checklist

Everything Google Play requires in the way of legal pages, disclosures, and
Console fields, and where each one lives. Public URLs assume the production
domain **https://joinagalink.com**. Operating entity / developer of record:
**Classroom Panda LLC** (contact `info@easyfill.ai`).

## Public legal pages (all live in the app + web, no login required)

| Page | URL | Purpose |
|------|-----|---------|
| Terms of Use (EULA) | `https://joinagalink.com/terms` | Terms/EULA, incl. UGC zero-tolerance clause, auto-renew + cancellation, governing law, liability disclaimer |
| Privacy Policy | `https://joinagalink.com/privacy` | What's collected, how used, sharing, retention, children, choices |
| Account & Data Deletion | `https://joinagalink.com/account-deletion` | In-app steps **and** an email request path for users without the app; what's deleted vs. retained |

All three are reachable without installing the app, and in-app from
**Settings → About & legal**, plus the website footer.

## Play Console fields to fill (Console-side, not code)

1. **Store listing → Privacy Policy:** `https://joinagalink.com/privacy` (required).
2. **App content → Data safety form.** Must match the Privacy Policy. Declare:
   - **Data collected:** Name, Email address, User IDs; App activity (posts,
     messages, RSVPs); Photos (profile/cover/chat images the user uploads);
     App info & performance (basic diagnostics).
   - **Purpose:** App functionality, Account management. **No** advertising/marketing.
   - **Shared with third parties:** Processors only — Supabase (backend/hosting),
     Stripe (payments). Not "sold." No data shared for ads.
   - **Encrypted in transit:** Yes (HTTPS). **User can request deletion:** Yes →
     provide the deletion URL below.
   - **Data deletion URL:** `https://joinagalink.com/account-deletion` (this is the
     field that specifically needs the public deletion page).
3. **App content → App access:** provide a **demo login** (email + password) so
   review can reach the gated content.
4. **App content → Ads:** **No ads.** (The app shows no ads and uses no ad SDKs.)
5. **App content → Content rating (IARC questionnaire):** social features with
   user communication and user-generated content; no violence/gambling/mature
   content → expect Teen (or your region's equivalent). Answer honestly:
   - Users interact / share content: **Yes**
   - Shares location: **No** (location is a free-text profile field, not GPS)
   - Digital purchases: **No in-app purchases** (memberships are sold on the web).
6. **App content → Target audience & content:** target **13+** (matches Terms;
   not designed for children). Do not opt into the "Designed for Families" program.
7. **Financial features / UGC declarations:** it is a social/UGC app — confirm the
   moderation controls: report content, block users, published contact email, and
   the zero-tolerance clause in the Terms (Guideline parity with Apple 1.2).

## Payments note (important for Play policy)

Memberships are **not** sold through the Android app — purchase UI is hidden on
native (`Capacitor.isNativePlatform()`), and buying happens on the website via
Stripe. The app only reflects access. This keeps the app out of Google Play
Billing scope. **Do not** add a "Subscribe/Upgrade" button or a link that sends
users to the website to pay from inside the Android app — Google (like Apple)
can reject for steering. If you ever want to sell inside the Android app, that
must go through Google Play Billing.

## What's already in place (code)

- In-app account deletion: Settings → Danger zone → Delete account (Supabase
  `delete_own_account` RPC — immediate, permanent).
- Report + Block for UGC safety; blocked users' content hidden.
- Terms consent checkbox required at signup; cookie/essential-storage notice on web.
- Contact address published in all three legal pages: `info@easyfill.ai`.

## Owner to-do before submit

1. **Publish in Lovable** so `/terms`, `/privacy`, and `/account-deletion` are live.
2. Confirm each URL resolves publicly (open in a private browser window).
3. Fill the Console fields above, pasting the three URLs.
4. Run the Supabase steps (`blocked_users`, `delete_own_account`, `profiles`
   bucket) if not already applied — otherwise delete/block/upload error at runtime.
