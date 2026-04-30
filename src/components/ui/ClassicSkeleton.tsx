"use client";

import React from "react";
import { motion } from "framer-motion";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClassicProps {
    /** "dark" (default) or "light" — switches the entire color palette */
    theme?: "dark" | "light";
    /** Toggle shimmer animation globally across all skeleton pieces */
    shimmer?: boolean;
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface BaseProps {
    className?: string;
    shimmer?: boolean;
    theme?: "dark" | "light";
}

interface SkeletonBlockProps extends BaseProps {
    width?: string | number;
    height?: string | number;
    rounded?: string;
}

interface SkeletonTextProps extends BaseProps {
    lines?: number;
    gap?: number;
}

interface SkeletonAvatarProps extends BaseProps {
    size?: number | string;
}

interface SkeletonButtonProps extends BaseProps {
    width?: string | number;
}

interface ShimmerOverlayProps {
    children: React.ReactNode;
    className?: string;
    theme?: "dark" | "light";
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const tokens = {
    dark: {
        page:    "bg-neutral-950",
        section: "bg-neutral-900/20 border-neutral-800/50",
        bone:    "bg-neutral-800/50",
        card:    "bg-neutral-900/50 border-neutral-800",
        shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.055) 50%, transparent 100%)",
        label:   "text-neutral-500",
        heading: "text-white",
        body:    "text-neutral-500",
        overlay: "bg-neutral-900 border-neutral-800",
        spinner: "border-neutral-600 border-t-white",
    },
    light: {
        page:    "bg-neutral-50",
        section: "bg-white border-neutral-200",
        bone:    "bg-neutral-200",
        card:    "bg-white border-neutral-200",
        shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
        label:   "text-neutral-400",
        heading: "text-neutral-900",
        body:    "text-neutral-400",
        overlay: "bg-white border-neutral-200",
        spinner: "border-neutral-300 border-t-neutral-700",
    },
} as const;

// ─── ShimmerEffect ────────────────────────────────────────────────────────────

const ShimmerEffect = ({ shimmerGradient }: { shimmerGradient: string }) => (
    <motion.div
        className="absolute inset-0 -translate-x-full"
        initial={{ translateX: "-100%" }}
        animate={{ translateX: "100%" }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ background: shimmerGradient }}
    />
);

// ─── 1. Skeleton Block ────────────────────────────────────────────────────────

const SkeletonBlock = ({
    width = "100%",
    height = "100px",
    rounded = "rounded-xl",
    className = "",
    shimmer = true,
    theme = "dark",
}: SkeletonBlockProps) => {
    const t = tokens[theme];
    return (
        <div
            className={`relative overflow-hidden ${t.bone} ${rounded} ${className}`}
            style={{ width, height }}
        >
            {shimmer && <ShimmerEffect shimmerGradient={t.shimmer} />}
        </div>
    );
};

// ─── 2. Skeleton Text ─────────────────────────────────────────────────────────

const SkeletonText = ({
    lines = 3,
    gap = 12,
    className = "",
    shimmer = true,
    theme = "dark",
}: SkeletonTextProps) => (
    <div className={`flex flex-col ${className}`} style={{ gap }}>
        {Array.from({ length: lines }).map((_, i) => (
            <SkeletonBlock
                key={i}
                height={14}
                width={i === lines - 1 && lines > 1 ? "70%" : "100%"}
                rounded="rounded-md"
                shimmer={shimmer}
                theme={theme}
            />
        ))}
    </div>
);

// ─── 3. Skeleton Avatar ───────────────────────────────────────────────────────

const SkeletonAvatar = ({
    size = 48,
    className = "",
    shimmer = true,
    theme = "dark",
}: SkeletonAvatarProps) => (
    <div className={`relative ${className}`}>
        <SkeletonBlock width={size} height={size} rounded="rounded-full" shimmer={shimmer} theme={theme} />
        <div className="absolute inset-0 rounded-full border border-white/5" />
    </div>
);

// ─── 4. Skeleton Card ─────────────────────────────────────────────────────────

const SkeletonCard = ({ shimmer = true, theme = "dark" }: { shimmer?: boolean; theme?: "dark" | "light" }) => {
    const t = tokens[theme];
    return (
        <div className={`w-full max-w-sm rounded-2xl border ${t.card} p-4`}>
            <SkeletonBlock height={180} rounded="rounded-xl" className="mb-4" shimmer={shimmer} theme={theme} />
            <SkeletonBlock height={24} width="60%" rounded="rounded-lg" className="mb-3" shimmer={shimmer} theme={theme} />
            <SkeletonText lines={2} shimmer={shimmer} theme={theme} />
        </div>
    );
};

// ─── 5. Skeleton List Item ────────────────────────────────────────────────────

const SkeletonListItem = ({ shimmer = true, theme = "dark" }: { shimmer?: boolean; theme?: "dark" | "light" }) => {
    const t = tokens[theme];
    return (
        <div className={`flex w-full max-w-sm items-center gap-4 rounded-xl border ${t.card} p-4`}>
            <SkeletonAvatar size={48} shimmer={shimmer} theme={theme} />
            <div className="flex-1 space-y-2">
                <SkeletonBlock height={16} width="40%" rounded="rounded-md" shimmer={shimmer} theme={theme} />
                <SkeletonBlock height={12} width="85%" rounded="rounded-md" shimmer={shimmer} theme={theme} />
            </div>
        </div>
    );
};

// ─── 6. Skeleton Button ───────────────────────────────────────────────────────

