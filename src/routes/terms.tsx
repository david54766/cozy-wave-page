import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/app/BrandLogo";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Use | Alpha Gamma Alpha" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><BrandLogo className="size-9" /><span className="font-semibold tracking-tight">Alpha Gamma Alpha</span></Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose-sm space-y-4 text-sm leading-relaxed">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="text-muted-foreground">Last updated: July 2026</p>

        <p>These Terms of Use ("Terms") govern your use of the Alpha Gamma Alpha application and website (the "Service"), operated by Classroom Panda LLC ("we", "us", "our"). By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.</p>

        <h2 className="text-lg font-semibold pt-2">1. Eligibility</h2>
        <p>You must be at least 13 years old to use the Service. By using it, you represent that you meet this requirement.</p>

        <h2 className="text-lg font-semibold pt-2">2. Accounts</h2>
        <p>You are responsible for your account and keeping your login secure. You may delete your account at any time from Settings → Delete account, which permanently removes your account and associated data. You can also request deletion without the app — see <Link to="/account-deletion" className="text-primary hover:underline">Account &amp; Data Deletion</Link>.</p>

        <h2 className="text-lg font-semibold pt-2">3. Membership and payments</h2>
        <p>Some features require a paid membership, purchased and managed on our website. Fees and renewal terms are shown at the point of purchase. Paid memberships renew automatically until cancelled. Payments are processed by Stripe; we do not store full card details.</p>
        <p>You can cancel a recurring membership at any time from your billing settings on the website, or by contacting <a href="mailto:info@easyfill.ai" className="text-primary hover:underline">info@easyfill.ai</a>. Cancellation stops future renewals; unless required by law, payments already made are non-refundable, and you keep access until the end of the paid period.</p>

        <h2 className="text-lg font-semibold pt-2">4. Your content</h2>
        <p>You retain ownership of content you post. You grant us a non-exclusive, worldwide, royalty-free license to host and display that content within the Service to operate it. You are responsible for content you post and must have the right to post it.</p>

        <h2 className="text-lg font-semibold pt-2">5. Objectionable content and conduct — zero tolerance</h2>
        <p>There is no tolerance for objectionable, abusive, harassing, hateful, threatening, sexually explicit, or illegal content, or for abusive users. You agree not to post such content or engage in such conduct. We may remove content and suspend or terminate accounts that violate this policy, without notice.</p>
        <p>To keep the community safe, you can <strong>report</strong> a post or message from its menu, and <strong>block</strong> another member from their profile (you will no longer see their content and they cannot contact you). Administrators review reports and may remove content or members who violate these Terms, typically within 24 hours.</p>

        <h2 className="text-lg font-semibold pt-2">6. Prohibited uses</h2>
        <p>Do not break the law, infringe others' rights, harass others, upload malware, scrape or reverse-engineer the Service, or access accounts or data that aren't yours.</p>

        <h2 className="text-lg font-semibold pt-2">7. Termination</h2>
        <p>We may suspend or terminate access for violation of these Terms. You may stop using the Service and delete your account at any time.</p>

        <h2 className="text-lg font-semibold pt-2">8. Disclaimers &amp; liability</h2>
        <p>The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Service.</p>

        <h2 className="text-lg font-semibold pt-2">9. Governing law</h2>
        <p>The Service is operated by Classroom Panda LLC. These Terms are governed by the laws of the United States and the State of Tennessee, without regard to conflict-of-law rules. You agree that the courts located in Tennessee have jurisdiction over any dispute arising from these Terms or the Service, except where applicable law gives you the right to bring a claim elsewhere.</p>

        <h2 className="text-lg font-semibold pt-2">10. Changes</h2>
        <p>We may update these Terms; material changes will be posted here with an updated date. Continued use after changes means you accept them.</p>

        <h2 className="text-lg font-semibold pt-2">11. Contact</h2>
        <p>Questions about these Terms: <a href="mailto:info@easyfill.ai" className="text-primary hover:underline">info@easyfill.ai</a>.</p>

        <p className="pt-4 flex gap-4"><Link to="/privacy" className="text-primary hover:underline">Privacy Policy →</Link><Link to="/account-deletion" className="text-primary hover:underline">Account &amp; Data Deletion →</Link></p>
      </article>
    </main>
  );
}
