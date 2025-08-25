import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How we collect, use, store, and protect your data for biometric sign-in.",
};

export default function PrivacyPage() {
  const lastUpdated = "August 25, 2025";
  const version = "v1.0";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      {/* Heading + underline accent */}
      <div className="relative inline-block">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Privacy Policy
        </h1>
        <span className="absolute bottom-0 left-0 h-1 w-28 rounded-full bg-gradient-to-r from-rose-500 to-indigo-500" />
      </div>

      <p className="mt-2 text-sm text-foreground/70">
        Last updated: {lastUpdated} · Version: {version}
      </p>

      {/* Glass card container */}
      <section
        className="
          mt-6 rounded-2xl border border-white/20
          bg-gradient-to-br from-white/90 to-white/70
          backdrop-blur-xl shadow-xl
          p-5 md:p-7
        "
      >
        {/* --- Summary Highlights --- */}
        <div className="mt-4 grid gap-3 sm:flex sm:gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-xs font-medium text-rose-700">
              No passwords
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-medium text-indigo-700">
              Liveness protected
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-700">
              Revoke anytime
            </span>
          </div>
        </div>

        {/* --- Table of Contents --- */}
        <nav
          aria-label="Privacy policy sections"
          className="mt-8 grid gap-3 sm:grid-cols-2"
        >
          {[
            ["Overview", "#overview"],
            ["Data We Collect", "#data-we-collect"],
            ["How We Use Data", "#how-we-use"],
            ["Legal Basis", "#legal-basis"],
            ["Storage & Retention", "#storage"],
            ["Security", "#security"],
            ["Sharing & Processors", "#sharing"],
            ["Your Rights", "#your-rights"],
            ["Revoke Consent & Delete", "#revoke"],
            ["Children", "#children"],
            ["Changes", "#changes"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="
        flex items-center justify-between rounded-lg
        border border-white/30 bg-white/60 backdrop-blur-sm
        px-4 py-2 text-sm font-medium text-foreground/90 shadow-sm
        hover:border-indigo-400 hover:shadow-md hover:bg-white/80
        transition
      "
            >
              {label}
              <span className="text-xs text-indigo-500">→</span>
            </Link>
          ))}
        </nav>

        {/* Sections */}
        <article className="prose prose-sm md:prose-base prose-slate max-w-none mt-6">
          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">Overview</h2>
            <p className="text-foreground/80">
              This policy explains how we collect, use, store, and protect your
              information when you use our biometric face sign-in and liveness
              verification features. We designed the system to minimize data and
              keep you in control.
            </p>
          </section>

          {/* Data We Collect */}
          <section id="data-we-collect" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              Data We Collect
            </h2>
            <ul className="list-disc pl-5 text-foreground/80">
              <li>
                <strong>Face embeddings</strong> — a numerical representation of
                your face generated from camera input (not raw video stored for
                sign-in).
              </li>
              <li>
                <strong>Liveness signals</strong> — short interactions like
                blink / head-turn results to confirm it’s you.
              </li>
              <li>
                <strong>Basic device metadata</strong> — limited information
                (e.g., device type, OS) to prevent fraud and improve security.
              </li>
            </ul>
          </section>

          {/* How We Use */}
          <section id="how-we-use" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              How We Use Data
            </h2>
            <ul className="list-disc pl-5 text-foreground/80">
              <li>Authenticate your sign-in quickly and securely.</li>
              <li>Run liveness checks to prevent spoofing.</li>
              <li>Troubleshoot and protect the service from abuse/fraud.</li>
              <li>Comply with legal obligations where applicable.</li>
            </ul>
            <p className="mt-3 text-foreground/80">
              We do <strong>not</strong> sell your data or use biometrics for
              advertising.
            </p>
          </section>

          {/* Legal Basis */}
          <section id="legal-basis" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              Legal Basis
            </h2>
            <p className="text-foreground/80">
              We process biometric data based on your{" "}
              <strong>explicit consent</strong>. You can revoke consent at any
              time (see{" "}
              <Link className="text-indigo-600 underline" href="#revoke">
                Revoke Consent &amp; Delete
              </Link>
              ).
            </p>
          </section>

          {/* Storage & Retention */}
          <section id="storage" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              Storage &amp; Retention
            </h2>
            <ul className="list-disc pl-5 text-foreground/80">
              <li>
                Face embeddings and liveness results are stored securely in
                encrypted form.
              </li>
              <li>
                We retain biometric data only while your enrollment remains
                active or as required by law.
              </li>
              <li>
                If you revoke consent or delete your account, biometric records
                are scheduled for deletion within a reasonable period.
              </li>
            </ul>
          </section>

          {/* Security */}
          <section id="security" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
            <ul className="list-disc pl-5 text-foreground/80">
              <li>Encryption in transit and at rest.</li>
              <li>Least-privilege access controls and auditing.</li>
              <li>Defense-in-depth against spoofing and tampering.</li>
            </ul>
            <p className="mt-3 text-foreground/80">
              Despite safeguards, no system can be 100% secure. We continuously
              improve our protections.
            </p>
          </section>

          {/* Sharing */}
          <section id="sharing" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              Sharing &amp; Processors
            </h2>
            <p className="text-foreground/80">
              We do not sell your data. We may share limited data with trusted
              service providers (processors) who help us operate the service
              (e.g., cloud hosting). These providers are bound by contractual
              obligations and may only process data on our instructions.
            </p>
          </section>

          {/* Rights */}
          <section id="your-rights" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              Your Rights
            </h2>
            <ul className="list-disc pl-5 text-foreground/80">
              <li>Access: request a copy of your data we hold.</li>
              <li>Correction: fix inaccurate information.</li>
              <li>Deletion: request erasure of your biometric data.</li>
              <li>Objection/Restriction: limit certain processing.</li>
              <li>
                Portability: receive data in a portable format (where
                applicable).
              </li>
              <li>Withdraw Consent: stop biometric processing at any time.</li>
            </ul>
          </section>

          {/* Revoke / Delete */}
          <section id="revoke" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              Revoke Consent &amp; Delete
            </h2>
            <p className="text-foreground/80">
              You can revoke consent and delete your enrollment in{" "}
              <Link
                className="text-indigo-600 underline"
                href="/settings/biometrics"
              >
                Settings &rarr; Biometrics
              </Link>
              . After revocation, we schedule your biometric records for
              deletion and disable Face sign-in for your account.
            </p>
          </section>

          {/* Children */}
          <section id="children" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">Children</h2>
            <p className="text-foreground/80">
              Our service is not directed to children under 13 (or the minimum
              age required by your jurisdiction). We do not knowingly collect
              biometric data from children.
            </p>
          </section>

          {/* Changes */}
          <section id="changes" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              Changes to This Policy
            </h2>
            <p className="text-foreground/80">
              We may update this policy as we improve the service or as laws
              change. If changes are significant, we’ll notify you and, where
              required, request your consent again.
            </p>
          </section>

          {/* Contact */}
          <section id="contact" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p className="text-foreground/80">
              Questions or requests? Email us at{" "}
              <a
                href="mailto:privacy@yourdomain.com"
                className="text-indigo-600 underline"
              >
                privacy@yourdomain.com
              </a>
              .
            </p>
          </section>

          {/* Disclaimer */}
          <section className="mt-6 scroll-mt-24">
            <p className="text-xs text-foreground/60">
              This page is provided for transparency and usability. It is not
              legal advice. Consult qualified counsel to adapt this policy to
              your specific obligations.
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
