"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface SecureHlsPlayerProps {
  src: string;
  onProgress?: (playedPercent: number, playedSeconds: number) => void;
}

export default function SecureHlsPlayer({
  src,
  onProgress,
}: SecureHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onProgressRef = useRef<SecureHlsPlayerProps["onProgress"]>(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    let hls: Hls | null = null;

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;

      const playedPercent = Math.round(
        (video.currentTime / video.duration) * 100
      );

      const playedSeconds = Math.round(video.currentTime);

      onProgressRef.current?.(playedPercent, playedSeconds);
    };

    const handleLoadedMetadata = () => {
      video.currentTime = 0;
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
        },
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("[HLS] Manifest parsed");
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("[HLS_ERROR]", data);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      className="w-full h-full bg-black"
    />
  );
}