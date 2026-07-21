# AGA — App Store Connect submission: pre-filled answers

Everything App Store Connect / App Review will ask, answered for AGA. Replace
`<< >>` placeholders (only you can supply those). **Read §0 first — there are two
Apple requirements the app doesn't meet yet that will cause rejection.**

---

## 0. Compliance status

1. **In-app account deletion (Guideline 5.1.1(v)) — ✅ BUILT.**
   Settings → Danger zone → "Delete account" (confirm dialog) permanently
   deletes the account + data via `/api/delete-account`. *Needs: publish in
   Lovable.*
2. **Block abusive users (Guideline 1.2, UGC apps) — ✅ BUILT.**
   Block/Unblock on a member's profile; blocked members' feed posts and chat
   messages are hidden; managed in Settings → Blocked members. *Needs: run the
   `blocked_users` migration in Supabase (`supabase/migrations/20260715000000_blocked_users.sql`),
   then publish.*
3. **Report content — ✅ already existed** (chat + feed report actions).

Still needed (not code):
4. **Terms of Use (EULA)** URL — draft at `aga-play-store/terms-of-use.md`
   (includes the Guideline 1.2 zero-tolerance clause). Host it and link it.
5. **Privacy Policy** URL — draft at `aga-play-store/privacy-policy.md`; host it.

Everything else below is ready to answer.

---

## 1. App Information
- **Name:** `Alpha Gamma Alpha` (≤30 chars; or `AGA` if you prefer)
- **Subtitle (≤30):** `Community, courses & events`
- **Bundle ID:** `com.aga.community`
- **Primary language:** English (U.S.)
- **Primary category:** Social Networking
- **Secondary category:** Education (or Lifestyle)
- **Content rights:** "This app does not contain, show, or access third-party
  content" — Yes (it's your community's own content).

## 2. Pricing and Availability
- **Price:** **Free** (Tier 0). The app has **no in-app purchases** — memberships
  are sold on the website. Do not add IAP.
- **Availability:** All countries and regions (or restrict as you wish).

## 3. Version details (per-version page)
- **Promotional text (≤170):** `Your private AGA community — spaces, courses, live events, member chat, and resources, all in one place.`
- **Description (≤4000):**
  ```
  Alpha Gamma Alpha brings the whole community into one app — spaces, courses,
  live events, member conversations, and resources — so members can learn,
  connect, and grow together.

  • Community Spaces — focused rooms for every topic and cohort
  • Community Feed — share updates, ask questions, join the conversation
  • Courses — self-paced lessons with progress tracking and certificates
  • Live Events — RSVP to workshops, meetups, and gatherings
  • Messaging — connect with members in real time
  • Member Profiles & Directory — build your profile, discover members
  • Resource Library — guides, templates, and downloads in one place
  • Notifications — stay up to date on replies, events, and announcements

  Alpha Gamma Alpha is a private, members-only community. Sign in to access the
  spaces, courses, and events shared with members.
  ```
- **Keywords (≤100, comma-separated):** `community,sorority,membership,courses,events,networking,groups,learning`
- **Support URL:** `<< https://joinagalink.com/support or a support page >>` (required)
- **Marketing URL:** `https://joinagalink.com` (optional)
- **Copyright:** `2026 << legal entity, e.g. Alpha Gamma Alpha Incorporated >>`
- **Version:** `1.0` · **Build:** `1` (match Android's 1.0)

## 4. App Privacy ("nutrition label")
Answer "Yes, we collect data." **Data is NOT used for tracking** (no third-party
ad SDKs). All of the below is **linked to the user's identity** and used for
**App Functionality** (and Analytics where noted):

| Category | Data type | Purpose | Linked | Tracking |
|---|---|---|---|---|
| Contact Info | Name, Email address | App Functionality | Yes | No |
| User Content | Photos/Videos (avatar/cover URLs), Other User Content (posts, comments, messages) | App Functionality | Yes | No |
| Identifiers | User ID | App Functionality | Yes | No |
| Usage Data | Product Interaction | Analytics, App Functionality | Yes | No |
| Diagnostics | Crash Data | App Functionality | Yes | No |

- **Do you use data to track users?** No.
- **Third-party payment/ads?** No ads. Payments are on the website (Stripe), not in-app.

## 5. Age Rating questionnaire
Answer **None** to violence, sexual content, nudity, profanity, alcohol/tobacco/
drugs, horror, mature/suggestive themes, gambling, contests, medical info.
- **Unrestricted web access?** **No** (no built-in browser; external links open in Safari).
- **User-generated content?** **Yes** — the app has posts, comments, and
  messaging. (This is why block + report + moderation are required — see §0.)
- Expected resulting rating: **12+**.
- **Made for Kids?** No.

## 6. App Review Information (the notes reviewers read)
- **Sign-in required?** **Yes** — provide a demo account:
  - Email: `<< a dedicated reviewer member account you create >>`
  - Password: `<< that account's password >>`
  - (Don't use the admin `info@easyfill.ai`. Make a normal member account so
    reviewers see the standard experience.)
- **Contact:** `<< first/last name >>`, `<< phone >>`, `<< email >>`
- **Notes for Review (paste this):**
  ```
  Alpha Gamma Alpha is a companion app for our private members' community. Sign
  in with the demo account above to access spaces, the feed, courses, events,
  messaging, and member profiles.

  Memberships are purchased and managed only on our website (joinagalink.com);
  the app contains no purchases and no purchase links — it reflects the access a
  member already has.

  User-generated content is moderated: members can report posts and messages
  (report action in the post/message menu) and block other members (Profile →
  block); admins remove content via a moderation dashboard.
  ```

## 7. Export Compliance
- **Does your app use encryption?** Yes, but only standard HTTPS/TLS → **exempt**.
- Set in `ios/App/App/Info.plist`: `ITSAppUsesNonExemptEncryption` = `NO`
  (this stops Apple asking on every upload). Answer the Console prompt: your app
  does **not** use non-exempt encryption.

## 8. Sign in with Apple
- **Not required.** AGA uses email/password only (no Google/Apple/Facebook
  social login), so Apple's "must offer Sign in with Apple" rule doesn't apply.

## 9. Screenshots (required)
- **6.7" iPhone** (1290 × 2796) — **required**, at least 1 (up to 10).
- 6.5" (1242 × 2688) and 5.5" (1242 × 2208) — optional but nice.
- Capture on the iOS Simulator (Pro Max device) once the app runs. Reuse the
  same screens as the Play listing: sign-in, dashboard, feed, profile, a space.
- No pricing/purchase screenshots (there's no purchase in-app).

## 10. Legal
- **Privacy Policy URL:** required (host `aga-play-store/privacy-policy.md`).
- **License Agreement (EULA):** use Apple's standard EULA unless you host your own.

---

## What I can do now (just say which)
- Build **in-app account deletion** (Settings → Delete account + a Supabase
  function to remove the user). Required — §0.1.
- Build **block user** (block from profile/message; blocked users hidden).
  Required — §0.2.
- Draft a **Terms of Use / EULA** and a support page.
- Capture the **iOS screenshots** once you have the app running in the Simulator.
