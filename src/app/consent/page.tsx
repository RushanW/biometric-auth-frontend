'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function ConsentPage() {
  const [agree, setAgree] = useState(false);
  const router = useRouter();

  return (
    <main className="mx-auto max-w-3xl">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 md:p-7">
        <h1 className="text-xl font-semibold">Consent</h1>
        <p className="mt-2 text-sm text-neutral-300">
          We use your camera to confirm it’s really you. Processing happens on your device where possible; only a compact
          template is sent to the server. You can delete your biometric data anytime in Settings.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-neutral-400">
          <li>• Purpose: authentication & fraud prevention</li>
          <li>• Storage: feature vectors, not raw images</li>
          <li>• Retention: until you delete or your account is removed</li>
        </ul>

        <label className="mt-6 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            I agree to biometric processing for authentication.
            {' '}
            <Link href="/privacy" className="text-neutral-200 underline underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
          </span>
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            disabled={!agree}
            onClick={() => router.push('/device-check')}
            className="rounded-xl border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-600/25 disabled:opacity-50"
          >
            Continue
          </button>
          <Link
            href="/"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-600"
          >
            Cancel
          </Link>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Can’t use your camera? Try <Link href="/recovery" className="underline underline-offset-4">recovery options</Link>.
        </p>
      </section>
    </main>
  );
}
