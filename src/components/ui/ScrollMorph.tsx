"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollMorphProps {
    accentColor?: string;
    word?: string;
    subtext?: string;
}

export const ScrollMorph = ({
    accentColor = "#a855f7",
    word = "UILORA",
    subtext = "The component library for premium interfaces",
}: ScrollMorphProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Phase 1 [0 → 0.35]: letters spread far apart
    // Phase 2 [0.35 → 0.68]: converge to natural spacing
    // Phase 3 [0.68 → 1]: slightly compress and hold
    const letterSpacing = useTransform(
        scrollYProgress,
        [0, 0.32, 0.66, 1],
        ["0.7em", "0.06em", "-0.02em", "-0.04em"]
    );
    const wordY = useTransform(scrollYProgress, [0, 0.7], [50, -15]);
    const wordOpacity = useTransform(scrollYProgress, [0, 0.04, 0.88, 1], [0, 1, 1, 0.75]);
    const scaleY = useTransform(scrollYProgress, [0, 0.35, 0.68, 1], [1.25, 1.02, 1, 0.97]);

    const subtextOpacity = useTransform(scrollYProgress, [0.42, 0.62], [0, 1]);
    const subtextY = useTransform(scrollYProgress, [0.42, 0.62], [24, 0]);

    const lineScaleX = useTransform(scrollYProgress, [0.48, 0.72], [0, 1]);

    const hintOpacity = useTransform(scrollYProgress, [0, 0.06, 0.18], [1, 1, 0]);
    const bgGlow = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);

    return (
        <div ref={containerRef} className="relative h-[420vh]" style={{ background: "#030305" }}>
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                }}
            />

            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* Ambient background glow that builds with scroll */}
                <motion.div
                    style={{ opacity: bgGlow }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${accentColor}09, transparent)`,
                        }}
                    />
                </motion.div>

                <div className="flex flex-col items-center gap-5 relative z-10 px-8 text-center">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8" style={{ background: `${accentColor}50` }} />
                        <motion.span
                            style={{ opacity: hintOpacity, color: accentColor }}
                            className="text-[9px] font-mono tracking-[0.4em] uppercase"
                        >
                            Scroll to reveal
                        </motion.span>
                        <div className="h-px w-8" style={{ background: `${accentColor}50` }} />
                    </div>

                    {/* The morphing word */}
                    <motion.div style={{ y: wordY }}>
                        <motion.span
                            style={{
                                letterSpacing,
                                opacity: wordOpacity,
                                scaleY,
                                display: "block",
                                fontSize: "clamp(4.5rem, 15vw, 13rem)",
                                fontWeight: 900,
                                color: "rgba(255,255,255,0.93)",
                                lineHeight: 1,
                            }}
                        >
                            {word}
                        </motion.span>
                    </motion.div>

                    {/* Subtext that fades in once letters converge */}
                    <motion.div
                        style={{ opacity: subtextOpacity, y: subtextY }}
                        className="flex flex-col items-center gap-4 mt-2"
                    >
                        <motion.div
                            style={{ scaleX: lineScaleX, transformOrigin: "center" }}
                            className="h-px w-64"
                        >
                            <div className="w-full h-full" style={{ background: `${accentColor}45` }} />
                        </motion.div>
                        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed tracking-wide">
                            {subtext}
                        </p>
                        <div className="flex items-center gap-6 mt-2">
                            {["Design", "Motion", "System"].map((label) => (
                                <span
                                    key={label}
                                    className="text-[9px] font-mono tracking-[0.25em] uppercase"
                                    style={{ color: `${accentColor}80` }}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
