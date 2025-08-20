'use client';
import dynamic from 'next/dynamic';
import { FaceGuideOverlay } from '../../../components/camera/FaceGuideOverlay';
const CameraFeed = dynamic(() => import('../../../components/camera/CameraFeed'), { ssr: false });

export default function GuidePage() {
  return (
    <main className="grid gap-4">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:p-6">
        <h2 className="mb-2 text-lg font-medium">Center your face in the oval</h2>
        <p className="mb-4 text-sm text-neutral-400">Keep your head steady. We’ll guide you through a quick liveness check next.</p>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-black">
          <CameraFeed overlay={<FaceGuideOverlay />} />
        </div>
        <div className="mt-4 flex gap-3">
          <a className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700" href="/enroll/liveness">Start Liveness</a>
          <a className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-600" href="/">Cancel</a>
        </div>
      </section>
    </main>
  );
}