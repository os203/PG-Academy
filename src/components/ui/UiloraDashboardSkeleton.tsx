"use client";

import { motion } from "framer-motion";
import React from "react";

export interface UiloraDashboardProps {
  theme?: "dark" | "light";
  accentColor?: string;
  sidebarCollapsed?: boolean;
  statCards?: number;
}


const SHIMMER_DURATION = 1.6;

interface ShimmerBoneProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  theme: "dark" | "light";
  accentColor: string;
  delay?: number;
}

function ShimmerBone({
  width = "100%",
  height = 12,
  borderRadius = 6,
  className,
  style,
  theme,
  accentColor,
  delay = 0,
}: ShimmerBoneProps) {
  const boneBase = theme === "dark" ? "#1c1c28" : "#e8e8ed";
  const shimmerCenter =
    theme === "dark" ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.75)";

  const shimmerGradient = `linear-gradient(90deg, transparent 0%, ${shimmerCenter} 40%, ${shimmerCenter} 50%, transparent 100%)`;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width,
        height,
        borderRadius,
        backgroundColor: boneBase,
        flexShrink: 0,
        ...style,
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: shimmerGradient,
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: SHIMMER_DURATION,
          ease: "linear",
          repeat: Infinity,
          delay,
        }}
      />
    </div>
  );
}

