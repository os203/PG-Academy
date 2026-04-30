"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollZoomProps {
    accentColor?: string;
    image?: string;
    headline?: string;
}

export const ScrollZoom = ({
    accentColor = "#f97316",
    image = "https://images.unsplash.com/photo-1775126964224-99c03c0e439c?w=1200&auto=format&fit=crop&q=60",
    headline = "Every pixel, intentional.",
}: ScrollZoomProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const scale = useTransform(scrollYProgress, [0, 0.7], [0.55, 1]);
    const borderRadius = useTransform(scrollYProgress, [0, 0.65], [20, 0]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.35], [0, -40]);
    const hintOpacity = useTransform(scrollYProgress, [0, 0.12, 0.22], [1, 1, 0]);
    const finalOpacity = useTransform(scrollYProgress, [0.72, 0.92], [0, 1]);
    const finalY = useTransform(scrollYProgress, [0.72, 0.92], [30, 0]);

    return (
        <div ref={containerRef} className="relative h-[350vh]" style={{ background: "#030305" }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Zooming image */}
                <motion.div
                    style={{ scale, borderRadius }}
                    className="absolute inset-0 overflow-hidden"
                >
                    <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ filter: "saturate(0.72) brightness(0.65)" }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(3,3,5,0.35) 0%, transparent 40%, rgba(3,3,5,0.55) 100%)",
                        }}
                    />
                </motion.div>

                {/* Headline — fades out as zoom progresses */}
                <motion.div
                    style={{ opacity: textOpacity, y: textY }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-8"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px w-8" style={{ background: `${accentColor}55` }} />
                        <span
                            className="text-[10px] font-mono tracking-[0.32em] uppercase"
                            style={{ color: accentColor }}
                        >
                            Uilora Scroll Zoom
                        </span>
                        <div className="h-px w-8" style={{ background: `${accentColor}55` }} />
                    </div>
                    <h2
                        className="text-white font-black tracking-[-0.03em] leading-[0.92]"
                        style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
                    >
                        {headline}
                    </h2>
                </motion.div>

                {/* Byline — fades in after zoom completes */}
                <motion.div
                    style={{ opacity: finalOpacity, y: finalY }}
                    className="absolute bottom-14 flex flex-col items-center z-10"
                >
                    <p className="text-white/50 text-[10px] font-mono tracking-[0.3em] uppercase">
                        Uilora — 2025
                    </p>
                    <div className="mt-3 h-px w-16" style={{ background: `${accentColor}60` }} />
                </motion.div>

                {/* Scroll hint */}
                <motion.p
                    style={{ opacity: hintOpacity }}
                    className="absolute bottom-8 text-zinc-700 text-[10px] font-mono tracking-[0.3em] uppercase z-20"
                >
                    Scroll to zoom
                </motion.p>
            </div>
        </div>
    );
};
