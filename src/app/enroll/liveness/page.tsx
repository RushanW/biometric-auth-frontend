'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as faceapi from 'face-api.js';

import type { CameraFeedHandle } from '../../../components/camera/CameraFeed';
import { saveEnrollmentSnapshot, type EnrollmentSnapshot } from '../../../lib/enrollSession';

// camera
const CameraFeed = dynamic(
  () => import('../../../components/camera/CameraFeed').then((m) => m.CameraFeed),
  { ssr: false }
);

// ---- config ----
const MODEL_URL = '/models';
const DETECTOR_OPTS = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 });
const MIN_CONFIDENCE = 0.55;
const MIN_FACE_RATIO = 0.16;
const GOOD_HOLD_FRAMES = 10;

// ---- fake user (replace with NextAuth or your auth) ----
const userId = 'user-123';
const userName = 'Sumith';
const userEmail = 'sumith@example.com';
const consentVersion = 'v1';

// ---- helpers ----
function ear(eye: faceapi.Point[]) {
  if (eye.length < 6) return 0;
  const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
  const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
  const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
  return (A + B) / (2.0 * C);
}
function mar(mouth: faceapi.Point[]) {
  if (mouth.length < 20) return 0;
  const A = Math.hypot(mouth[13].x - mouth[19].x, mouth[13].y - mouth[19].y);
  const B = Math.hypot(mouth[14].x - mouth[18].x, mouth[14].y - mouth[18].y);
  const C = Math.hypot(mouth[12].x - mouth[16].x, mouth[12].y - mouth[16].y);
  return (A + B) / (2.0 * C);
}
function yawApprox(lm: faceapi.FaceLandmarks68) {
  const L = lm.getLeftEye(), R = lm.getRightEye(), N = lm.getNose();
  if (!L.length || !R.length || !N.length) return 0;
  const cx = (L.reduce((s, p) => s + p.x, 0) / L.length + R.reduce((s, p) => s + p.x, 0) / R.length) / 2;
  const nx = N[Math.floor(N.length / 2)].x;
  return (nx - cx) * 0.1;
}

// classic blue box + red score
function drawBox(canvas: HTMLCanvasElement, box: faceapi.Box, score?: number) {
  const ctx = canvas.getContext('2d')!;
  ctx.strokeStyle = '#00F';
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.fillStyle = '#F00';
  ctx.font = '14px Arial, sans-serif';
  const y = Math.max(0, box.y - 16);
  ctx.fillText((score ?? 0).toFixed(2), box.x + 2, y);
}

