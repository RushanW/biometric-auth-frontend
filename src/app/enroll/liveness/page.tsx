'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraFeedHandle } from '../../../components/camera/CameraFeed';
import {
  randomPrompts,
  evaluatePrompt,
  ear,
  mar,
  approxYaw,
  type PromptType,
} from '../../../lib/liveness';
import { locateFaces, drawDetections } from '../../../lib/vision';

const CameraFeed = dynamic(() => import('../../../components/camera/CameraFeed'), { ssr: false });

export default function EnrollLivenessPage() {
  const camRef = useRef<CameraFeedHandle | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null); // draw boxes/landmarks here
  const procRef = useRef<HTMLCanvasElement | null>(null);    // offscreen preprocessing

  // Always-array to avoid null/undefined TS noise
  const [prompts, setPrompts] = useState<PromptType[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentHint, setCurrentHint] = useState<string>('Hold still…');
  const [allDone, setAllDone] = useState(false);

  const blinkHistoryRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);

  const onCameraReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
  }, []);

  // Client-only randomization prevents SSR hydration mismatch
  useEffect(() => {
    setPrompts(randomPrompts(2));
  }, []);

  useEffect(() => {
    if (prompts.length === 0) return;
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

        // Keep overlay in sync with actual video pixels
        sizeCanvasToVideo(overlay, v);

        try {
          // Detect (Tiny multi-try + exposure tweaks + SSD fallback)
          const dets = await locateFaces(v, {
            maxFaces: 1,
            useSSD: true,
            tinyInputSizes: [320, 416, 512],
            tinyScoreThresholds: [0.18, 0.16, 0.15],
            preprocessModes: ['normal', 'bright', 'dark'],
            processorCanvas: procRef.current!,
          });

          if (dets.length === 0) {
            const ctx = overlay.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);
            setCurrentHint('No face detected. Move closer & face the camera.');
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          // Draw detection overlays
          drawDetections(overlay, dets, { showLandmarks: true });

          // Liveness metrics from first face
          const det: any = dets[0];
          const lm = det.landmarks;
          const leftEye = lm.getLeftEye() as any[];
          const rightEye = lm.getRightEye() as any[];
          const mouth = lm.getMouth() as any[];
          const nose = lm.getNose() as any[];

          const leftEAR = ear(leftEye);
          const rightEAR = ear(rightEye);
          const meanEAR = (leftEAR + rightEAR) / 2;

          const hist = blinkHistoryRef.current;
          hist.push(meanEAR);
          if (hist.length > 30) hist.shift();

          const inner8 = mouth.slice(3, 11);
          const mouthMAR = mar(inner8);

          const leftCenter = centerOf(leftEye);
          const rightCenter = centerOf(rightEye);
          const noseTip = nose[3] ?? centerOf(nose);
          const yaw = approxYaw(leftCenter, rightCenter, noseTip);

          const current = prompts[currentIdx];
          if (current !== undefined) {
            const res = evaluatePrompt(current, {
              leftEAR,
              rightEAR,
              mouthMAR,
              yaw,
              blinkHistory: hist,
            });
            setCurrentHint(res.hint);

            // HUD
            const ctx = overlay.getContext('2d');
            if (ctx) {
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.fillRect(8, overlay.height - 48, 260, 40);
              ctx.fillStyle = '#e5e7eb';
              ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
              ctx.fillText(
                `EAR ${meanEAR.toFixed(2)} · MAR ${mouthMAR.toFixed(2)} · YAW ${yaw.toFixed(2)}`,
                14,
                overlay.height - 24
              );
            }

            if (res.satisfied) {
              setCurrentIdx((idx) => {
                const next = idx + 1;
                if (next >= prompts.length) setAllDone(true);
                return Math.min(next, prompts.length - 1);
              });
              blinkHistoryRef.current = [];
              await sleep(350);
            }
          }
        } catch {
          // ignore per-frame errors
        }

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
  }, [prompts, currentIdx]);

  // UI
  const chips: (PromptType | null)[] = prompts.length ? prompts : [null, null];

  return (
    <main className="grid gap-4">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:p-6">
        <h2 className="mb-2 text-lg font-medium">Liveness Check</h2>
        <p className="mb-4 text-sm text-neutral-400">Complete the prompts below, then we’ll proceed.</p>

        <div className="mb-4 flex gap-2">
          {chips.map((p, i) => (
            <span
              key={i}
              className={`rounded-full px-3 py-1 text-xs ${
                prompts.length
                  ? i < currentIdx
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                    : i === currentIdx
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
              }`}
            >
              {p ? labelForPrompt(p) : '…'}
            </span>
          ))}
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-black">
          <CameraFeed ref={camRef} onReady={onCameraReady} />
          <canvas ref={overlayRef} className="pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 m-2 rounded bg-black/40 px-3 py-2 text-xs text-neutral-200">
            {prompts.length === 0 ? 'Preparing prompts…' : allDone ? 'All prompts satisfied' : currentHint}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <a
            href={allDone ? '/enroll/review' : '#'}
            aria-disabled={!allDone}
            className={`rounded-xl border px-4 py-2 text-sm ${
              allDone
                ? 'border-emerald-500/30 bg-emerald-600/15 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-600/25'
                : 'border-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Continue
          </a>
          <a className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-600" href="/enroll/guide">
            Back
          </a>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Tip: Good lighting helps. If you wear glasses, tilt your screen to reduce glare.
        </p>
      </section>
    </main>
  );
}

/* ----------------- helpers ----------------- */
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
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function labelForPrompt(p: PromptType) {
  switch (p) {
    case 'blink': return 'Blink';
    case 'turn_left': return 'Turn Left';
    case 'turn_right': return 'Turn Right';
    case 'mouth_open': return 'Open Mouth';
  }
}