const SkeletonButton = ({
    width = 120,
    className = "",
    shimmer = true,
    theme = "dark",
}: SkeletonButtonProps) => (
    <SkeletonBlock width={width} height={42} rounded="rounded-lg" className={`opacity-80 ${className}`} shimmer={shimmer} theme={theme} />
);

// ─── 7. Skeleton Input ────────────────────────────────────────────────────────

const SkeletonInput = ({ shimmer = true, theme = "dark" }: { shimmer?: boolean; theme?: "dark" | "light" }) => (
    <div className="w-full space-y-2">
        <SkeletonBlock width={80} height={12} rounded="rounded-md" shimmer={false} theme={theme} />
        <SkeletonBlock width="100%" height={48} rounded="rounded-xl" shimmer={shimmer} theme={theme} />
    </div>
);

// ─── 8. Skeleton Overlay ──────────────────────────────────────────────────────

const SkeletonOverlay = ({ children, className = "", theme = "dark" }: ShimmerOverlayProps) => {
    const t = tokens[theme];
    return (
        <div className={`relative overflow-hidden rounded-xl border ${t.overlay} ${className}`}>
            <div className="relative z-10 p-6 opacity-30 blur-sm">{children}</div>
            <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className={`h-8 w-8 animate-spin rounded-full border-2 ${t.spinner}`} />
            </div>
            <ShimmerEffect shimmerGradient={t.shimmer} />
        </div>
    );
};

// ─── Demo Page ────────────────────────────────────────────────────────────────

export default function Classic({ theme = "dark", shimmer = true }: ClassicProps) {
    const t = tokens[theme];
    return (
        <div className={`min-h-screen ${t.page} p-8 sm:p-20`}>
            <div className="mx-auto max-w-6xl">
                <header className="mb-16 max-w-2xl">
                    <h1 className={`mb-4 text-4xl font-semibold tracking-tight ${t.heading}`}>
                        Loading States
                    </h1>
                    <p className={`text-lg ${t.body}`}>
                        A set of elegant, production-ready skeleton components with subtle,
                        high-performance shimmer animations.
                    </p>
                </header>

                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

                    {/* 1. Basic Blocks */}
                    <div className="space-y-4">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${t.label}`}>01. Shapes</h3>
                        <div className={`space-y-4 rounded-2xl border ${t.section} p-6`}>
                            <SkeletonBlock height={64} width="100%" shimmer={shimmer} theme={theme} />
                            <div className="flex gap-4">
                                <SkeletonBlock height={64} width={64} rounded="rounded-2xl" shimmer={shimmer} theme={theme} />
                                <SkeletonBlock height={64} width={64} rounded="rounded-full" shimmer={shimmer} theme={theme} />
                            </div>
                        </div>
                    </div>

                    {/* 2. Text Variations */}
                    <div className="space-y-4">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${t.label}`}>02. Text Content</h3>
                        <div className={`space-y-6 rounded-2xl border ${t.section} p-6`}>
                            <SkeletonText lines={1} shimmer={shimmer} theme={theme} />
                            <SkeletonText lines={4} gap={8} shimmer={shimmer} theme={theme} />
                        </div>
                    </div>

                    {/* 3. Avatars */}
                    <div className="space-y-4">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${t.label}`}>03. Avatars</h3>
                        <div className={`flex items-center gap-4 rounded-2xl border ${t.section} p-6`}>
                            <SkeletonAvatar size={48} shimmer={shimmer} theme={theme} />
                            <SkeletonAvatar size={64} shimmer={shimmer} theme={theme} />
                            <SkeletonAvatar size={32} shimmer={shimmer} theme={theme} />
                        </div>
                    </div>

                    {/* 4. Button & Inputs */}
                    <div className="space-y-4">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${t.label}`}>04. Controls</h3>
                        <div className={`space-y-6 rounded-2xl border ${t.section} p-6`}>
                            <SkeletonInput shimmer={shimmer} theme={theme} />
                            <div className="flex gap-3 pt-2">
                                <SkeletonButton width="50%" shimmer={shimmer} theme={theme} />
                                <SkeletonButton width="50%" shimmer={shimmer} theme={theme} />
                            </div>
                        </div>
                    </div>

                    {/* 5. List Items */}
                    <div className="space-y-4 sm:col-span-2">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${t.label}`}>05. List Groups</h3>
                        <div className="space-y-4">
                            <SkeletonListItem shimmer={shimmer} theme={theme} />
                            <SkeletonListItem shimmer={shimmer} theme={theme} />
                        </div>
                    </div>

                    {/* 6. Cards */}
                    <div className="space-y-4 sm:col-span-2">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${t.label}`}>06. Cards</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <SkeletonCard shimmer={shimmer} theme={theme} />
                            <SkeletonCard shimmer={shimmer} theme={theme} />
                        </div>
                    </div>

                    {/* 7. Overlay / Loading State */}
                    <div className="space-y-4 sm:col-span-2 lg:col-span-4">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${t.label}`}>07. Loading Overlay</h3>
                        <SkeletonOverlay className="h-48 w-full" theme={theme}>
                            <div className="flex items-start gap-6">
                                <div className="h-32 w-32 rounded-xl bg-neutral-800" />
                                <div className="space-y-4 pt-2">
                                    <div className="h-6 w-64 rounded bg-neutral-800" />
                                    <div className="h-4 w-48 rounded bg-neutral-800" />
                                    <div className="h-4 w-full max-w-md rounded bg-neutral-800" />
                                    <div className="h-4 w-full max-w-sm rounded bg-neutral-800" />
                                </div>
                            </div>
                        </SkeletonOverlay>
                    </div>
                </div>
            </div>
        </div>
    );
}
