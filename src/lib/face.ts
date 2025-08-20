// src/lib/face.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-wasm';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Ensures tf backend is ready and face-api models are loaded exactly once.
 * Returns the face-api module.
 */
export async function ensureModelsLoaded(basePath = '/models') {
  // Don’t do heavy work during SSR
  if (typeof window === 'undefined') {
    return await import('face-api.js');
  }

  // Deduplicate concurrent callers
  if (!loadingPromise) {
    loadingPromise = (async () => {
      // 1) Pick best available backend
      try {
        await tf.setBackend('webgl');
      } catch { /* ignore */ }

      if (tf.getBackend() !== 'webgl') {
        // Optional: serve WASM binaries from /public/wasm (or let TFJS use its default CDN)
        // put tfjs-backend-wasm.wasm / -simd.wasm / -threaded-simd.wasm in public/wasm if you set this
        // setWasmPaths('/wasm/');
        await tf.setBackend('wasm');
      }
      await tf.ready();

      // 2) Load face-api once
      const faceapi = await import('face-api.js');
      if (!modelsLoaded) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
          faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
          faceapi.nets.ssdMobilenetv1.loadFromUri(basePath), // fallback
          // faceapi.nets.faceRecognitionNet.loadFromUri(basePath), // not needed for liveness
        ]);
        modelsLoaded = true;
      }

      // (Debug) check in the console:
      // console.log('TF backend:', tf.getBackend(), 'TFJS:', tf.version_core);
    })();
  }

  await loadingPromise;
  return await import('face-api.js');
}
