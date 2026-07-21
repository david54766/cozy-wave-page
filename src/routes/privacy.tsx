import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/app/BrandLogo";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy | Alpha Gamma Alpha" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><BrandLogo className="size-9" /><span className="font-semibold tracking-tight">Alpha Gamma Alpha</span></Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4 text-sm leading-relaxed">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: July 2026</p>

        <p>Alpha Gamma Alpha ("we", "us") provides a private community platform. This policy explains what we collect, why, and your choices.</p>

        <h2 className="text-lg font-semibold pt-2">Information we collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account information</strong> you provide: name and email address, and any profile details you add (bio, location, avatar, cover image, links).</li>
          <li><strong>Content you create</strong>: posts, comments, reactions, messages, uploaded images, event RSVPs, and course activity.</li>
          <li><strong>Usage information</strong>: basic in-app activity used to operate and improve the app.</li>
        </ul>
        <p>We do not use third-party advertising trackers, and we do not track you across other apps or websites.</p>

        <h2 className="text-lg font-semibold pt-2">How we use information</h2>
        <p>To create and manage your account; to provide community features (spaces, feed, courses, events, messaging, notifications); and to secure the service and respond to support requests.</p>

        <h2 className="text-lg font-semibold pt-2">Storage and sharing</h2>
        <p>Data is stored with our backend provider, Supabase, and transmitted over encrypted HTTPS. Content you post is visible to other members according to the app's access rules. We do not sell your personal information. Payments, where applicable, are processed by Stripe; we do not store full card details.</p>

        <h2 className="text-lg font-semibold pt-2">Your choices and rights</h2>
        <p>You can view and edit your profile in the app. You can permanently delete your account and associated data at any time from <strong>Settings → Delete account</strong>. You can also block other members from their profile.</p>

        <h2 className="text-lg font-semibold pt-2">Cookies and local storage</h2>
        <p>On the web, we use essential local storage/cookies to keep you signed in and remember preferences, and basic analytics to improve the app. We do not use advertising cookies.</p>

        <h2 className="text-lg font-semibold pt-2">Data retention</h2>
        <p>We retain your information while your account is active or as needed to provide the service and comply with legal obligations. Deleting your account removes your data.</p>

        <h2 className="text-lg font-semibold pt-2">Children's privacy</h2>
        <p>The Service is intended for users aged 13 and older. We do not knowingly collect information from children under that age.</p>

        <h2 className="text-lg font-semibold pt-2">Changes</h2>
        <p>We may update this policy; material changes will be posted here with an updated date.</p>

        <h2 className="text-lg font-semibold pt-2">Contact</h2>
        <p>Questions about this policy: <a href="mailto:info@easyfill.ai" className="text-primary hover:underline">info@easyfill.ai</a>.</p>

        <p className="pt-4"><Link to="/terms" className="text-primary hover:underline">Terms of Use →</Link></p>
      </article>
    </main>
  );
}
