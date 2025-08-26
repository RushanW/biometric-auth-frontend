'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadEnrollmentSnapshot, clearEnrollmentSnapshot } from '../../../lib/enrollSession';

type Pending = {
  userId: string;
  name: string;
  email: string;
  descriptor: number[];
  createdAt: string;
};

function isValidEmail(v: string) {
  // simple, robust enough for UI validation (server still validates)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function ReviewPage() {
  const router = useRouter();

  const [pending, setPending] = useState<Pending | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // load snapshot + pending from session
  useEffect(() => {
    const pRaw = sessionStorage.getItem('pendingEnrollment');
    if (pRaw) {
      const p: Pending = JSON.parse(pRaw);
      setPending(p);
      setName(p.name ?? '');
      setEmail(p.email ?? '');
    }
    const snap = loadEnrollmentSnapshot();
    if (snap?.imageDataUrl) setImage(snap.imageDataUrl);
  }, []);

  // progress ticker
  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 5)), 120);
    return () => clearInterval(t);
  }, []);

  // live validation
  const nameError = useMemo(() => (name.trim().length === 0 ? 'Name is required' : ''), [name]);
  const emailError = useMemo(() => {
    if (email.trim().length === 0) return 'Email is required';
    if (!isValidEmail(email)) return 'Enter a valid email';
    return '';
  }, [email]);

  const canFinish =
    !!pending &&
    progress >= 100 &&
    !submitting &&
    nameError === '' &&
    emailError === '' &&
    name.trim().length > 0 &&
    email.trim().length > 0;

  // persist edits to sessionStorage
  useEffect(() => {
    if (!pending) return;
    const updated: Pending = {
      ...pending,
      name: name.trim(),
      email: email.trim(),
    };
    setPending(updated);
    sessionStorage.setItem('pendingEnrollment', JSON.stringify(updated));
  }, [name, email]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFinish() {
    if (!pending || !canFinish) return;
    const snapshot = loadEnrollmentSnapshot();

    setSubmitting(true);
    try {
      const res = await fetch('/api/biometrics/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pending,
          name: name.trim(),
          email: email.trim(),
          snapshot, // optional but helpful
        }),
      });
      if (!res.ok) throw new Error(`Enroll failed: ${res.status}`);

      // for success page
      sessionStorage.setItem(
        'lastEnrollmentUser',
        JSON.stringify({ name: name.trim(), email: email.trim() })
      );

      // cleanup
      sessionStorage.removeItem('pendingEnrollment');
      clearEnrollmentSnapshot();

      router.push('/enroll/success');
    } catch (e) {
      console.error(e);
      alert('Failed to save enrollment. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100">
      <h2 className="mb-2 text-lg font-medium">Review &amp; Confirm</h2>
      <p className="text-sm text-neutral-400">
        We’ll extract features and save your enrollment securely.
      </p>

      {/* Identity block (editable) */}
      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        {/* User ID (read-only) */}
        <div className="text-xs text-neutral-400">User ID</div>
        <div className="mb-3 text-sm text-neutral-300">
          {pending?.userId ?? <span className="text-neutral-500">—</span>}
        </div>

        {/* Name */}
        <label className="block text-xs text-neutral-400" htmlFor="name">
          Name <span className="text-rose-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm outline-none transition
            ${nameError ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/40' : 'border-neutral-700 focus:ring-2 focus:ring-emerald-500/30'}`}
          placeholder="Enter your full name"
        />
        {nameError && <p className="mt-1 text-xs text-rose-400">{nameError}</p>}

        {/* Email */}
        <label className="mt-4 block text-xs text-neutral-400" htmlFor="email">
          Email <span className="text-rose-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm outline-none transition
            ${emailError ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/40' : 'border-neutral-700 focus:ring-2 focus:ring-emerald-500/30'}`}
          placeholder="name@example.com"
        />
        {emailError && <p className="mt-1 text-xs text-rose-400">{emailError}</p>}

        {/* Snapshot preview */}
        {image && (
          <div className="mt-4">
            <img
              src={image}
              alt="Captured face"
              className="rounded-lg border border-neutral-800 max-h-56"
            />
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-6 w-full rounded-full h-3 overflow-hidden bg-neutral-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-neutral-500">{progress}% complete</p>

      {/* Actions */}
      <div className="mt-6 flex justify-end">
        <button
          disabled={!canFinish}
          onClick={handleFinish}
          className={`rounded-xl border px-4 py-2 text-sm transition-colors inline-flex items-center gap-2
            ${canFinish
              ? 'border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-500'
              : 'border-neutral-700 bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Saving…
            </>
          ) : (
            'Finish'
          )}
        </button>
      </div>
    </main>
  );
}
