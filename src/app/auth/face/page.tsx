// src/app/auth/face/page.tsx
'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraFeedHandle } from '../../../components/camera/CameraFeed';
import { locateFaces, drawDetections } from '../../../lib/vision';
import { ear, mar, approxYaw } from '../../../lib/liveness';
import Link from 'next/link';

const CameraFeed = dynamic(() => import('../../../components/camera/CameraFeed'), { ssr: false });

export default function FaceSignInPage() {
  const camRef = useRef<CameraFeedHandle | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const procRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hint, setHint] = useState('Center your face. Blink once.');
  const [busy, setBusy] = useState(false);

  const onReady = useCallback((v: HTMLVideoElement) => { videoRef.current = v; }, []);

  useEffect(() => {
    let cancelled = false;
    async function loop() {
      if (!procRef.current) procRef.current = document.createElement('canvas');

      const tick = async () => {
        if (cancelled) return;
        const v = videoRef.current;
        const overlay = overlayRef.current;
        if (!v || v.readyState < 2 || !overlay) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        sizeCanvasToVideo(overlay, v);

        try {
          const dets = await locateFaces(v, {
            maxFaces: 1,
            processorCanvas: procRef.current!,
            tinyInputSizes: [416, 512],
            tinyScoreThresholds: [0.18, 0.16],
            preprocessModes: ['bright', 'normal', 'dark'],
            useSSD: true,
          });

          if (dets.length === 0) {
            const ctx = overlay.getContext('2d'); ctx?.clearRect(0, 0, overlay.width, overlay.height);
            setHint('No face detected. Move closer.');
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          drawDetections(overlay, dets, { showLandmarks: true });
          const det: any = dets[0];
          const lm = det.landmarks;
          const left = lm.getLeftEye() as any[]; const right = lm.getRightEye() as any[];
          const mouth = lm.getMouth() as any[]; const nose = lm.getNose() as any[];
          const leftEAR = ear(left), rightEAR = ear(right);
          const inner8 = mouth.slice(3, 11); const mouthMAR = mar(inner8);
          const lC = centerOf(left), rC = centerOf(right);
          const yaw = approxYaw(lC, rC, nose[3] ?? centerOf(nose));

          // quick liveness heuristic: either blink (EAR drop) or slight yaw / mouth open
          const avgEAR = (leftEAR + rightEAR) / 2;
          const liveOK = avgEAR < 0.20 || Math.abs(yaw) > 0.12 || mouthMAR > 0.55;
          setHint(liveOK ? 'Verified. Signing in…' : 'Blink or turn slightly.');

          if (liveOK && !busy) {
            setBusy(true);
            try {
              const res = await fetch('/api/biometric/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ live: true }),
              });
              if (!res.ok) throw new Error('auth failed');
              window.location.href = '/dashboard';
            } catch {
              setHint('Face auth failed. Try again.');
              setBusy(false);
            }
          }
        } catch { /* ignore frame errors */ }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }

    loop();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      camRef.current?.stop();
    };
  }, [busy]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Face Sign-in</h1>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-black">
        <CameraFeed ref={camRef} onReady={onReady} />
        <canvas ref={overlayRef} className="pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 m-2 rounded bg-black/40 px-3 py-2 text-xs text-neutral-200">
          {hint}
        </div>
      </div>

      <div className="mt-4 text-xs text-neutral-500">Lighting helps. Avoid glare on your lenses.</div>
      <div className="mt-4 flex gap-2">
        <Link href="/" className="rounded-xl border border-neutral-800 px-4 py-2 text-neutral-400 hover:border-neutral-600">
          Other methods
        </Link>
      </div>
    </main>
  );
}

function sizeCanvasToVideo(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  if (!video.videoWidth || !video.videoHeight) return;
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
}
function centerOf(pts: { x: number; y: number }[]) {
  const n = pts.length || 1;
  return { x: pts.reduce((s, p) => s + p.x, 0) / n, y: pts.reduce((s, p) => s + p.y, 0) / n };
}
