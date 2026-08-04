# AGA — Project Notes

**Updated:** 2026-08-03 · **Status:** ready to submit to Google Play

---

## 1. What this is

**Alpha Gamma Alpha (AGA)** — a private community app: Spaces, feed, courses,
live events, member messaging, and a resource library.

| | |
|---|---|
| **Managing business** | Classroom Panda LLC (Tennessee) |
| **Public contact** | info@classroompanda.com |
| **Website** | https://joinagalink.com |
| **Repo** | https://github.com/david54766/cozy-wave-page (branch `main`) |
| **Local clone** | `C:\Users\belad\Projects\cozy-wave-page` |
| **Package / Bundle ID** | `com.aga.community` (permanent — never change) |
| **Version** | 1.0 (versionCode 1) |
| **Stack** | TanStack Start + React · Supabase · Capacitor 8 (Android + iOS) |
| **Built via** | Lovable → GitHub → local clone. Lovable two-way syncs with GitHub. |

**Important:** code pushed to GitHub appears in Lovable, but **you must click
Publish in Lovable** for the website to update. The mobile apps bundle their own
copy of the web code, so they only update when a new APK/AAB is built.

---

## 2. Current build artifacts

| File | Purpose | Path |
|---|---|---|
| **AGA-community-release.aab** | **Upload to Play** — signed | `C:\Users\belad\Desktop\aga-play-store\AGA-community-release.aab` |
| AGA-latest.apk | Sideload / testing only | same folder (and `Desktop\AGA-latest-debug.apk`) |

**Over Tailscale** (device must be on the tailnet):
- AAB → `http://100.124.140.10:8088/AGA-community-release.aab`
- APK → `http://100.124.140.10:8088/AGA-latest.apk`
- Restart the server: `node serve-apk.mjs` from `Desktop\aga-play-store`

**Signing keystore** — back this up; losing it means you can never update the app:
`C:\Users\belad\Desktop\aga-release-keystore\aga-release.jks` (alias `aga`)

---

## 3. Logins

| Role | Email | Password |
|---|---|---|
| **Demo / reviewer** (use for store review) | `appreview@agatester.dev` | `AgaReview!2026` |
| Member — Maya Chen | `maya.chen@agatester.dev` | `AgaMember!2026` |
| Member — James Rivera | `james.rivera@agatester.dev` | `AgaMember!2026` |
| Member — Aisha Patel | `aisha.patel@agatester.dev` | `AgaMember!2026` |
| Member — Diego Santos | `diego.santos@agatester.dev` | `AgaMember!2026` |
| **Admin** (only account with `platform_admin`) | `info@easyfill.ai` | `099332816Ds85##` |

Members see **no admin UI** — verified. Only the admin account does.

---

## 4. Store submission

Everything lives in **`C:\Users\belad\Desktop\aga-play-store\`**.
Start with **`PLAY-STORE-SUBMISSION-PACKET.md`** — every Console question answered.

**Assets (all regenerated, verified to spec):**
- `play-icon-512.png` — 512×512, no alpha
- `feature-graphic-1024x500.png` — 1024×500, no alpha
- `screenshots/01…07` — 1080×2340, 7 shots

**Release name:** `1.0 (1) — Initial release`
**Release notes:** in the packet (§4) — 354/500 chars.

**Play readiness — all verified:**
- AAB signed ✅ · targetSdk 36 ✅ · permissions clean (no location/camera/contacts) ✅
- `/privacy`, `/terms`, `/account-deletion` all return 200 ✅
- Demo login works ✅ · no purchase UI on native ✅

**iOS:** `Desktop\AGA-xcode-prompt-for-codex.md` (paste into Codex on the Mac) and
`Desktop\AGA-app-store-submission-packet.md` (listing + App Privacy answers).

---

## 5. Business model — currently fully open

Plans exist ($10.99/mo, $120/yr) and both grant `platform` access, **but no
content is marked paid** — every Space, course, event, and resource is `free`.
So a free account currently sees everything.

That's intentional for launch and reviews cleanly. To monetize later, an admin
sets **Access level → paid** on specific content in the admin panel. It's a data
change — no rebuild, no resubmission.

**Payments are web-only.** Purchase UI is hidden on native via
`Capacitor.isNativePlatform()`. **Never** add an upgrade button or a link to
pricing inside the mobile app — both stores reject that as steering.

---

## 6. Integrations

| Service | Status |
|---|---|
| **Supabase** | ✅ live (auth, database, storage bucket `profiles`) |
| **Stripe** | ✅ configured — web checkout only |
| **Firebase / FCM** | ⚠️ partly — `google-services.json` in place, push **receiving** works. Sending needs the `FCM_SERVICE_ACCOUNT_JSON` secret + the notifications webhook. |
| **Resend (email)** | ❌ not reaching the server — `/api/send-invite` returns 503. Check the secret name in Lovable. |
| **AI assistant** | ❌ **not connected** — `ai_settings` is empty, so AI runs in mock mode. Members see "AI Helper not available." |

---

## 7. Demo content in the production database

The app is seeded so reviewers see a working community: 9 accounts, 2 Spaces
(with cover images), 5 posts, 1 course + 2 lessons, 3 upcoming events, 2
resources, chat threads. Visible `[[AGA-SEED]]` labels were removed so it reads
as production.

**To remove it later:** run `AGA-test-data-teardown.sql` (Desktop) in the
Supabase SQL editor. It deletes by row **ID**, so removing the labels didn't
break cleanup. Full inventory in `AGA-test-data-seed-LOG.md`.

Lesson videos were intentionally cleared — add real ones via
**Admin → Courses → lesson → Video URL** (accepts YouTube, Vimeo, or a direct
file; the player and thumbnail handle both).

---

## 8. Notable fixes made (context for future work)

Several were caused by the same root cause — worth knowing:

- **`profiles.email` is not readable by the `authenticated` role.** Any query
  that selects *or filters on* it returns 403 for the **whole** request. This
  silently broke the member directory, chat member list, global search, and the
  admin dashboard counts (which showed 0 members). Never `select("*")` on
  `profiles` from the client.
- **Layout routes must render `<Outlet/>`.** `admin.tsx` and `events.tsx` both
  rendered a page directly while acting as the parent for `/admin/*` and
  `/events/*`, so child routes never displayed — tapping an event did nothing.
- **`INSERT ... RETURNING` and RLS:** creating a chat used `.insert().select()`,
  and the SELECT policy calls a STABLE function that can't see the new row
  mid-statement → "violates row-level security". Fixed by generating the id
  client-side and dropping `.select()`.
- **`@capacitor/assets` overwrites icon fixes.** Running it restores the 16.7%
  double-inset and regenerates icons from the full logo. Re-apply the emblem
  icons afterward.
- **Splash artwork must be dead-center** on its square canvas — it's
  center-cropped to the screen, so off-center art gets chopped.

---

## 9. Open items

**Blocking nothing — submit whenever ready.**

1. **Publish in Lovable** so the website matches the latest code (the AAB already has it).
2. **Verify `info@classroompanda.com` receives mail** — it's public on the listing.
3. **Play Console developer name must read "Classroom Panda LLC"** to match the in-app Terms.
4. Optional: fix the Resend secret (email), finish FCM sending, connect a real AI provider,
   hide the AI Helper nav item until then.
