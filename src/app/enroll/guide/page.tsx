"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaceGuideOverlay } from "../../../components/camera/FaceGuideOverlay";

// Fix the dynamic import - import the named export
const CameraFeed = dynamic(
  () => import("../../../components/camera/CameraFeed").then(mod => mod.CameraFeed),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center text-white text-sm">
        Loading camera...
      </div>
    )
  }
);

export default function GuidePage() {
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
        Center your face in the oval. We'll run a quick liveness check next.
      </p>

      {/* glass card */}
      <section className="mt-6 rounded-2xl border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl shadow-xl p-5 md:p-7">
        {/* tips / chips */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700">
            <Dot className="bg-indigo-500" /> Good lighting
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700">
            <Dot className="bg-rose-500" /> No mask / sunglasses
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">
            <Dot className="bg-amber-500" /> Face centered
          </span>
        </div>

        {/* camera container */}
        <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-black">
          {/* optional gradient frame for style */}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white ring-opacity-10" />
          <CameraFeed 
            overlay={<FaceGuideOverlay />} 
            facingMode="user"
            onReady={(video) => {
              console.log('Guide page camera ready:', video);
            }}
          />
        </div>

        {/* helper line */}
        <p className="mt-3 text-xs text-gray-500">
          If the oval can't find your face, move slightly closer and ensure your
          whole face is visible.
        </p>

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

          {/* optional status on the right */}
          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
            <Dot className="bg-emerald-500" /> Camera ready
          </span>
        </div>
      </section>
    </main>
  );
}

/* tiny inline icons (no extra deps) */
function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" {...props}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}