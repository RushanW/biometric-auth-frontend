// src/lib/face.ts
import * as tf from '@tensorflow/tfjs';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function ensureModelsLoaded(basePath = '/models') {
  const faceapi = await import('face-api.js');

  // Avoid heavy work during SSR
  if (typeof window === 'undefined') return faceapi;

  if (!loadingPromise) {
    loadingPromise = (async () => {
      // Load the WebGL backend on the client only
      await import('@tensorflow/tfjs-backend-webgl');
      try { await tf.setBackend('webgl'); } catch {}
      await tf.ready();

      if (!modelsLoaded) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
          faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
          faceapi.nets.ssdMobilenetv1.loadFromUri(basePath),
        ]);
        modelsLoaded = true;
      }

      // expose tf in DevTools for sanity checks
      (window as any).tf = tf;
    })();
  }

  await loadingPromise;
  return faceapi;
}
