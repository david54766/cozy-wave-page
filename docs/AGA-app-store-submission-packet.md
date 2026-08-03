# AGA — App Store Connect submission packet

**App:** Alpha Gamma Alpha · **Bundle ID:** `com.aga.community`
**Seller / operating entity:** Classroom Panda LLC · **Support:** info@classroompanda.com
**Marketing URL:** https://joinagalink.com
**Generated:** 2026-08-02 — mirrors the Play packet in `aga-play-store/`.

Items only you can supply are marked **← YOU**.

---

# 1. App Information

- **Name (30 char max):** `Alpha Gamma Alpha` *(17 chars)*
- **Subtitle (30 char max):** `Community, courses & events` *(27 chars)*
- **Bundle ID:** `com.aga.community`
- **Primary language:** English (U.S.)
- **Primary category:** Social Networking
- **Secondary category:** Education
- **Content rights:** "Does not contain, show, or access third-party content" — **Yes**
  (all content is your community's own)
- **Age rating:** **12+** (see §4)

# 2. Pricing and Availability
- **Price:** **Free** (Tier 0)
- **In-App Purchases:** **None** — do not add any. Memberships are sold on the
  website only.
- **Availability:** All countries, or restrict as you prefer ← YOU

# 3. Version Information (per-version page)

### Promotional text (170 max)
```
Your private AGA community — Spaces, courses, live events, member chat, and resources, all in one place.
```

### Description (4000 max)
```
Alpha Gamma Alpha brings your whole community into one place — courses, live events, member conversations, and resources — so members can learn, connect, and grow together.

WHAT YOU CAN DO

• Community Spaces — focused rooms for every topic, cohort, and project.
• Community Feed — share updates, ask questions, post photos, and join the conversation.
• Online Courses — self-paced lessons with video and progress tracking.
• Live Events — RSVP to workshops, community calls, and member gatherings.
• Direct & Group Messaging — connect with members in real time, including photos.
• Member Profiles — build your profile and discover other members.
• Resource Library — guides, templates, and downloads in one organized place.
• Notifications — stay up to date on replies, messages, events, and announcements.

BUILT FOR MEMBERS
Sign up in under a minute, complete your profile, and you're in. Everything is designed mobile-first — clear navigation, fast loading, and a familiar app experience.

A PRIVATE, MEMBER-FOCUSED SPACE
Alpha Gamma Alpha is a private community platform. Your account gives you access to the Spaces, courses, and events shared with members.

SAFETY AND CONTROL
We have zero tolerance for objectionable content or abusive behavior. You can report any post or message, and block any member — blocked members' content disappears from your feed and they can't contact you. You can permanently delete your account and all associated data at any time from Settings.

Questions or feedback? Reach us at info@classroompanda.com.
```

### Keywords (100 char max, comma-separated, no spaces)
```
community,sorority,members,courses,events,chat,groups,learning,network,resources
```

### Support URL
`https://joinagalink.com`
### Marketing URL
`https://joinagalink.com`
### Privacy Policy URL
`https://joinagalink.com/privacy`

### What's New (first release)
```
First release of the Alpha Gamma Alpha community app — Spaces, community feed, courses with video lessons, live events with RSVP, member messaging with photo sharing, and a resource library.
```

# 4. Age Rating questionnaire

Answer **None / No** to: violence, sexual content, nudity, profanity, alcohol/
tobacco/drugs, horror, gambling, contests, medical/treatment info.

Answer **Yes** to:
- **Unrestricted Web Access:** **No** (the app does not embed a general browser)
- **User Generated Content:** **Yes** — posts, comments, messages, profiles

Because the app has UGC with messaging, expect **12+**.

Apple requires UGC apps to have all four of these — **all are implemented**:
1. A method to filter objectionable content → moderation + content flags
2. A mechanism to report offensive content → Report on posts and messages
3. The ability to block abusive users → Block on member profiles; managed in
   Settings → Blocked members
4. Published contact information → info@classroompanda.com (in-app and in the Terms)

# 5. App Privacy ("nutrition label")

**Does this app collect data?** **Yes.**
**Do you or your third-party partners use data for tracking?** **No.**
(No ad SDKs, no cross-app/cross-site tracking, no IDFA — do **not** add
AppTrackingTransparency; it isn't needed.)

| Data type | Collected | Linked to user | Used for tracking | Purpose |
|---|---|---|---|---|
| Name | Yes | Yes | No | App Functionality |
| Email Address | Yes | Yes | No | App Functionality |
| User ID | Yes | Yes | No | App Functionality |
| Photos | Yes | Yes | No | App Functionality |
| Messages (User Content) | Yes | Yes | No | App Functionality |
| Other User Content (posts, comments) | Yes | Yes | No | App Functionality |
| Product Interaction | Yes | Yes | No | Analytics, App Functionality |
| Crash Data / Performance | Yes | No | No | Analytics |

**Data NOT collected:** precise/coarse location, contacts, health, financial info,
browsing history, search history, sensitive info, advertising data.
*(The profile "location" field is optional free text, not device location — the
app requests no location permission.)*

**Processors** (service providers, not "sharing"): Supabase (hosting/database),
Firebase Cloud Messaging (push delivery), Stripe (payments — **website only**).

**Account deletion:** in-app at Settings → Danger zone → Delete account, and
publicly at `https://joinagalink.com/account-deletion` (satisfies Guideline
5.1.1(v)).

# 6. App Review Information

- **Sign-in required:** **Yes**
- **Demo account:**
  - Username: `appreview@agatester.dev`
  - Password: `AgaReview!2026`
- **Contact:** your name / phone / info@classroompanda.com ← YOU

### Notes for the reviewer (paste this)
```
AGA is a private community app for members of Alpha Gamma Alpha.

Sign in with the demo account above to reach all functionality: Spaces, community feed, courses with video lessons, live events with RSVP, direct/group messaging, member directory, and the resource library.

PAYMENTS: The app contains no in-app purchases and no purchase UI. Memberships are sold only on our website (joinagalink.com) and are not referenced or linked from inside the app. The app simply reflects the access a member already has.

USER-GENERATED CONTENT (Guideline 1.2): Members can report any post or message, and block any member (member profile → Block; managed in Settings → Blocked members). Blocked members' content is hidden and they cannot contact the user. Our Terms include a zero-tolerance policy for objectionable content, and we act on reports within 24 hours. Contact: info@classroompanda.com

ACCOUNT DELETION (Guideline 5.1.1(v)): Settings → Danger zone → Delete account permanently deletes the account and associated data. Also available publicly at https://joinagalink.com/account-deletion

SIGN IN WITH APPLE: Not applicable — the app uses only email/password accounts and offers no third-party or social login.
```

# 7. Screenshots

Required: **6.9"/6.7" iPhone** (1290×2796 or 1284×2778). Others are optional and
Apple scales down.

Capture from the iOS simulator after signing in as the demo account — same
screens as the Play set:
1. Dashboard  2. Spaces  3. Feed  4. Events  5. Courses (lesson w/ video)
6. Chat  7. Members

*(Android screenshots at 1080×2340 are in `aga-play-store/screenshots/` for
reference — Apple requires iOS-sized ones, so retake on the simulator.)*

**App icon:** `aga-play-store/appicon-ios-1024.png` — 1024×1024, opaque, no alpha.

# 8. Pre-submission checklist

- [ ] Apple Developer Program membership active; **Seller name reads
      Classroom Panda LLC** (must match the entity in the in-app Terms/Privacy) ← YOU
- [ ] Bundle ID `com.aga.community` registered
- [ ] Build uploaded via Xcode and visible in TestFlight
- [ ] Info.plist has the photo + camera usage strings and
      `ITSAppUsesNonExemptEncryption = NO`
- [ ] AppIcon 1024 set, **no alpha**
- [ ] iOS screenshots captured at 6.9"/6.7"
- [ ] Demo account entered in App Review Information
- [ ] App Privacy answered per §5; **Tracking = No**
- [ ] Age rating completed → 12+
- [ ] Confirm **no purchase UI** anywhere in the build
- [ ] Privacy Policy URL live: https://joinagalink.com/privacy

# 9. Likely rejection reasons — and why we're covered

| Risk | Status |
|---|---|
| 5.1.1(v) no account deletion | ✅ in-app + public URL |
| 1.2 UGC without report/block | ✅ report + block + zero-tolerance terms + contact |
| 3.1.1 external purchase links | ✅ no purchase UI or payment links in the app |
| 5.1.1 requires account but none can be created | ✅ free Sign up tab retained |
| 2.1 incomplete — reviewer can't sign in | ✅ demo account provided |
| 4.2 minimum functionality ("just a website") | ✅ native shell, push, photo picker, offline handling, native nav |
| Missing privacy strings → crash on photo pick | ✅ Info.plist strings required in the Codex prompt |
