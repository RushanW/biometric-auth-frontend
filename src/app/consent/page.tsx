// src/app/consent/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ConsentPage() {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);

  const canContinue = c1 && c2;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Consent</h1>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
        <p className="mb-3">
          We use your camera to capture facial biometrics to enable Face sign-in.
          Data is stored securely and used only for authentication.
        </p>
        <label className="mb-2 flex items-start gap-2">
          <input type="checkbox" checked={c1} onChange={e => setC1(e.target.checked)} />
          <span>I consent to the collection and processing of my facial biometrics.</span>
        </label>
        <label className="mb-4 flex items-start gap-2">
          <input type="checkbox" checked={c2} onChange={e => setC2(e.target.checked)} />
          <span>I understand I can revoke consent and delete my data at any time.</span>
        </label>
        <div className="flex gap-2">
          <Link
            href={canContinue ? '/enroll/guide' : '#'}
            aria-disabled={!canContinue}
            className={`rounded-xl border px-4 py-2 ${canContinue
              ? 'border-blue-500/40 bg-blue-600/15 text-blue-200 hover:bg-blue-600/25'
              : 'cursor-not-allowed border-neutral-800 text-neutral-500'}`}
            onClick={(e) => { if (!canContinue) e.preventDefault(); sessionStorage.setItem('consent:version', 'v1.0'); }}
          >
            Continue
          </Link>
          <Link className="rounded-xl border border-neutral-800 px-4 py-2 text-neutral-400 hover:border-neutral-600" href="/">
            Cancel
          </Link>
        </div>
      </div>
    </main>
  );
}
