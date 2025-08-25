import Link from 'next/link';

export default function EnrollSuccessPage() {
  return (
    <main className="mx-auto max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600">
          {/* Check Icon */}
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M16.25 6.25l-7.5 7.5L3.75 8.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-medium text-white">Enrollment complete</h2>
          <p className="text-sm text-neutral-400">
            You can now sign in with face + liveness.
          </p>
        </div>
      </div>

      {/* Little details card */}
      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <ul className="space-y-2 text-sm text-neutral-300">
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Liveness flow enabled for your account
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Face template stored securely on-device/server (per your config)
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            You can manage or reset enrollment any time
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Go to Home
        </Link>
        <Link
          href="/settings/biometrics"
          className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
        >
          Manage Settings
        </Link>
      </div>

      {/* Subtle success hint */}
      <p className="mt-4 text-xs text-neutral-500">
        Tip: If you switch devices or clear data, you may need to re-enroll.
      </p>
    </main>
  );
}
