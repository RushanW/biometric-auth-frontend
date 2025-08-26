"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaceGuideOverlay } from "../../../components/camera/FaceGuideOverlay";

const CameraFeed = dynamic(
  () =>
    import("../../../components/camera/CameraFeed").then((m) => m.CameraFeed),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center text-white text-sm">
        Loading camera...
      </div>
    ),
  }
);

// tiny inline icons
function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" {...props}>
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// —— Lighting logic ——
type LightLevel = "no-signal" | "dark" | "ok" | "bright";
type ContrastLevel = "low" | "ok";

function classify(avgY: number): LightLevel {
  // Wider OK band; phones vary. Tune to your taste.
  if (avgY < 80) return "dark";
  if (avgY > 170) return "bright";
  return "ok";
}

function classifyContrast(stdev: number): ContrastLevel {
  // Very rough: <18 → flat lighting; >18 → some definition on face.
  return stdev < 18 ? "low" : "ok";
}

function useLightingCheck(
  videoEl: HTMLVideoElement | null,
  intervalMs = 500,
  smoothing = 0.35
) {
  const [avg, setAvg] = useState<number | null>(null);
  const [stdev, setStdev] = useState<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const smoothRef = useRef<number | null>(null);

  useEffect(() => {
    if (!videoEl) return;

    if (!canvasRef.current) {
      const c = document.createElement("canvas");
      c.width = 80; // a bit larger gives a stabler stdev
      c.height = 45;
      canvasRef.current = c;
      ctxRef.current = c.getContext("2d", { willReadFrequently: true });
    }

    const sample = () => {
      const ctx = ctxRef.current;
      const c = canvasRef.current;
      if (!ctx || !c) return;

      if (videoEl.readyState < 2) return;

      ctx.drawImage(videoEl, 0, 0, c.width, c.height);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);

      // luminance set
      let sum = 0;
      let sumSq = 0;
      const n = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        const y = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0..255
        sum += y;
        sumSq += y * y;
      }
      const mean = sum / n;
      // variance = E[y^2] - (E[y])^2
      const variance = sumSq / n - mean * mean;
      const sd = Math.sqrt(Math.max(variance, 0));

      // exp smoothing on mean only (UI-critical)
      if (smoothRef.current == null) {
        smoothRef.current = mean;
      } else {
        smoothRef.current =
          smoothing * mean + (1 - smoothing) * smoothRef.current;
      }

      setAvg(smoothRef.current);
      setStdev(sd);
    };

    const tick = () => {
      sample();
      timerRef.current = window.setTimeout(() => {
        rafRef.current = requestAnimationFrame(tick);
      }, intervalMs);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [videoEl, intervalMs, smoothing]);

  const level: LightLevel = avg == null ? "no-signal" : classify(avg);
  const contrast: ContrastLevel =
    stdev == null ? "ok" : classifyContrast(stdev);

  return { level, contrast, avg, stdev };
}

// —— UI helpers ——
function LevelChip({
  level,
  contrast,
}: {
  level: LightLevel;
  contrast: ContrastLevel;
}) {
  if (level === "no-signal") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700">
        <Dot className="bg-gray-500" /> Waiting for camera…
      </span>
    );
  }
  if (level === "dark") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">
        <Dot className="bg-amber-500" /> Too dark — add light or face a window
      </span>
    );
  }
  if (level === "bright") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700">
        <Dot className="bg-rose-500" /> Too bright — avoid backlight/glare
      </span>
    );
  }
  // ok brightness but warn if contrast is flat
  if (contrast === "low") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700">
        <Dot className="bg-sky-500" /> Good brightness — add side light for
        definition
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700">
      <Dot className="bg-emerald-500" /> Good lighting
    </span>
  );
}

function Tip({
  level,
  contrast,
}: {
  level: LightLevel;
  contrast: ContrastLevel;
}) {
  if (level === "dark")
    return <>Turn on a light or face a window. Avoid silhouettes.</>;
  if (level === "bright")
    return <>Move away from direct backlight or reduce screen glare.</>;
  if (contrast === "low")
    return <>Add a soft side light (45° angle) to bring out facial features.</>;
  return <>You’re good to go.</>;
}

