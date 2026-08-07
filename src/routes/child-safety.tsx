import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/app/BrandLogo";

export const Route = createFileRoute("/child-safety")({
  head: () => ({
    meta: [
      { title: "Child Safety Standards | Alpha Gamma Alpha" },
      {
        name: "description",
        content:
          "Alpha Gamma Alpha's published standards against child sexual abuse and exploitation (CSAE).",
      },
    ],
  }),
  component: ChildSafetyPage,
});

/**
 * Publicly published CSAE standards.
 *
 * Google Play's Child Safety Standards policy requires apps with social or
 * user-generated content features to publish standards against child sexual
 * abuse and exploitation at a public URL, and to provide a point of contact.
 * Play Console asks for this URL: https://joinagalink.com/child-safety
 */
function ChildSafetyPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo className="size-9" />
            <span className="font-semibold tracking-tight">Alpha Gamma Alpha</span>
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4 text-sm leading-relaxed">
        <h1 className="text-3xl font-semibold tracking-tight">Child Safety Standards</h1>
        <p className="text-muted-foreground">Last updated: August 2026</p>

        <p>
          Alpha Gamma Alpha is operated by Classroom Panda LLC. We are committed to
          preventing and eliminating child sexual abuse and exploitation (CSAE) on
          our platform. This page sets out our published standards, as required by
          Google Play's Child Safety Standards policy.
        </p>

        <h2 className="text-lg font-semibold pt-2">1. Zero tolerance</h2>
        <p>
          We have <strong>zero tolerance</strong> for child sexual abuse material
          (CSAM) and for any content or conduct that sexualizes, exploits, or
          endangers minors. This includes, without limitation:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Child sexual abuse material in any form.</li>
          <li>Sexualized depictions or descriptions of minors, real or generated.</li>
          <li>Grooming, sextortion, or solicitation of a minor.</li>
          <li>Trafficking, or advertising, soliciting, or facilitating access to minors.</li>
          <li>Inappropriate contact with, or sexual commentary about, a minor.</li>
        </ul>
        <p>
          This conduct is prohibited by our <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link>{" "}
          and violates the law. It is prohibited whether or not the content depicts a
          real person.
        </p>

        <h2 className="text-lg font-semibold pt-2">2. Minimum age</h2>
        <p>
          Alpha Gamma Alpha is intended for members aged <strong>13 and older</strong>.
          We do not knowingly permit accounts for children under that age. If we learn
          that an account belongs to someone under 13, we terminate it and delete the
          associated data.
        </p>

        <h2 className="text-lg font-semibold pt-2">3. How to report</h2>
        <p>
          Anyone can report CSAE content or behavior, whether or not they have an
          account:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>In the app:</strong> use <strong>Report</strong> on any post,
            comment, or message, and <strong>Block</strong> on any member's profile.
          </li>
          <li>
            <strong>By email:</strong> contact our child safety point of contact at{" "}
            <a href="mailto:info@classroompanda.com?subject=Child%20Safety%20Report" className="text-primary hover:underline">
              info@classroompanda.com
            </a>{" "}
            with the subject "Child Safety Report."
          </li>
        </ul>
        <p>
          Reports of CSAE are treated as the highest priority. You do not need to
          identify yourself to make a report.
        </p>

        <h2 className="text-lg font-semibold pt-2">4. How we respond</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Review:</strong> reports of suspected CSAE are prioritized and
            reviewed promptly — normally within 24 hours.
          </li>
          <li>
            <strong>Removal:</strong> violating content is removed immediately on
            confirmation.
          </li>
          <li>
            <strong>Account action:</strong> the responsible account is suspended or
            permanently terminated, and we take reasonable steps to prevent the person
            from re-registering.
          </li>
          <li>
            <strong>Reporting to authorities:</strong> we report apparent child sexual
            abuse material to the{" "}
            <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              National Center for Missing &amp; Exploited Children (NCMEC)
            </a>{" "}
            via the CyberTipline, and cooperate with law enforcement as required by
            applicable law.
          </li>
          <li>
            <strong>Preservation:</strong> we preserve relevant records as required to
            support investigations.
          </li>
        </ul>

        <h2 className="text-lg font-semibold pt-2">5. Point of contact</h2>
        <p>
          Our designated child safety point of contact, including for law enforcement
          and regulator inquiries, is:
        </p>
        <p>
          Classroom Panda LLC —{" "}
          <a href="mailto:info@classroompanda.com" className="text-primary hover:underline">
            info@classroompanda.com
          </a>
        </p>

        <h2 className="text-lg font-semibold pt-2">6. Compliance</h2>
        <p>
          We comply with applicable child safety laws and regulations in the
          jurisdictions where Alpha Gamma Alpha is available, and with Google Play's
          Child Safety Standards policy and Apple's App Store guidelines. We review
          these standards periodically and update them as our platform and the law
          change.
        </p>

        <h2 className="text-lg font-semibold pt-2">7. Getting help</h2>
        <p>
          If a child is in immediate danger, contact your local emergency services
          first. In the United States you can also reach the NCMEC CyberTipline at{" "}
          <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            report.cybertip.org
          </a>{" "}
          or 1-800-843-5678.
        </p>

        <p className="pt-4 flex flex-wrap gap-4">
          <Link to="/terms" className="text-primary hover:underline">Terms of Use →</Link>
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy →</Link>
          <Link to="/account-deletion" className="text-primary hover:underline">Account &amp; Data Deletion →</Link>
        </p>
      </article>
    </main>
  );
}
