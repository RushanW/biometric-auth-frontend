'use client';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

type Props = {
  overlay?: React.ReactNode;
  facingMode?: 'user' | 'environment';
  /** Called when video element is mounted & stream started */
  onReady?: (videoEl: HTMLVideoElement) => void;
};

export type CameraFeedHandle = {
  /** Stop all media tracks (cleanup) */
  stop: () => void;
  /** Access the video element (read-only) */
  getVideo: () => HTMLVideoElement | null;
};

const CameraFeed = forwardRef<CameraFeedHandle, Props>(function CameraFeed(
  { overlay, facingMode = 'user', onReady },
  ref
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    stop() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    getVideo() {
      return videoRef.current;
    },
  }));

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30, max: 60 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          onReady?.(videoRef.current);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Camera error');
      }
    };
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, onReady]);

  return (
    <div className="relative h-full w-full">
      <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
      {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
      {error && (
        <div className="absolute inset-x-0 bottom-0 m-2 rounded bg-red-500/20 p-2 text-xs text-red-300">
          {error}
        </div>
      )}
    </div>
  );
});

export default CameraFeed;
