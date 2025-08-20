export type PromptType = 'blink' | 'turn_left' | 'turn_right' | 'mouth_open';

export function randomPrompts(n = 2): PromptType[] {
  const all: PromptType[] = ['blink', 'turn_left', 'turn_right', 'mouth_open'];
  const out: PromptType[] = [];
  while (out.length < n) {
    const p = all[Math.floor(Math.random() * all.length)];
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

/** Eye Aspect Ratio (lower = more closed). leftEye/rightEye are arrays of {x,y} with 6 points (68-landmarks). */
export function ear(eye: { x: number; y: number }[]) {
  // indices: [0..5] as per 68-point landmark eye
  const dist = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  const A = dist(eye[1], eye[5]);
  const B = dist(eye[2], eye[4]);
  const C = dist(eye[0], eye[3]);
  return (A + B) / (2.0 * C);
}

/** Mouth Aspect Ratio: inner mouth openness. innerMouth typically 8 points. */
export function mar(mouth: { x: number; y: number }[]) {
  const d = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  // Use vertical over horizontal
  const vertical = d(mouth[2], mouth[6]) + d(mouth[3], mouth[5]);
  const horizontal = d(mouth[0], mouth[4]);
  return vertical / (2.0 * horizontal);
}

/** Approximate yaw using nose vs eye-center horizontal offset normalized by face width */
export function approxYaw(
  leftEyeCenter: { x: number; y: number },
  rightEyeCenter: { x: number; y: number },
  nose: { x: number; y: number }
) {
  const midX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  const faceWidth = Math.hypot(rightEyeCenter.x - leftEyeCenter.x, rightEyeCenter.y - leftEyeCenter.y);
  const offset = (nose.x - midX) / (faceWidth || 1);
  return offset; // neg ≈ left turn, pos ≈ right turn
}

export type PromptStatus = {
  satisfied: boolean;
  hint: string;
};

export function evaluatePrompt(
  type: PromptType,
  features: {
    leftEAR?: number;
    rightEAR?: number;
    mouthMAR?: number;
    yaw?: number;
    blinkHistory?: number[]; // last N EAR values to detect dips
  }
): PromptStatus {
  const BLINK_THRESHOLD = 0.21;     // tweak per camera
  const MOUTH_THRESHOLD = 0.6;      // higher = more open
  const YAW_THRESHOLD = 0.10;       // ~10% of eye distance

  if (type === 'blink') {
    const series = features.blinkHistory ?? [];
    // detect a valley (ear dips below threshold then rebounds)
    let dipped = false;
    for (const v of series) {
      if (v < BLINK_THRESHOLD) dipped = true;
      if (dipped && v >= BLINK_THRESHOLD) {
        return { satisfied: true, hint: 'Blink detected' };
      }
    }
    return { satisfied: false, hint: 'Blink twice' };
  }

  if (type === 'mouth_open') {
    const ok = (features.mouthMAR ?? 0) > MOUTH_THRESHOLD;
    return { satisfied: !!ok, hint: ok ? 'Mouth open' : 'Open your mouth' };
  }

  if (type === 'turn_left') {
    const ok = (features.yaw ?? 0) < -YAW_THRESHOLD;
    return { satisfied: !!ok, hint: ok ? 'Looking left' : 'Turn your head left' };
  }

  if (type === 'turn_right') {
    const ok = (features.yaw ?? 0) > YAW_THRESHOLD;
    return { satisfied: !!ok, hint: ok ? 'Looking right' : 'Turn your head right' };
  }

  return { satisfied: false, hint: '' };
}
