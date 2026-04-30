"use client";

import React from "react";
import { motion } from "framer-motion";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UiloraFeedProps {
    /** "dark" (default) or "light" — switches entire color palette */
    theme?: "dark" | "light";
    /** Accent color used for shimmer tint — default "#10b981" */
    accentColor?: string;
    /** Number of feed posts to render — default 4, range 2–6 */
    postCount?: number;
    /** Show stories/highlights row at top — default true */
    showStories?: boolean;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const tokens = {
    dark: {
        page:    "#0d0d12",
        card:    "#13131a",
        bone:    "#1e1e2e",
        border:  "rgba(255,255,255,0.06)",
        shimmer: "linear-gradient(90deg, transparent, rgba(255,255,255,0.055), transparent)",
    },
    light: {
        page:    "#f0f2f5",
        card:    "#ffffff",
        bone:    "#e4e6eb",
        border:  "rgba(0,0,0,0.08)",
        shimmer: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
    },
} as const;

// ─── Easing ───────────────────────────────────────────────────────────────────

const SPRING_EASE = [0.22, 1, 0.36, 1] as const;

// ─── Shimmer bone ─────────────────────────────────────────────────────────────

interface BoneProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    style?: React.CSSProperties;
    boneColor: string;
    shimmerGradient: string;
}

const Bone = ({ width = "100%", height = 14, borderRadius = 6, style, boneColor, shimmerGradient }: BoneProps) => (
    <div
        style={{
            position: "relative",
            overflow: "hidden",
            width,
            height,
            borderRadius,
            backgroundColor: boneColor,
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
            initial={{ translateX: "-100%" }}
            animate={{ translateX: "100%" }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        />
    </div>
);

// ─── Stories row ──────────────────────────────────────────────────────────────

interface StoriesRowProps {
    boneColor: string;
    shimmerGradient: string;
    borderColor: string;
    cardBg: string;
}

const StoriesRow = ({ boneColor, shimmerGradient, borderColor, cardBg }: StoriesRowProps) => (
    <div
        style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 20,
            padding: "16px",
            marginBottom: 12,
            overflow: "hidden",
        }}
    >
        <div
            style={{
                display: "flex",
                gap: 16,
                overflowX: "hidden",
                paddingBottom: 2,
            }}
        >
            {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: i * 0.06, ease: SPRING_EASE }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                    }}
                >
                    {/* Avatar circle */}
                    <Bone
                        width={56}
                        height={56}
                        borderRadius="50%"
                        boneColor={boneColor}
                        shimmerGradient={shimmerGradient}
                    />
                    {/* Label */}
                    <Bone
                        width={48}
                        height={10}
                        borderRadius={5}
                        boneColor={boneColor}
                        shimmerGradient={shimmerGradient}
                    />
                </motion.div>
            ))}
        </div>
    </div>
);

// ─── Post card ────────────────────────────────────────────────────────────────

interface PostCardProps {
    index: number;
    hasImage: boolean;
    boneColor: string;
    shimmerGradient: string;
    borderColor: string;
    cardBg: string;
}

const PostCard = ({ index, hasImage, boneColor, shimmerGradient, borderColor, cardBg }: PostCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1, ease: SPRING_EASE }}
        style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 20,
            padding: 16,
        }}
    >
        {/* Header row: avatar + name + timestamp */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Bone
                width={44}
                height={44}
                borderRadius="50%"
                boneColor={boneColor}
                shimmerGradient={shimmerGradient}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <Bone
                    width={100}
                    height={14}
                    borderRadius={6}
                    boneColor={boneColor}
                    shimmerGradient={shimmerGradient}
                />
                <Bone
                    width={70}
                    height={10}
                    borderRadius={5}
                    boneColor={boneColor}
                    shimmerGradient={shimmerGradient}
                />
            </div>
        </div>

        {/* Content lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            <Bone width="100%" height={14} borderRadius={6} boneColor={boneColor} shimmerGradient={shimmerGradient} />
            <Bone width="100%" height={14} borderRadius={6} boneColor={boneColor} shimmerGradient={shimmerGradient} />
            <Bone width="70%"  height={14} borderRadius={6} boneColor={boneColor} shimmerGradient={shimmerGradient} />
        </div>

        {/* Image (alternating) */}
        {hasImage && (
            <Bone
                width="100%"
                height={200}
                borderRadius={14}
                style={{ marginTop: 12 }}
                boneColor={boneColor}
                shimmerGradient={shimmerGradient}
            />
        )}

        {/* Action row */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {[0, 1, 2].map((i) => (
                <Bone
                    key={i}
                    width={64}
                    height={28}
                    borderRadius={99}
                    boneColor={boneColor}
                    shimmerGradient={shimmerGradient}
                />
            ))}
        </div>
    </motion.div>
);

// ─── Main export ──────────────────────────────────────────────────────────────

export default function UiloraFeed({
    theme       = "dark",
    accentColor = "#10b981",
    postCount   = 4,
    showStories = true,
}: UiloraFeedProps) {
    const t = tokens[theme];

    // Clamp postCount between 2 and 6
    const count = Math.min(6, Math.max(2, postCount));

    // Tint the shimmer very subtly with the accent color at ultra-low opacity
    const shimmerGradient = theme === "dark"
        ? `linear-gradient(90deg, transparent, rgba(255,255,255,0.055), transparent)`
        : `linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)`;

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: t.page,
                display: "flex",
                justifyContent: "center",
                padding: "24px 16px 48px",
            }}
        >
            <div style={{ width: "100%", maxWidth: 680 }}>
                {/* Stories row */}
                {showStories && (
                    <StoriesRow
                        boneColor={t.bone}
                        shimmerGradient={shimmerGradient}
                        borderColor={t.border}
                        cardBg={t.card}
                    />
                )}

                {/* Feed posts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Array.from({ length: count }).map((_, i) => (
                        <PostCard
                            key={i}
                            index={i}
                            hasImage={i % 2 === 0}
                            boneColor={t.bone}
                            shimmerGradient={shimmerGradient}
                            borderColor={t.border}
                            cardBg={t.card}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
