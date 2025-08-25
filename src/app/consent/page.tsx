// src/app/consent/page.tsx
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConsentPage() {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const router = useRouter();

  const canContinue = useMemo(() => c1 && c2, [c1, c2]);

  const onContinue = () => {
    if (!canContinue) return;
    // version your consent so you can prompt again on policy change
    sessionStorage.setItem("consent:version", "v1.0");
    router.push("/enroll/guide");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* heading + underline accent */}
      <div className="relative inline-block">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2">
          Consent
        </h1>
        <span className="absolute bottom-0 left-0 h-1 w-24 rounded-full bg-gradient-to-r from-rose-500 to-indigo-500" />
      </div>

      {/* glass card */}
      <section
        className="
          mt-6 rounded-2xl border border-white/20
          bg-gradient-to-br from-white/90 to-white/70
          backdrop-blur-xl shadow-xl
          p-5 md:p-7
        "
        aria-labelledby="consent-title"
      >
        <h2 id="consent-title" className="sr-only">
          Biometric consent details
        </h2>

        <p className="text-sm text-foreground/80">
          We use your camera to capture facial biometrics to enable Face sign-in.
          The data is stored securely and used only for authentication.
        </p>

        {/* quick highlights */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700">
            Purpose: Sign-in only
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700">
            Enroll once
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">
            Revoke anytime
          </span>
        </div>

        {/* what we collect / how we use */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral/20 bg-white/80 p-4">
            <div className="text-sm font-medium text-foreground">What we collect</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
              <li>Face embeddings (mathematical representation)</li>
              <li>Liveness signals (blink / head turn)</li>
              <li>Basic device metadata (for fraud control)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral/20 bg-white/80 p-4">
            <div className="text-sm font-medium text-foreground">How it’s used</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
              <li>Authenticate your account</li>
              <li>Detect spoofing attempts</li>
              <li>Never sold or used for ads</li>
            </ul>
          </div>
        </div>

        {/* checkboxes */}
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onContinue();
          }}
          aria-describedby="consent-hint"
        >
          <label className="flex items-start gap-3 text-sm text-foreground/90">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded accent-rose-500"
              checked={c1}
              onChange={(e) => setC1(e.target.checked)}
            />
            <span>I consent to the collection and processing of my facial biometrics.</span>
          </label>

          <label className="flex items-start gap-3 text-sm text-foreground/90">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded accent-rose-500"
              checked={c2}
              onChange={(e) => setC2(e.target.checked)}
            />
            <span>I understand I can revoke consent and delete my data at any time.</span>
          </label>

          <div id="consent-hint" className="sr-only">
            Check both boxes to continue.
          </div>

          {/* CTA row */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canContinue}
              aria-disabled={!canContinue}
              className={`
                inline-flex items-center justify-center rounded-xl
                px-5 py-2.5 text-sm font-semibold text-white
                shadow-lg transition
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-400
                active:scale-[0.98]
                ${canContinue
                  ? "bg-gradient-to-r from-rose-500 to-indigo-500 hover:brightness-105 hover:shadow-xl"
                  : "cursor-not-allowed bg-neutral/50 text-white/70"}
              `}
              title={canContinue ? "Continue to enrollment" : "Please check both boxes"}
            >
              Continue
            </button>

            <Link
              href="/"
              className="rounded-xl border border-neutral/30 bg-white px-4 py-2 text-sm text-foreground shadow-sm hover:bg-neutral/100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400"
            >
              Cancel
            </Link>

            <Link
              href="/privacy"
              className="ml-auto text-sm font-medium text-indigo-600 hover:underline"
            >
              Read privacy policy
            </Link>
          </div>

          {/* live region for validation feedback */}
          <div
            aria-live="polite"
            className="mt-2 text-xs text-rose-600"
          >
            {!canContinue ? "Please accept both statements to continue." : "You're good to go."}
          </div>
        </form>
      </section>
    </main>
  );
}
