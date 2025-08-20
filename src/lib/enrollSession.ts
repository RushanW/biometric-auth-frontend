// src/lib/enrollSession.ts
export type EnrollmentFeatures = {
  leftEAR: number;
  rightEAR: number;
  mouthMAR: number;
  yaw: number;
};

export type EnrollmentSnapshot = {
  imageDataUrl: string;     // data:image/png;base64,...
  features: EnrollmentFeatures;
  deviceInfo: {
    userAgent: string;
    platform?: string;
  };
  consentVersion: string;
  capturedAt: number;       // Date.now()
};

const KEY = 'enroll:snapshot';

export function saveEnrollmentSnapshot(s: EnrollmentSnapshot) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function loadEnrollmentSnapshot(): EnrollmentSnapshot | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as EnrollmentSnapshot; } catch { return null; }
}

export function clearEnrollmentSnapshot() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}
