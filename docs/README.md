# AGA — build & submission docs

Reference docs that travel with the repo. Not part of the app build.

- **AGA-xcode-handoff-for-codex.md** — start here for the iOS build (written for
  an agent/dev on a Mac). Exact commands, guardrails, signing, push, submission.
- **AGA-ios-xcode-handoff.md** — human-readable version of the iOS handoff.
- **AGA-app-store-submission-answers.md** — App Store Connect / Play listing
  answers: app info, App Privacy / Data Safety, age rating, review notes,
  compliance status.
- **AGA-play-store-legal-checklist.md** — Google Play legal pages, Data-safety
  answers, content rating, and the deletion URL, mapped to Console fields.
- **AGA-xcode-update-2.md** — incremental iOS build for the recent, unsubmitted
  changes; opens with a check that the previous submission is complete.
- **STRIPE-PAYMENTS-SETUP.md** — web payments setup (secrets, webhook, test flow,
  API-key restrictions). Payments are web-only; native hides purchase UI.
- **PUSH-NOTIFICATIONS-SETUP.md** — push is scaffolded/dormant; what Firebase/APNs
  assets are needed to activate it.
- **terms-of-use.md / privacy-policy.md** — legal drafts (also live in-app at
  `/terms` and `/privacy`). Review with counsel; host and link in the stores.

Owner-run steps referenced across these docs (Supabase): the signup trigger,
`blocked_users`, `delete_own_account`, and the public `profiles` storage bucket
with write policies.
