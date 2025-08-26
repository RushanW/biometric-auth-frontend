"use client";
import { useEffect, useState } from "react";

export function FaceGuideOverlay() {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg
        className="h-full w-full"
        viewBox="0 0 100 56"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="1"
              floodColor="rgba(0,0,0,0.3)"
            />
          </filter>
        </defs>

        {/* Darkened background with subtle frame */}
        <rect x="0" y="0" width="100" height="56" fill="rgba(0, 0, 0, 0.3)" />

        {/* Main face guide ellipse with enhanced styling */}
        <ellipse
          cx="50"
          cy="28"
          rx="18"
          ry="24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="0.8"
          filter="url(#glow)"
          className={pulseAnimation ? "animate-pulse" : ""}
          strokeDasharray="4 2"
        />

        {/* Corner guides for better positioning */}
        <g stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.4" fill="none">
          {/* Top left */}
          <path d="M32 4 L36 4 L36 8" />
          {/* Top right */}
          <path d="M68 4 L64 4 L64 8" />
          {/* Bottom left */}
          <path d="M32 52 L36 52 L36 48" />
          {/* Bottom right */}
          <path d="M68 52 L64 52 L64 48" />
        </g>

        {/* Center crosshairs */}
        <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.2">
          <line x1="50" y1="20" x2="50" y2="36" />
          <line x1="42" y1="28" x2="58" y2="28" />
        </g>

        {/* Additional guide text */}
        <text
          x="50"
          y="8"
          textAnchor="middle"
          fontSize="3"
          fill="rgba(255,255,255,0.7)"
        >
          Position your face here
        </text>
      </svg>
    </div>
  );
}
