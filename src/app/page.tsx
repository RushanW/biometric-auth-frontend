// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[70vh]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Biometric Auth
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Secure sign-in with face recognition and liveness protection.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sign in card */}
        <section
          aria-labelledby="signin-title"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 md:p-7"
        >
          <h2 id="signin-title" className="text-xl font-medium">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Choose a method. Face is quickest and includes a short liveness
            check.
          </p>

          <div className="mt-5 space-y-3">
            <Link
              href="/auth/face"
              className="group inline-flex w-full items-center justify-between rounded-xl border border-neutral-700 bg-white/[0.03] px-4 py-3 outline-none ring-0 transition hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Continue with Face"
            >
              <div className="flex items-center gap-3">
                <FaceIcon className="h-5 w-5 opacity-90" />
                <div className="text-left">
                  <div className="font-medium">Continue with Face</div>
                  <div className="text-xs text-neutral-400">
                    Fastest · Liveness protected
                  </div>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/auth/passkey"
              className="inline-flex w-full items-center justify-between rounded-xl border border-neutral-700 bg-white/[0.02] px-4 py-3 text-sm outline-none transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Use Passkey"
            >
              <div className="flex items-center gap-3">
                <KeyIcon className="h-5 w-5 opacity-90" />
                <span>Use Passkey</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 opacity-50" />
            </Link>

            <Link
              href="/auth/otp"
              className="inline-flex w-full items-center justify-between rounded-xl border border-neutral-700 bg-white/[0.02] px-4 py-3 text-sm outline-none transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Get OTP"
            >
              <div className="flex items-center gap-3">
                <MessageIcon className="h-5 w-5 opacity-90" />
                <span>Get OTP</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 opacity-50" />
            </Link>
          </div>
        </section>

        {/* New here card */}
        <aside
          aria-labelledby="newhere-title"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 md:p-7"
        >
          <h2 id="newhere-title" className="text-xl font-medium">
            New here?
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Set up biometric access in about a minute.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Consent to data use and storage policy</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Quick face capture with guidance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Short liveness check (blink / turn)</span>
            </li>
          </ul>

          <Link
            href="/consent"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-white/[0.04] px-4 py-2 text-sm outline-none transition hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Enroll Face ID"
          >
            <SparkleIcon className="h-4 w-4" />
            Enroll Face ID
          </Link>
        </aside>
      </div>
    </main>
  );
}

/* ---------- inline icons (no extra deps) ---------- */
function FaceIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.5" d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="11" r="1" fill="currentColor" />
      <path d="M10 15c.6.4 1.4.6 2 .6s1.4-.2 2-.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="8.5" cy="8.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 9h8v3h-2l-1 1h-2l-1 1h-2v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 6h16v10H7l-3 3V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="13" cy="11" r="1" fill="currentColor" />
      <circle cx="17" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 7L10 17l-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3l1.5 3.8L17 8.5l-3.5 1.7L12 14l-1.5-3.8L7 8.5l3.5-1.7L12 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M19 12l.9 2.2L22 15l-2.1 1.1L19 18l-.9-1.9L16 15l2.1-.8L19 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
