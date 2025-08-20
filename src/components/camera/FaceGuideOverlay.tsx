'use client';
export function FaceGuideOverlay() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 56" preserveAspectRatio="none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="100" height="56" fill="none" stroke="rgba(255,255,255,0.08)" />
      <ellipse cx="50" cy="28" rx="18" ry="24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.6" filter="url(#glow)" />
      <line x1="50" y1="0" x2="50" y2="56" stroke="rgba(255,255,255,0.12)" strokeWidth="0.2" />
      <line x1="0" y1="28" x2="100" y2="28" stroke="rgba(255,255,255,0.12)" strokeWidth="0.2" />
    </svg>
  );
}
