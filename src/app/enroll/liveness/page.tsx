// src/app/enroll/liveness/page.tsx
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
import type { LocateFacesOptions } from '../../../lib/vision';

const CameraFeed = dynamic(() => import('../../../components/camera/CameraFeed'), { ssr: false });

/* ----------------- presets & tuner ----------------- */

// Make arrays mutable (number[]), not readonly tuples.
type PresetShape = {
  tinyInputSizes: number[];
  tinyScoreThresholds: number[];
  preprocessModes: ('normal' | 'bright' | 'dark')[];
  useSSD: boolean;
};
const DETECT_PRESETS: Record<'fast' | 'balanced' | 'robust', PresetShape> = {
  fast: {
    tinyInputSizes: [320],
    tinyScoreThresholds: [0.20],
    preprocessModes: ['normal'],
    useSSD: false,
  },
  balanced: {
    tinyInputSizes: [416, 512],
    tinyScoreThresholds: [0.18, 0.16],
    preprocessModes: ['bright', 'normal', 'dark'],
    useSSD: true,
  },
  robust: {
    tinyInputSizes: [512, 416],
    tinyScoreThresholds: [0.14, 0.16],
    preprocessModes: ['bright', 'normal', 'dark'],
    useSSD: true,
  },
};

type PresetKey = keyof typeof DETECT_PRESETS | 'custom';

