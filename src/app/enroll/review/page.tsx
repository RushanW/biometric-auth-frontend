'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadEnrollmentSnapshot, clearEnrollmentSnapshot } from '../../../lib/enrollSession';

type Pending = {
  userId: string;
  name: string;
  email: string;
  descriptor: number[];
  createdAt: string;
};

export default function ReviewPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Pending | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // load snapshot + pending from session
  useEffect(() => {
    const pRaw = sessionStorage.getItem('pendingEnrollment');
    if (pRaw) setPending(JSON.parse(pRaw));
    const snap = loadEnrollmentSnapshot();
    if (snap?.imageDataUrl) setImage(snap.imageDataUrl);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 5)), 120);
    return () => clearInterval(t);
  }, []);

  async function handleFinish() {
    if (!pending) return;
    const snapshot = loadEnrollmentSnapshot();

    setSubmitting(true);
    try {
      const res = await fetch('/api/biometrics/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pending,
          snapshot, // optional but nice to keep with the record
        }),
      });
      if (!res.ok) throw new Error(`Enroll failed: ${res.status}`);

      // for success page
      sessionStorage.setItem('lastEnrollmentUser', JSON.stringify({ name: pending.name, email: pending.email }));

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
      <h2 className="mb-2 text-lg font-medium">Review & Confirm</h2>
      <p className="text-sm text-neutral-400">
        We’ll extract features and save your enrollment securely.
      </p>

      {pending && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-sm text-neutral-300">
            <div><span className="text-neutral-400">Name:</span> {pending.name}</div>
            <div><span className="text-neutral-400">Email:</span> {pending.email}</div>
            <div><span className="text-neutral-400">User ID:</span> {pending.userId}</div>
          </div>
          {image && (
            <div className="mt-4">
              <img src={image} alt="Captured face" className="rounded-lg border border-neutral-800 max-h-56" />
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="mt-6 w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-neutral-500">{progress}% complete</p>

      <div className="mt-6 flex justify-end">
        <button
          disabled={progress < 100 || submitting || !pending}
          onClick={handleFinish}
          className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
            progress >= 100 && !submitting && pending
              ? 'border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-500'
              : 'border-neutral-700 bg-neutral-800 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Saving…' : 'Finish'}
        </button>
      </div>
    </main>
  );
}
