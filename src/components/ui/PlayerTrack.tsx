"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Cast,
  Settings,
  ListVideo,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";

interface PlayerTrackProps {
  video?: string;
  backgroundColor?: string;
}

const PRIMARY_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const formatTime = (s: number): string =>
  Math.floor(s / 60).toString().padStart(2, "0") +
  ":" +
  Math.floor(s % 60).toString().padStart(2, "0");

interface ThumbnailPreview {
  x: number;
  time: number;
  visible: boolean;
}

export default function PlayerTrack({
  video = PRIMARY_VIDEO,
  backgroundColor = "#0a0a0f",
}: PlayerTrackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [ended, setEnded] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [thumbnail, setThumbnail] = useState<ThumbnailPreview>({
    x: 0,
    time: 0,
    visible: false,
  });

  /* ── playback ── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      setEnded(false);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const handleReplay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setPlaying(true);
    setEnded(false);
  };

  /* ── controls visibility ── */
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 2000);
  }, [playing]);

  /* ── scrubber ── */
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = scrubberRef.current?.getBoundingClientRect();
    if (!rect || !videoRef.current) return;
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
  };

  const handleScrubberMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = scrubberRef.current?.getBoundingClientRect();
    if (!rect || !previewVideoRef.current) return;
    const localX = e.clientX - rect.left;
    const pct = localX / rect.width;
    const t = pct * duration;
    previewVideoRef.current.currentTime = t;
    const half = 80;
    const clampedX = Math.max(half, Math.min(rect.width - half, localX));
    setThumbnail({ x: clampedX, time: t, visible: true });
  };

  const handleScrubberLeave = () => {
    setThumbnail((prev) => ({ ...prev, visible: false }));
  };

  /* ── auto-play on mount ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    if (v.readyState >= 1) {
      tryPlay();
    } else {
      v.addEventListener("loadedmetadata", tryPlay, { once: true });
      return () => v.removeEventListener("loadedmetadata", tryPlay);
    }
  }, []);

  /* ── canvas draw ── */
  useEffect(() => {
    const pv = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    if (!pv || !canvas) return;
    const ctx = canvas.getContext("2d");
    const onSeeked = () => {
      if (ctx) ctx.drawImage(pv, 0, 0, 160, 90);
    };
    pv.addEventListener("seeked", onSeeked);
    return () => pv.removeEventListener("seeked", onSeeked);
  }, []);

  /* ── video events ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setEnded(true);
      setPlaying(false);
      setControlsVisible(true);
    };
    // If metadata already loaded (cached video), set duration immediately
    if (v.readyState >= 1 && v.duration) {
      setDuration(v.duration);
      setCurrentTime(v.currentTime);
    }
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        backgroundColor,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Hidden preview video */}
      <video
        ref={previewVideoRef}
        src={video}
        preload="metadata"
        muted
        style={{ display: "none" }}
      />

      {/* Player container */}
      <div
        ref={containerRef}
        onMouseMove={showControls}
        onMouseEnter={showControls}
        onMouseLeave={() => {
          if (playing) {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            setControlsVisible(false);
          }
        }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "56rem",
          borderRadius: "1rem",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* Video */}
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            src={video}
            onClick={togglePlay}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              cursor: "pointer",
            }}
            preload="metadata"
          />

          {/* Top bar — always shown */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
              padding: "1rem 1.25rem 2rem",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "3px",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Uilora Academy
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                Class 2: Mastering Visual Composition
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              {[Cast, Settings, ListVideo].map((Icon, i) => (
                <button
                  key={i}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "white")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.6)")
                  }
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Center controls */}
          <AnimatePresence>
            {controlsVisible && !ended && (
              <motion.div
                key="center-controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.5rem",
                  pointerEvents: controlsVisible ? "auto" : "none",
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                  }}
                  onClick={() => {
                    if (videoRef.current)
                      videoRef.current.currentTime = Math.max(
                        0,
                        videoRef.current.currentTime - 15
                      );
                  }}
                >
                  <SkipBack size={20} fill="white" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={togglePlay}
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
                  }}
                >
                  {playing ? (
                    <Pause size={24} fill="white" color="white" />
                  ) : (
                    <Play
                      size={24}
                      fill="white"
                      color="white"
                      style={{ marginLeft: "3px" }}
                    />
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                  }}
                  onClick={() => {
                    if (videoRef.current)
                      videoRef.current.currentTime = Math.min(
                        videoRef.current.duration || 0,
                        videoRef.current.currentTime + 15
                      );
                  }}
                >
                  <SkipForward size={20} fill="white" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ended state */}
          <AnimatePresence>
            {ended && (
              <motion.div
                key="ended-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.65)",
                  gap: "1.5rem",
                }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{ cursor: "pointer" }}
                  onClick={handleReplay}
                >
                  <RefreshCw size={52} color="white" strokeWidth={1.5} />
                </motion.div>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  onClick={handleReplay}
                  style={{
                    background: "#7c3aed",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 0",
                    width: "256px",
                    fontSize: "14px",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    boxShadow: "0 0 24px rgba(124,58,237,0.4)",
                  }}
                >
                  Finish Lesson →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
              paddingTop: "2.5rem",
              paddingBottom: "1rem",
              paddingLeft: "1.25rem",
              paddingRight: "1.25rem",
            }}
          >
            {/* Time + scrubber */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              {/* Volume */}
              <button
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.muted = !muted;
                  setMuted(!muted);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setMuted(val === 0);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = val === 0;
                  }
                }}
                style={{ width: 56, accentColor: "#7c3aed", cursor: "pointer", flexShrink: 0 }}
              />

              <span
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "11px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.03em",
                  flexShrink: 0,
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Scrubber */}
              <div style={{ position: "relative", flex: 1 }}>
                <AnimatePresence>
                  {thumbnail.visible && (
                    <motion.div
                      key="track-thumb"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 10px)",
                        left: thumbnail.x,
                        transform: "translateX(-50%)",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "6px",
                          overflow: "hidden",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                        }}
                      >
                        <canvas
                          ref={previewCanvasRef}
                          width={160}
                          height={90}
                          style={{ display: "block" }}
                        />
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "10px",
                          marginTop: "4px",
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {formatTime(thumbnail.time)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  ref={scrubberRef}
                  onClick={handleScrubberClick}
                  onMouseMove={handleScrubberMove}
                  onMouseLeave={handleScrubberLeave}
                  style={{
                    height: "3px",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${progress}%`,
                      background: "#7c3aed",
                      borderRadius: "2px",
                      transition: "width 0.1s linear",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `${progress}%`,
                      transform: "translate(-50%, -50%)",
                      width: "11px",
                      height: "11px",
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 0 0 2px #7c3aed",
                      transition: "left 0.1s linear",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!expanded) {
                    containerRef.current?.requestFullscreen?.();
                  } else {
                    document.exitFullscreen?.();
                  }
                  setExpanded(!expanded);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                  flexShrink: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "white")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.7)")
                }
              >
                {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Lesson metadata strip below video */}
        <div
          style={{
            background: "#111118",
            padding: "0.75rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Up next in Uilora Academy
            </span>
          </div>
          <div
            style={{
              background: "#7c3aed",
              color: "white",
              fontSize: "11px",
              padding: "4px 14px",
              borderRadius: "100px",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            Next Lesson
          </div>
        </div>
      </div>
    </div>
  );
}
