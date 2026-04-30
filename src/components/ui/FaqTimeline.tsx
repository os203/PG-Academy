"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StepItem {
    step: string;
    title: string;
    description: string;
    tag?: string;
}

interface AccordionFAQTimelineProps {
    accentColor?: string;
    items?: StepItem[];
    title?: string;
    eyebrow?: string;
}

const DEFAULT_ITEMS: StepItem[] = [
    {
        step: "01",
        title: "Browse the library",
        description: "Explore Uilora's full component collection. Every component has a live interactive preview — scroll, hover, and click before copying a single line of code.",
        tag: "Free",
    },
    {
        step: "02",
        title: "Copy the source",
        description: "Hit Copy Code and paste the TSX or JSX directly into your project. No install commands, no version conflicts — the component lands exactly where you need it.",
        tag: "Instant",
    },
    {
        step: "03",
        title: "Customize your props",
        description: "Every component is prop-driven. Change colors, content, animation intensity, and layout through a clean typed interface. IntelliSense gives you every available option.",
        tag: "Flexible",
    },
    {
        step: "04",
        title: "Ship to production",
        description: "Uilora components are SSR-compatible, accessibility-audited, and performance-tested in live Next.js deployments. What you preview is exactly what your users experience.",
        tag: "Ready",
    },
];

export const AccordionFAQTimeline: React.FC<AccordionFAQTimelineProps> = ({
    accentColor = "#818cf8",
    items = DEFAULT_ITEMS,
    title = "How Uilora works",
    eyebrow = "Uilora Workflow",
}) => {
    const [active, setActive] = useState<number | null>(0);

    return (
        <div
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: "#09090b" }}
        >
            {/* Header */}
            <p
                className="text-[10px] font-mono tracking-[0.32em] uppercase mb-1.5"
                style={{ color: accentColor }}
            >
                {eyebrow}
            </p>
            <h2 className="text-white text-xl font-bold mb-8 tracking-tight">{title}</h2>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical connector line */}
                <div
                    className="absolute left-[0.9375rem] top-4 bottom-4 w-px"
                    style={{
                        background: `linear-gradient(to bottom, ${accentColor}50, ${accentColor}10)`,
                    }}
                />

                <div className="space-y-1">
                    {items.map((item, i) => {
                        const isActive = active === i;
                        return (
                            <div key={i} className="relative pl-10">
                                {/* Step dot */}
                                <motion.div
                                    animate={{
                                        background: isActive ? accentColor : "#1a1a1e",
                                        scale: isActive ? 1.15 : 1,
                                    }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute left-0 top-4 w-[1.875rem] h-[1.875rem] rounded-full flex items-center justify-center"
                                    style={{
                                        border: `1px solid ${isActive ? accentColor : "#2a2a2e"}`,
                                        transition: "border-color 0.2s",
                                    }}
                                >
                                    <span
                                        className="text-[9px] font-black font-mono leading-none"
                                        style={{ color: isActive ? "#000000" : "#52525b" }}
                                    >
                                        {item.step}
                                    </span>
                                </motion.div>

                                {/* Trigger */}
                                <button
                                    onClick={() => setActive(isActive ? null : i)}
                                    className="w-full text-left py-3.5"
                                >
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span
                                            className="text-sm font-semibold transition-colors duration-200"
                                            style={{ color: isActive ? "#ffffff" : "#a1a1aa" }}
                                        >
                                            {item.title}
                                        </span>
                                        {item.tag && (
                                            <span
                                                className="text-[9px] font-mono px-1.5 py-0.5 rounded tracking-wider"
                                                style={{
                                                    background: isActive ? accentColor + "18" : "#1f1f22",
                                                    color: isActive ? accentColor : "#52525b",
                                                    border: `1px solid ${isActive ? accentColor + "30" : "transparent"}`,
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                {item.tag}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {/* Description */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div
                                                className="pb-4 rounded-lg px-3 py-3 mb-2"
                                                style={{
                                                    background: accentColor + "08",
                                                    border: `1px solid ${accentColor}14`,
                                                }}
                                            >
                                                <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