export default function GuidePage() {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const { level, contrast, avg, stdev } = useLightingCheck(videoEl, 450, 0.35);

  // colors/glow
  const ringClass =
    level === "ok"
      ? contrast === "ok"
        ? "ring-emerald-400/40"
        : "ring-sky-400/40"
      : level === "dark"
      ? "ring-amber-400/45 animate-pulse"
      : level === "bright"
      ? "ring-rose-400/45 animate-pulse"
      : "ring-white/10";

  const shadowGlow =
    level === "ok"
      ? contrast === "ok"
        ? "shadow-[0_0_0_0_rgba(0,0,0,0)]"
        : "shadow-[0_0_40px_0_rgba(56,189,248,0.25)]"
      : level === "dark"
      ? "shadow-[0_0_40px_0_rgba(251,191,36,0.25)]"
      : level === "bright"
      ? "shadow-[0_0_40px_0_rgba(244,63,94,0.25)]"
      : "shadow-none";

  // meter position
  const val = Math.min(255, Math.max(0, avg ?? 0));
  const pointerLeft = `${(val / 255) * 100}%`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* heading + accent underline */}
      <div className="relative inline-block">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Position &amp; lighting
        </h1>
        <span className="absolute bottom-0 left-0 h-1 w-28 rounded-full bg-gradient-to-r from-rose-500 to-indigo-500" />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Center your face in the oval. We’ll run a quick liveness check next.
      </p>

      {/* glass card */}
      <section className="mt-6 rounded-2xl border border-white/20 bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl shadow-xl p-5 md:p-7">
        {/* dynamic chips */}
        {/* debug numbers right-aligned (optional) */}
        {(typeof avg === "number" || typeof stdev === "number") && (
          <span
            className={`ml-auto inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums
    ${
      level === "ok" && contrast === "ok"
        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
    }`}
          >
            {level === "ok" && contrast === "ok" ? (
              <svg
                className="h-3.5 w-3.5 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="h-3.5 w-3.5 text-rose-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-8 14A2 2 0 004.06 21h15.88a2 2 0 001.77-3.14l-8-14a2 2 0 00-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {typeof avg === "number" && <>Avg {avg.toFixed(0)}</>}
            {typeof stdev === "number" && <>&nbsp;· σ {stdev.toFixed(0)}</>}
          </span>
        )}
        {/* meter */}
        <div className="mt-3">
          <div className="relative h-2 rounded-full bg-gradient-to-r from-black via-gray-500 to-white">
            {/* target band */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-emerald-300/40"
              style={{
                left: `${(80 / 255) * 100}%`,
                width: `${((170 - 80) / 255) * 100}%`,
              }}
            />
            {/* pointer */}
            <div
              className="absolute -top-1 h-4 w-[2px] bg-gray-900 rounded-full"
              style={{ left: pointerLeft }}
              title={`Luminance ${val.toFixed(0)}`}
            />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            <Tip level={level} contrast={contrast} />
          </p>
        </div>

        {/* camera container */}
        <div
          className={`relative mt-5 aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-black transition-shadow duration-500 ${shadowGlow}`}
        >
          <div
            className={`pointer-events-none absolute inset-0 rounded-xl ring-2 ${ringClass} transition-all duration-300`}
          />
          <CameraFeed
            overlay={<FaceGuideOverlay />}
            facingMode="user"
            onReady={(video) => {
              setVideoEl(video);
              console.log("Guide page camera ready:", video);
            }}
          />
        </div>

        {/* helper line */}
        <p className="mt-3 text-xs text-gray-500">
          If the oval can’t find your face, move slightly closer and ensure your
          whole face is visible.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <LevelChip level={level} contrast={contrast} />
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">
            <Dot className="bg-amber-500" /> Face centered
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700">
            <Dot className="bg-rose-500" /> No mask / sunglasses
          </span>
        </div>
        {/* CTAs */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/enroll/liveness"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-indigo-500 shadow-lg transition hover:brightness-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400 active:scale-95"
          >
            Start liveness
            <ArrowRight className="opacity-90" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancel
          </Link>

          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
            <Dot
              className={
                level === "ok"
                  ? "bg-emerald-500"
                  : level === "dark"
                  ? "bg-amber-500"
                  : level === "bright"
                  ? "bg-rose-500"
                  : "bg-gray-400"
              }
            />
            {level === "no-signal"
              ? "Camera…"
              : level === "ok"
              ? contrast === "ok"
                ? "Camera ready"
                : "Camera ready · add side light"
              : level === "dark"
              ? "Lighting: Dark"
              : "Lighting: Bright"}
          </span>
        </div>
      </section>
    </main>
  );
}
