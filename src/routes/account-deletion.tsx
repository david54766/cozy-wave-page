import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/app/BrandLogo";

export const Route = createFileRoute("/account-deletion")({
  head: () => ({
    meta: [
      { title: "Account & Data Deletion | Alpha Gamma Alpha" },
      { name: "description", content: "How to delete your Alpha Gamma Alpha account and associated data." },
    ],
  }),
  component: AccountDeletionPage,
});

/**
 * Public, no-auth page that documents how to delete an account and what data is
 * removed vs. retained. Google Play requires a deletion URL reachable WITHOUT
 * installing the app (Play Console → Data safety → Data deletion). This is that
 * URL: https://joinagalink.com/account-deletion
 */
function AccountDeletionPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><BrandLogo className="size-9" /><span className="font-semibold tracking-tight">Alpha Gamma Alpha</span></Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4 text-sm leading-relaxed">
        <h1 className="text-3xl font-semibold tracking-tight">Account &amp; Data Deletion</h1>
        <p className="text-muted-foreground">Last updated: July 2026</p>

        <p>
          This page explains how to delete your Alpha Gamma Alpha account and the
          data associated with it. It applies to the Alpha Gamma Alpha mobile apps
          and website, operated by Classroom Panda LLC (developer contact:{" "}
          <a href="mailto:info@easyfill.ai" className="text-primary hover:underline">info@easyfill.ai</a>).
        </p>

        <h2 className="text-lg font-semibold pt-2">Delete your account from inside the app</h2>
        <p>The fastest way — your account and data are removed immediately:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Open Alpha Gamma Alpha and sign in.</li>
          <li>Go to <strong>Settings</strong>.</li>
          <li>Scroll to the <strong>Danger zone</strong> and tap <strong>Delete account</strong>.</li>
          <li>Confirm. Your account is permanently deleted and you are signed out.</li>
        </ol>

        <h2 className="text-lg font-semibold pt-2">Request deletion without the app</h2>
        <p>
          If you can't access the app, email{" "}
          <a href="mailto:info@easyfill.ai?subject=Account%20deletion%20request" className="text-primary hover:underline">info@easyfill.ai</a>{" "}
          from the email address on your account with the subject
          "Account deletion request." We verify ownership of the email address and
          complete the deletion, then confirm by reply — normally within 30 days.
        </p>

        <h2 className="text-lg font-semibold pt-2">What is deleted</h2>
        <p>Deleting your account permanently removes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your profile (name, email, bio, location, avatar, cover image, links).</li>
          <li>Your posts, comments, reactions, and event RSVPs.</li>
          <li>Your direct messages and uploaded images.</li>
          <li>Your membership/access records and notification preferences.</li>
          <li>Your login credentials — you can no longer sign in.</li>
        </ul>

        <h2 className="text-lg font-semibold pt-2">What may be retained, and for how long</h2>
        <p>
          We may retain a limited amount of information only where required for
          legal, security, or accounting reasons — for example, transaction and
          invoice records associated with a paid membership are kept as required by
          tax and financial-record laws (typically up to 7 years). Payment
          processing is handled by Stripe under their own retention policy; we do
          not store full card details. Backup copies are purged on our normal
          backup rotation (within 30 days). Retained records are not used to
          re-create your account or profile.
        </p>

        <h2 className="text-lg font-semibold pt-2">Questions</h2>
        <p>
          Contact{" "}
          <a href="mailto:info@easyfill.ai" className="text-primary hover:underline">info@easyfill.ai</a>{" "}
          with any questions about deleting your account or data.
        </p>

        <p className="pt-4 flex gap-4">
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy →</Link>
          <Link to="/terms" className="text-primary hover:underline">Terms of Use →</Link>
        </p>
      </article>
    </main>
  );
}