export default function LivenessPage() {
  const router = useRouter();

  const camRef = useRef<CameraFeedHandle>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const holdRef = useRef(0);
  const [stats, setStats] = useState({ faces: 0, fps: 0, conf: 0, size: '0×0' });

  const onCameraReady = useCallback((v: HTMLVideoElement) => {
    videoRef.current = v;
    setIsDetecting(true);
  }, []);

  // load models
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await tf.setBackend('webgl'); await tf.ready();
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL), // for descriptor
        ]);
        if (!cancelled) setModelsReady(true);
      } catch (e) {
        console.error('[face] init failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // detection loop
  useEffect(() => {
    if (!modelsReady) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      const v = videoRef.current, canvas = overlayRef.current;
      if (!v || !canvas || v.readyState < 2 || v.videoWidth === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // match canvas to video
      if (canvas.width !== v.videoWidth || canvas.height !== v.videoHeight) {
        canvas.width = v.videoWidth; canvas.height = v.videoHeight;
      }
      const t0 = performance.now();

      const dets = await faceapi
        .detectAllFaces(v, DETECTOR_OPTS)
        .withFaceLandmarks(true);

      const dt = performance.now() - t0;

      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.matchDimensions(canvas, { width: v.videoWidth, height: v.videoHeight });

      const resized = faceapi.resizeResults(dets, { width: v.videoWidth, height: v.videoHeight });

      resized.forEach(d => drawBox(canvas, d.detection.box, d.detection.score ?? 0));

      if (resized.length > 0) {
        const best = [...resized].sort((a, b) =>
          (b.detection.box.width * b.detection.box.height) - (a.detection.box.width * a.detection.box.height)
        )[0];

        const conf = Math.round((best.detection.score ?? 0) * 100) / 100;
        const bw = best.detection.box.width, bh = best.detection.box.height;

        setStats({
          faces: resized.length,
          fps: Math.max(1, Math.round(1000 / dt)),
          conf,
          size: `${Math.round(bw)}×${Math.round(bh)}`
        });

        const goodConf = conf >= MIN_CONFIDENCE;
        const goodSize = bw >= v.videoWidth * MIN_FACE_RATIO && bh >= v.videoHeight * MIN_FACE_RATIO;

        if (goodConf && goodSize) holdRef.current = Math.min(holdRef.current + 1, GOOD_HOLD_FRAMES);
        else holdRef.current = Math.max(0, holdRef.current - 1);

        setCanContinue(holdRef.current >= GOOD_HOLD_FRAMES);
      } else {
        setStats({ faces: 0, fps: Math.max(1, Math.round(1000 / dt)), conf: 0, size: '0×0' });
        holdRef.current = Math.max(0, holdRef.current - 1);
        setCanContinue(false);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (camRef.current) camRef.current.stop();
      setIsDetecting(false);
    };
  }, [modelsReady]);

  // compute descriptor + snapshot + features, then stash to session and go review
  async function handleContinue() {
    const v = videoRef.current;
    if (!v) return;

    // 1) compute descriptor
    const det = await faceapi
      .detectSingleFace(v, DETECTOR_OPTS)
      .withFaceLandmarks(true)
      .withFaceDescriptor();
    if (!det || !det.descriptor || !det.landmarks) {
      alert('Hold steady and try again. No face captured.');
      return;
    }

    // 2) features
    const lm = det.landmarks;
    const leftEAR = ear(lm.getLeftEye());
    const rightEAR = ear(lm.getRightEye());
    const mouthMAR = mar(lm.getMouth());
    const yaw = yawApprox(lm);

    // 3) snapshot image
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = v.videoWidth; snapCanvas.height = v.videoHeight;
    const sctx = snapCanvas.getContext('2d')!;
    // mirror matches preview (adjust if you don’t mirror your video)
    sctx.translate(snapCanvas.width, 0);
    sctx.scale(-1, 1);
    sctx.drawImage(v, 0, 0, snapCanvas.width, snapCanvas.height);
    const imageDataUrl = snapCanvas.toDataURL('image/png');

    // 4) save snapshot using your helper
    const snapshot: EnrollmentSnapshot = {
      imageDataUrl,
      features: { leftEAR, rightEAR, mouthMAR, yaw },
      deviceInfo: { userAgent: navigator.userAgent, platform: navigator.platform },
      consentVersion,
      capturedAt: Date.now(),
    };
    saveEnrollmentSnapshot(snapshot);

    // 5) stash pending enrollment user+descriptor
    const pending = {
      userId, name: userName, email: userEmail,
      descriptor: Array.from(det.descriptor),
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem('pendingEnrollment', JSON.stringify(pending));

    // 6) go review
    window.location.href = '/enroll/review';
  }

  const overlay = (
    <canvas
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );

  return (
    <main className="mx-auto max-w-4xl p-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="mb-2 text-lg font-medium">Face Detection</h2>
            <p className="text-sm text-neutral-400">Hold steady until the button unlocks. We’ll capture a snapshot + features.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isDetecting ? (stats.faces > 0 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-red-500'}`} />
            <span className="text-sm text-neutral-400">{isDetecting ? (stats.faces > 0 ? 'Face Detected' : 'Searching...') : 'Inactive'}</span>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg border border-neutral-800 bg-neutral-950">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="font-medium">Faces:</span> <span className="ml-2">{stats.faces}</span></div>
            <div><span className="font-medium">Confidence:</span> <span className="ml-2">{(stats.conf * 100).toFixed(1)}%</span></div>
            <div><span className="font-medium">Size:</span> <span className="ml-2">{stats.size}</span></div>
            <div><span className="font-medium">FPS:</span> <span className="ml-2">{stats.fps}</span></div>
          </div>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-black">
          <CameraFeed ref={camRef} onReady={onCameraReady} overlay={overlay} facingMode="user" mirror />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 m-2 rounded bg-black/70 px-3 py-2 text-sm text-white flex justify-between">
            <span>{stats.faces > 0 ? (canContinue ? 'Good! You can continue.' : 'Face detected. Hold steady…') : 'No face detected.'}</span>
            <span className="text-xs opacity-75">{stats.fps} fps</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
              canContinue
                ? 'border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-500'
                : 'border-neutral-700 bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Continue to Review
          </button>
          <button
            onClick={() => { holdRef.current = 0; setCanContinue(false); }}
            className="rounded-xl border border-blue-400/30 bg-blue-900/20 px-4 py-2 text-sm text-blue-200 hover:bg-blue-900/30"
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
