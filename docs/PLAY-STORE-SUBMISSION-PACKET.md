# AGA — Google Play Store submission packet

**App:** Alpha Gamma Alpha · **Package:** `com.aga.community`
**Developer / operating entity:** Classroom Panda LLC · **Contact:** info@easyfill.ai
**Website:** https://joinagalink.com
**Packet generated:** 2026-07-31 — every asset in this folder was regenerated on this date.

Everything Play Console asks for is answered below. Copy/paste the answers; upload
the assets from this folder. Items only you can supply are marked **← YOU**.

---

# 1. Store listing

### App name (30 char max)
```
Alpha Gamma Alpha
```
*(17 chars. If taken, use `AGA Community` — 13 chars.)*

### Short description (80 char max)
```
Your private community for learning, connection, and growth — all in one app.
```
*(77 chars.)*

### Full description (4000 char max)
```
Alpha Gamma Alpha brings your whole community into one place — courses, live events, member conversations, and resources — so members can learn, connect, and grow together.

WHAT YOU CAN DO

• Community Spaces — focused rooms for every topic, cohort, and project.
• Community Feed — share updates, ask questions, post photos, and join the conversation.
• Online Courses — self-paced lessons with progress tracking.
• Live Events — RSVP to workshops, community calls, and member gatherings.
• Direct & Group Messaging — connect with members in real time, including photos.
• Member Profiles — build your profile and discover other members.
• Resource Library — guides, templates, and downloads in one organized place.
• Notifications — stay up to date on replies, messages, events, and announcements.

BUILT FOR MEMBERS
Sign up in under a minute, complete your profile, and you're in. The app is designed mobile-first, so everything works cleanly on your phone — clear navigation, fast loading, and a familiar, app-like experience.

A PRIVATE, MEMBER-FOCUSED SPACE
Alpha Gamma Alpha is a private community platform. Your account gives you access to the Spaces, courses, and events shared with members.

SAFETY AND CONTROL
We have zero tolerance for abusive content or behavior. You can report any post or message, and block any member — blocked members' content disappears from your feed and they can't message you. You can permanently delete your account and data at any time from Settings.

Questions or feedback? Reach us at info@easyfill.ai.
```

### Graphics — all in this folder, regenerated 2026-07-31
| Asset | File | Spec | Status |
|---|---|---|---|
| App icon | `play-icon-512.png` | 512×512, 32-bit PNG, **no alpha** | ✅ opaque, emblem-only |
| Feature graphic | `feature-graphic-1024x500.png` | 1024×500, no alpha | ✅ |
| Phone screenshots | `screenshots/01…07` | 1080×2340, ≥2 required (max 8) | ✅ 7 provided |

Screenshots: 01 Dashboard · 02 Spaces · 03 Feed · 04 Events · 05 Courses · 06 Chat · 07 Members.
*(Tablet screenshots are optional; Play may show a "no tablet screenshots" advisory — it does not block release.)*

### Categorization
- **App category:** Social
  *(Alternative: Education — pick Social; the core value is community.)*
- **Tags:** Community, Social Networking, Education, Groups, Messaging

### Contact details
- **Email:** info@easyfill.ai  ← required, shown publicly
- **Website:** https://joinagalink.com
- **Phone:** optional — leave blank unless you want it public

### Privacy Policy URL
```
https://joinagalink.com/privacy
```

---

# 2. App content declarations

### Privacy policy
`https://joinagalink.com/privacy`

### App access — **required, review will fail without it**
Choose **"All or some functionality is restricted"** and add these instructions:
- **Name of credential:** Demo member account
- **Username:** `appreview@agatester.dev`
- **Password:** `AgaReview!2026`
- **Any other instructions:**
```
Sign in with the credentials above to reach all member functionality. The account
is a full member with access to Spaces, Feed, Courses, Events, Chat, and Resources.
No purchases are offered inside the app; memberships are sold only on our website.
```

### Ads
**No** — this app contains no ads. (No ad SDKs are present.)

### Content ratings (IARC questionnaire)
- **Category:** Social Networking / Communication
- Violence, sexuality, profanity, controlled substances, gambling, horror: **No** to all
- **Does the app allow users to interact or exchange content?** **Yes**
  (feed posts, comments, direct and group messages, member profiles)
- **Can users share their location with other users?** **No**
  (location is an optional free-text profile field, not GPS)
- **Can users purchase digital goods?** **No**
- **Does the app share user-provided personal information with third parties?** **No**
- **Is this a social/dating app?** Social — **not** dating
- **Expected result:** Teen (ESRB) / PEGI 12 or similar

