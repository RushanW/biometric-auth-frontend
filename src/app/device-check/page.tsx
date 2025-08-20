'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type PermissionStateLike = 'granted' | 'denied' | 'prompt' | 'unknown';

export default function DeviceCheckPage() {
  const [perm, setPerm] = useState<PermissionStateLike>('unknown');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [previewOk, setPreviewOk] = useState<boolean | null>(null);

  // Check permissions + device list
  useEffect(() => {
    (async () => {
      try {
        // permissions API (best-effort)
        // @ts-ignore
        const status = await navigator.permissions?.query?.({ name: 'camera' as any });
        if (status) {
          setPerm(status.state as PermissionStateLike);
          status.onchange = () => setPerm((status.state as PermissionStateLike) ?? 'unknown');
        }
      } catch { /* ignore */ }

      try {
        const devices = await navigator.mediaDevices?.enumerateDevices?.();
        setHasCamera(devices?.some(d => d.kind === 'videoinput') ?? null);
      } catch {
        setHasCamera(null);
      }
    })();
  }, []);

  // Gate to continue
  useEffect(() => {
    const ok = (perm === 'granted' || perm === 'prompt') && hasCamera === true && previewOk === true;
    setReady(!!ok);
  }, [perm, hasCamera, previewOk]);

  async function requestPermissionAndPreview() {
    setProbeError(null);
    setPreviewOk(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      });
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play();
      }
      setPreviewOk(true);
    } catch (err: any) {
      setProbeError(err?.message ?? 'Camera error');
      setPreviewOk(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 md:p-7">
        <h1 className="text-xl font-semibold">Device & Environment Check</h1>
        <p className="mt-2 text-sm text-neutral-400">
          We’ll quickly confirm your camera works and show you a preview.
        </p>

        <div className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3">
            <span>Camera permission</span>
            <span className="text-neutral-300">
              {perm === 'unknown' ? '—' : perm}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3">
            <span>Camera device</span>
            <span className="text-neutral-300">
              {hasCamera === null ? 'Checking…' : hasCamera ? 'Detected' : 'Not found'}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-black">
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
            {probeError && (
              <div className="absolute inset-x-0 bottom-0 m-2 rounded bg-red-500/20 p-2 text-xs text-red-300">
                {probeError}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={requestPermissionAndPreview}
              className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
            >
              {previewOk ? 'Refresh Preview' : 'Allow & Preview'}
            </button>

            <Link
              href={ready ? '/enroll/guide' : '#'}
              aria-disabled={!ready}
              className={`rounded-xl border px-4 py-2 text-sm ${
                ready
                  ? 'border-emerald-500/30 bg-emerald-600/15 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-600/25'
                  : 'border-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              Continue
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-600"
            >
              Back
            </Link>
          </div>

          <p className="mt-3 text-xs text-neutral-500">
            Tip: use a well-lit area with no strong backlight. If your camera is blocked, try{' '}
            <Link href="/recovery" className="underline underline-offset-4">recovery</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