function Tuner({
  preset, setPreset,
  tinySize, setTinySize,
  threshold, setThreshold,
  useSSD, setUseSSD,
  minScore, setMinScore,
  minBoxFrac, setMinBoxFrac,
}: {
  preset: PresetKey; setPreset: (p: PresetKey) => void;
  tinySize: number; setTinySize: (v: number) => void;
  threshold: number; setThreshold: (v: number) => void;
  useSSD: boolean; setUseSSD: (v: boolean) => void;
  minScore: number; setMinScore: (v: number) => void;
  minBoxFrac: number; setMinBoxFrac: (v: number) => void;
}) {
  return (
    <div className="fixed right-2 top-2 z-50 w-64 rounded-lg border border-neutral-700 bg-neutral-900/90 p-3 text-xs text-neutral-200 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">Detector Tuner</div>
        <select
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs"
          value={preset}
          onChange={(e) => setPreset(e.target.value as PresetKey)}
        >
          <option value="fast">fast</option>
          <option value="balanced">balanced</option>
          <option value="robust">robust</option>
          <option value="custom">custom</option>
        </select>
      </div>

      <div className={`${preset === 'custom' ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
        <label className="block mb-1">inputSize: {tinySize}</label>
        <input
          type="range" min={256} max={640} step={32}
          value={tinySize}
          onChange={(e) => { setPreset('custom'); setTinySize(parseInt(e.target.value, 10)); }}
          className="w-full"
        />

        <label className="block mt-2 mb-1">threshold: {threshold.toFixed(2)}</label>
        <input
          type="range" min={0.08} max={0.30} step={0.01}
          value={threshold}
          onChange={(e) => { setPreset('custom'); setThreshold(parseFloat(e.target.value)); }}
          className="w-full"
        />

        <label className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={useSSD}
            onChange={(e) => { setPreset('custom'); setUseSSD(e.target.checked); }}
          />
          SSD fallback
        </label>
      </div>

      <div className="mt-3 border-t border-neutral-800 pt-2">
        <label className="block mb-1">min score: {minScore.toFixed(2)}</label>
        <input
          type="range" min={0.40} max={0.80} step={0.01}
          value={minScore}
          onChange={(e) => setMinScore(parseFloat(e.target.value))}
          className="w-full"
        />
        <label className="block mt-2 mb-1">
          min box frac: {(minBoxFrac * 100).toFixed(0)}%
        </label>
        <input
          type="range" min={0.05} max={0.40} step={0.01}
          value={minBoxFrac}
          onChange={(e) => setMinBoxFrac(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

/* ----------------- page ----------------- */

export default function EnrollLivenessPage() {
  const camRef = useRef<CameraFeedHandle | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const procRef = useRef<HTMLCanvasElement | null>(null);

  const [prompts, setPrompts] = useState<PromptType[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentHint, setCurrentHint] = useState<string>('Hold still…');
  const [allDone, setAllDone] = useState(false);

  const blinkHistoryRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);

  // Tuner state
  const [preset, setPreset] = useState<PresetKey>('robust');
  const [tinySize, setTinySize] = useState(512);
  const [threshold, setThreshold] = useState(0.14);
  const [useSSD, setUseSSD] = useState(true);
  const [minScore, setMinScore] = useState(0.55);
  const [minBoxFrac, setMinBoxFrac] = useState(0.15);

  const onCameraReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
  }, []);

  useEffect(() => {
    setPrompts(randomPrompts(2));
  }, []);

  useEffect(() => {
    if (preset === 'custom') return;
    const p = DETECT_PRESETS[preset];
    setTinySize(p.tinyInputSizes[0]);
    setThreshold(p.tinyScoreThresholds[0]);
    setUseSSD(p.useSSD);
  }, [preset]);

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

        sizeCanvasToVideo(overlay, v);

        try {
          // Build locateFaces options; explicitly type to avoid inference quirks
          const opts: LocateFacesOptions =
            preset === 'custom'
              ? {
                  tinyInputSizes: [tinySize],
                  tinyScoreThresholds: [threshold],
                  preprocessModes: ['bright', 'normal', 'dark'],
                  useSSD,
                }
              : {
                  // spread preset but ensure arrays are mutable (they already are)
                  ...DETECT_PRESETS[preset],
                };

          const dets = await locateFaces(v, {
            maxFaces: 1,
            processorCanvas: procRef.current!,
            ...opts,
          });

          if (dets.length === 0) {
            const ctx = overlay.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);
            setCurrentHint('No face detected. Move closer & face the camera.');
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          drawDetections(overlay, dets, { showLandmarks: true });

          // Gate by confidence & size
          const det: any = dets[0];
          const score = det.detection.score ?? 0;
          const box = det.detection.box;
          const okScore = score >= minScore;
          const okSize =
            box.width >= v.videoWidth * minBoxFrac &&
            box.height >= v.videoHeight * minBoxFrac;

          if (!okSize) {
            setCurrentHint('Move closer to fill more of the frame.');
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (!okScore) {
            setCurrentHint('Hold steady for a second…');
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          // ===== liveness metrics =====
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
              ctx.fillRect(8, overlay.height - 48, 290, 40);
              ctx.fillStyle = '#e5e7eb';
              ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
              ctx.fillText(
                `score ${score.toFixed(2)} · EAR ${meanEAR.toFixed(2)} · MAR ${mouthMAR.toFixed(
                  2
                )} · YAW ${yaw.toFixed(2)}`,
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
  }, [prompts, currentIdx, preset, tinySize, threshold, useSSD, minScore, minBoxFrac]);

  const onPresetClick = (key: PresetKey) => setPreset(key);

  const chips: (PromptType | null)[] = prompts.length ? prompts : [null, null];

  return (
    <main className="grid gap-4">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:p-6">
        <h2 className="mb-2 text-lg font-medium">Liveness Check</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Complete the prompts below, then we’ll proceed.
        </p>

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

        <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
          <span className="opacity-70">Preset:</span>
          <button onClick={() => onPresetClick('fast')}
                  className={`rounded border px-2 py-1 ${preset==='fast' ? 'border-blue-500/40 bg-blue-500/10' : 'border-neutral-700 hover:border-neutral-600'}`}>
            fast
          </button>
          <button onClick={() => onPresetClick('balanced')}
                  className={`rounded border px-2 py-1 ${preset==='balanced' ? 'border-blue-500/40 bg-blue-500/10' : 'border-neutral-700 hover:border-neutral-600'}`}>
            balanced
          </button>
          <button onClick={() => onPresetClick('robust')}
                  className={`rounded border px-2 py-1 ${preset==='robust' ? 'border-blue-500/40 bg-blue-500/10' : 'border-neutral-700 hover:border-neutral-600'}`}>
            robust
          </button>
          <button onClick={() => onPresetClick('custom')}
                  className={`rounded border px-2 py-1 ${preset==='custom' ? 'border-blue-500/40 bg-blue-500/10' : 'border-neutral-700 hover:border-neutral-600'}`}>
            custom
          </button>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-black">
          <CameraFeed ref={camRef} onReady={onCameraReady} />
          <canvas ref={overlayRef} className="pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 m-2 rounded bg-black/40 px-3 py-2 text-xs text-neutral-200">
            {prompts.length === 0
              ? 'Preparing prompts…'
              : allDone
              ? 'All prompts satisfied'
              : currentHint}
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
          <a
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-600"
            href="/enroll/guide"
          >
            Back
          </a>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Tip: Good lighting helps. If you wear glasses, tilt your screen to reduce glare.
        </p>
      </section>

      {/* Live tuner (remove in prod if you want) */}
      <Tuner
        preset={preset} setPreset={setPreset}
        tinySize={tinySize} setTinySize={setTinySize}
        threshold={threshold} setThreshold={setThreshold}
        useSSD={useSSD} setUseSSD={setUseSSD}
        minScore={minScore} setMinScore={setMinScore}
        minBoxFrac={minBoxFrac} setMinBoxFrac={setMinBoxFrac}
      />
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function labelForPrompt(p: PromptType) {
  switch (p) {
    case 'blink': return 'Blink';
    case 'turn_left': return 'Turn Left';
    case 'turn_right': return 'Turn Right';
    case 'mouth_open': return 'Open Mouth';
  }
}