export default function UiloraDashboard({
  theme = "dark",
  accentColor = "#6366f1",
  sidebarCollapsed = false,
  statCards = 4,
}: UiloraDashboardProps) {
  const clampedCards = Math.min(5, Math.max(2, statCards));

  // Theme tokens
  const tokens =
    theme === "dark"
      ? {
          pageBg: "#0a0a0f",
          sidebarBg: "#111118",
          boneBg: "#1c1c28",
          cardBorder: "rgba(255,255,255,0.05)",
          topbarBorder: "rgba(255,255,255,0.06)",
          textMuted: "rgba(255,255,255,0.12)",
        }
      : {
          pageBg: "#f5f5f7",
          sidebarBg: "#ffffff",
          boneBg: "#e8e8ed",
          cardBorder: "rgba(0,0,0,0.06)",
          topbarBorder: "rgba(0,0,0,0.07)",
          textMuted: "rgba(0,0,0,0.08)",
        };

  const sidebarWidth = sidebarCollapsed ? 48 : 220;

  const bone = (
    props: Omit<ShimmerBoneProps, "theme" | "accentColor"> & {
      delay?: number;
    }
  ) => (
    <ShimmerBone theme={theme} accentColor={accentColor} {...props} />
  );

  // Stagger delays for perceived depth
  const d = (n: number) => n * 0.06;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: tokens.pageBg,
        fontFamily: "'DM Mono', 'Fira Mono', monospace",
        overflow: "hidden",
      }}
    >
      {/* ── SIDEBAR ── */}
      <div
        style={{
          width: sidebarWidth,
          flexShrink: 0,
          backgroundColor: tokens.sidebarBg,
          borderRight: `1px solid ${tokens.cardBorder}`,
          display: "flex",
          flexDirection: "column",
          padding: sidebarCollapsed ? "20px 8px" : "20px 16px",
          gap: 0,
          transition: "width 0.3s cubic-bezier(0.25,1,0.5,1)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          {sidebarCollapsed ? (
            bone({ width: 32, height: 32, borderRadius: 8, delay: d(0) })
          ) : (
            bone({ width: 140, height: 32, borderRadius: 8, delay: d(0) })
          )}
        </div>

        {/* Nav items × 5 */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: sidebarCollapsed ? "8px 0" : "8px 0",
              }}
            >
              {bone({
                width: 20,
                height: 20,
                borderRadius: "50%",
                delay: d(i + 1),
                style: { flexShrink: 0 },
              })}
              {!sidebarCollapsed &&
                bone({
                  width: "80%",
                  height: 12,
                  borderRadius: 4,
                  delay: d(i + 1),
                })}
            </div>
          ))}
        </div>

        {/* Bottom profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingTop: 20,
            borderTop: `1px solid ${tokens.cardBorder}`,
            marginTop: 20,
          }}
        >
          {bone({
            width: 32,
            height: 32,
            borderRadius: "50%",
            delay: d(7),
            style: { flexShrink: 0 },
          })}
          {!sidebarCollapsed && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: 1,
              }}
            >
              {bone({ width: "60%", height: 11, borderRadius: 4, delay: d(7) })}
              {bone({ width: "40%", height: 9, borderRadius: 4, delay: d(8) })}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: `0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* ── TOPBAR ── */}
        <div
          style={{
            height: 56,
            borderBottom: `1px solid ${tokens.topbarBorder}`,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 16,
            flexShrink: 0,
          }}
        >
          {/* Breadcrumb left */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {bone({ width: 100, height: 24, borderRadius: 5, delay: d(1) })}
            {bone({ width: 60, height: 24, borderRadius: 5, delay: d(2) })}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search center */}
          {bone({
            width: 240,
            height: 36,
            borderRadius: 999,
            delay: d(2),
          })}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {[d(3), d(4), d(5)].map((delay, i) => (
              <React.Fragment key={i}>
                {bone({
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  delay,
                  style: { flexShrink: 0 },
                })}
              </React.Fragment>
            ))}
            {bone({
              width: 36,
              height: 36,
              borderRadius: "50%",
              delay: d(6),
              style: { flexShrink: 0 },
            })}
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* ── KPI STAT CARDS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${clampedCards}, 1fr)`,
              gap: 16,
            }}
          >
            {Array.from({ length: clampedCards }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${tokens.cardBorder}`,
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.9)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Top row: label + icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {bone({
                    width: 80,
                    height: 12,
                    borderRadius: 4,
                    delay: d(i),
                  })}
                  {bone({
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    delay: d(i + 1),
                    style: { flexShrink: 0 },
                  })}
                </div>

                {/* Big number */}
                {bone({
                  width: 120,
                  height: 32,
                  borderRadius: 6,
                  delay: d(i + 1),
                })}

                {/* Trend + progress */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {bone({
                    width: 60,
                    height: 10,
                    borderRadius: 4,
                    delay: d(i + 2),
                  })}
                  {bone({
                    width: "80%",
                    height: 6,
                    borderRadius: 999,
                    delay: d(i + 2),
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── CHART AREA ── */}
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${tokens.cardBorder}`,
              backgroundColor:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.9)",
              padding: 20,
              height: 220,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Chart topbar: title + tab pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {bone({ width: 120, height: 18, borderRadius: 5, delay: d(1) })}
              <div style={{ flex: 1 }} />
              {bone({ width: 64, height: 28, borderRadius: 999, delay: d(2) })}
              {bone({ width: 64, height: 28, borderRadius: 999, delay: d(3) })}
            </div>

            {/* Big chart bone */}
            {bone({
              width: "100%",
              height: 160,
              borderRadius: 8,
              delay: d(2),
              style: { flex: 1 },
            })}
          </div>

          {/* ── TABLE ── */}
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${tokens.cardBorder}`,
              backgroundColor:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.9)",
              overflow: "hidden",
            }}
          >
            {/* Table header bone */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: `1px solid ${tokens.cardBorder}`,
                display: "flex",
                gap: 16,
              }}
            >
              {[80, 100, 80, 60, 32].map((w, i) => (
                <React.Fragment key={i}>
                  {bone({ width: w, height: 10, borderRadius: 4, delay: d(i) })}
                </React.Fragment>
              ))}
            </div>

            {/* Table rows × 5 */}
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  borderBottom:
                    rowIdx < 4
                      ? `1px solid ${tokens.cardBorder}`
                      : "none",
                }}
              >
                {/* Avatar circle */}
                {bone({
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  delay: d(rowIdx),
                  style: { flexShrink: 0 },
                })}

                {/* Name block */}
                {bone({
                  width: 120,
                  height: 13,
                  borderRadius: 4,
                  delay: d(rowIdx),
                })}

                <div style={{ flex: 1 }} />

                {/* Data columns */}
                {bone({ width: 100, height: 11, borderRadius: 4, delay: d(rowIdx + 1) })}
                {bone({ width: 80, height: 11, borderRadius: 4, delay: d(rowIdx + 1) })}

                {/* Badge pill */}
                {bone({
                  width: 60,
                  height: 22,
                  borderRadius: 999,
                  delay: d(rowIdx + 2),
                })}

                {/* Action circle */}
                {bone({
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  delay: d(rowIdx + 2),
                  style: { flexShrink: 0 },
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