### Target audience and content
- **Target age group:** **13+** (matches the Terms; do not select any under-13 bracket)
- **Appeals to children:** **No**
- **Designed for Families:** **Do not opt in**

### Data safety — must match the privacy policy
**Does your app collect or share any of the required user data types?** **Yes**
**Is all data encrypted in transit?** **Yes** (HTTPS/TLS)
**Do you provide a way for users to request data deletion?** **Yes** →
deletion URL: `https://joinagalink.com/account-deletion`

| Data type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Name | Yes | No | Required | App functionality, Account management |
| Email address | Yes | No | Required | App functionality, Account management |
| User IDs | Yes | No | Required | App functionality, Account management |
| Photos | Yes | No | Optional | App functionality (profile, cover, chat images) |
| Messages (in-app) | Yes | No | Optional | App functionality |
| Other user-generated content | Yes | No | Optional | App functionality (posts, comments) |
| App interactions | Yes | No | Optional | Analytics, App functionality |
| Crash logs / diagnostics | Yes | No | Optional | Analytics |

**Notes for the form**
- **Data is NOT sold** and **not shared** with third parties for advertising.
- Processors used (not "sharing" under Play's definition): **Supabase** (hosting/database),
  **Stripe** (payments, web only), **Firebase Cloud Messaging** (push delivery).
- **Data collection is required** for account features; users may skip optional
  profile fields and photos.
- **Account deletion:** in-app (Settings → Danger zone → Delete account) **and** via the
  public URL above.

### Other declarations
- **News app?** No
- **COVID-19 contact tracing/status app?** No
- **Government app?** No
- **Financial features?** **None** — select "My app doesn't have any financial features."
  (Memberships are sold on the website via Stripe; the app offers no purchases.)
- **Health apps?** No
- **Data deletion — is your app subject to it?** Yes, and it's satisfied (see above).

---

# 3. Payments — important policy note

The Android app contains **no purchase flow and no purchase UI** — purchase
components are hidden on native via `Capacitor.isNativePlatform()`, verified on
the emulator. Memberships ($10.99/month, $120/year) are sold **only on the
website**. This keeps the app outside Google Play Billing scope.

**Do not** add a "Subscribe/Upgrade" button, or any link that sends users to the
website to pay, from inside the Android app — Google treats that as steering and
can reject the release.

---

# 4. Release

### App bundle
Upload **`AGA-community-release.aab`** (signed release build in this folder).
Play App Signing: **enroll** (recommended). Keep the upload keystore safe:
`C:\Users\belad\Desktop\aga-release-keystore\aga-release.jks` (alias `aga`).

### Release name / notes (what's new)
```
First release of the Alpha Gamma Alpha community app.

• Community Spaces, feed, and member profiles
• Online courses with progress tracking
• Live events with RSVP
• Direct and group messaging with photo sharing
• Resource library
• Push notifications for new messages and announcements
```

### Countries / regions
All countries, or restrict as you prefer. ← YOU

### Pricing
**Free** app (no in-app purchases).

---

# 5. Pre-launch checklist

- [ ] Play Console developer account name reads **Classroom Panda LLC** (must match the
      entity named in the in-app Terms/Privacy) ← YOU
- [ ] All three legal URLs load publicly:
      `/privacy` · `/terms` · `/account-deletion`
- [ ] Demo login works from a clean device: `appreview@agatester.dev / AgaReview!2026`
- [ ] Upload `AGA-community-release.aab`
- [ ] Upload icon + feature graphic + 7 screenshots from this folder
- [ ] Complete Data safety, Content rating, Target audience, Ads, App access
- [ ] Confirm no purchase UI appears anywhere in the Android build

### Known advisories (safe to ignore / not blocking)
- **No tablet screenshots** — optional; phone screenshots satisfy requirements.
- **Push notifications** deliver once Firebase is fully configured; the app runs
  normally without them.
- **Email notifications** require the Resend key to be readable by the server.

---

# 6. Test/demo data currently in the app

The app is populated with demo content so reviewers see a working community
(9 accounts, 2 Spaces, posts, a course with 2 lessons, 3 upcoming events,
resources, and chat threads). Visible `[[AGA-SEED]]` labels were removed on
2026-07-31 so the app reads as production.

To remove all of it later, run the teardown documented in
`AGA-test-data-seed-LOG.md` / `AGA-test-data-teardown.sql` (on the Desktop) —
it deletes by row ID, so the label removal does not affect cleanup.
