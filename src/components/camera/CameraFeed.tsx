'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export type CameraFeedHandle = { stop: () => void };

type Props = {
  facingMode?: 'user' | 'environment';
  onReady?: (video: HTMLVideoElement) => void;
  overlay?: React.ReactNode;
  className?: string;
  /** Mirror the preview horizontally (typical for front cameras). */
  mirror?: boolean;
};

export const CameraFeed = forwardRef<CameraFeedHandle, Props>(
  ({ facingMode = 'user', onReady, overlay, className, mirror = true }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        stop() {
          stream?.getTracks().forEach((t) => t.stop());
        },
      }),
      [stream]
    );

    useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          if (cancelled) {
            s.getTracks().forEach((t) => t.stop());
            return;
          }
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(() => {});
              if (videoRef.current && onReady) onReady(videoRef.current);
            };
          }
        } catch (e) {
          console.error('getUserMedia failed:', e);
        }
      })();

      return () => {
        cancelled = true;
        stream?.getTracks().forEach((t) => t.stop());
      };
    }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div className={`relative w-full h-full ${className ?? ''}`}>
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${mirror ? '-scale-x-100' : ''}`}
        />
        {/* overlay (e.g., canvas) */}
        {overlay}
      </div>
    );
  }
);

CameraFeed.displayName = 'CameraFeed';
