// src/lib/vision.ts
import type * as faceapiType from 'face-api.js';
import { ensureModelsLoaded } from './face';

export type VisionSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

export type LocateFacesOptions = {
  /** Try Tiny-Face at these input sizes, in order */
  tinyInputSizes?: number[];
  /** Tiny score thresholds to pair with input sizes (same length or single value reused) */
  tinyScoreThresholds?: number[];
  /** Use SSD Mobilenet as a fallback if Tiny fails for this frame */
  useSSD?: boolean;
  /** Try simple brightness/contrast variants */
  preprocessModes?: Array<'normal' | 'bright' | 'dark'>;
  /** Max faces to return (1 uses detectSingleFace for speed) */
  maxFaces?: number;
  /** Offscreen canvas to reuse for preprocessing (perf). If not provided, one is created internally. */
  processorCanvas?: HTMLCanvasElement | null;
  /** Base path for models (keep default if you placed them in /public/models) */
  modelBasePath?: string;
};

export type FaceWithLandmarks = faceapiType.WithFaceLandmarks<{ detection: faceapiType.FaceDetection }>;

export async function locateFaces(
  source: VisionSource,
  opts: LocateFacesOptions = {}
): Promise<FaceWithLandmarks[]> {
  const faceapi = (await ensureModelsLoaded(opts.modelBasePath ?? '/models')) as typeof faceapiType;

  const tinyInputSizes = opts.tinyInputSizes ?? [320, 416, 512];
  const tinyScoreThresholds = normalizeThresholds(opts.tinyScoreThresholds ?? [0.18, 0.16, 0.15], tinyInputSizes.length);
  const preprocess = opts.preprocessModes ?? ['normal', 'bright', 'dark'];
  const maxFaces = Math.max(1, opts.maxFaces ?? 1);
  const useSSD = opts.useSSD ?? true;

  // Prepare a processor canvas (we draw the source into it with optional filters)
  const proc = opts.processorCanvas ?? document.createElement('canvas');
  sizeCanvasToSource(proc, source);

  const pctx = proc.getContext('2d', { willReadFrequently: true })!;
  const drawProc = (mode: 'normal' | 'bright' | 'dark') => {
    pctx.save();
    if (mode === 'bright') pctx.filter = 'brightness(1.25) contrast(1.2)';
    else if (mode === 'dark') pctx.filter = 'brightness(0.9) contrast(1.1)';
    else pctx.filter = 'none';
    pctx.drawImage(source, 0, 0, proc.width, proc.height);
    pctx.restore();
  };

  // Build attempts: Tiny at various sizes + exposure variants
  const attempts: Array<() => Promise<FaceWithLandmarks[]>> = [];
  for (let i = 0; i < tinyInputSizes.length; i++) {
    const cfg = new faceapi.TinyFaceDetectorOptions({ inputSize: tinyInputSizes[i], scoreThreshold: tinyScoreThresholds[i] });
    for (const mode of preprocess) {
      attempts.push(async () => {
        drawProc(mode);
        return maxFaces === 1
          ? (await faceapi.detectSingleFace(proc, cfg).withFaceLandmarks()).then(wrapSingle)
          : (await faceapi.detectAllFaces(proc, cfg).withFaceLandmarks()) as unknown as FaceWithLandmarks[];
      });
    }
  }

  // SSD fallback (more robust, heavier)
  if (useSSD && faceapi.nets.ssdMobilenetv1.isLoaded) {
    for (const mode of ['bright', 'normal'] as const) {
      attempts.push(async () => {
        drawProc(mode);
        return maxFaces === 1
          ? (await faceapi.detectSingleFace(proc).withFaceLandmarks()).then(wrapSingle)
          : (await faceapi.detectAllFaces(proc).withFaceLandmarks()) as unknown as FaceWithLandmarks[];
      });
    }
  }

  // Run attempts in sequence until we get a result
  for (const tryDetect of attempts) {
    const dets = await tryDetect();
    if (dets.length > 0) return dets;
  }

  return [];
}

/** Draw boxes + (optionally) 68 landmarks + a tiny confidence tag */
export function drawDetections(
  canvas: HTMLCanvasElement,
  dets: FaceWithLandmarks[],
  opts: { showLandmarks?: boolean } = {}
) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(59,130,246,0.95)'; // tailwind blue-500-ish
  ctx.fillStyle = '#cbd5e1'; // slate-300
  ctx.lineWidth = 2;
  ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';

  for (const d of dets) {
    const { x, y, width, height } = d.detection.box;
    const score = d.detection.score ?? 0;
    ctx.strokeRect(x, y, width, height);
    // score tag
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, Math.max(0, y - 18), 72, 18);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`conf ${score.toFixed(2)}`, x + 6, Math.max(12, y - 5));

    if (opts.showLandmarks) {
      ctx.fillStyle = 'rgba(59,130,246,0.9)';
      // @ts-ignore positions is public on face-api.js landmarks
      for (const p of d.landmarks.positions as { x: number; y: number }[]) {
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
    }
  }
}

/* ----------------- helpers ----------------- */
function wrapSingle<T extends FaceWithLandmarks | undefined>(v: T): FaceWithLandmarks[] {
  return v ? [v] : [];
}

function sizeCanvasToSource(canvas: HTMLCanvasElement, src: VisionSource) {
  const w = (src as HTMLVideoElement).videoWidth ?? (src as HTMLImageElement).naturalWidth ?? (src as HTMLCanvasElement).width;
  const h = (src as HTMLVideoElement).videoHeight ?? (src as HTMLImageElement).naturalHeight ?? (src as HTMLCanvasElement).height;
  if (!w || !h) return;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function normalizeThresholds(vals: number[], len: number) {
  if (vals.length === len) return vals;
  if (vals.length === 1) return Array(len).fill(vals[0]);
  const out = [...vals];
  while (out.length < len) out.push(out[out.length - 1]);
  return out.slice(0, len);
}
