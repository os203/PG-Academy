"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
    question: string;
    answer: string;
}

interface AccordionFAQDarkProps {
    accentColor?: string;
    items?: FAQItem[];
    title?: string;
    eyebrow?: string;
}

const DEFAULT_ITEMS: FAQItem[] = [
    {
        question: "What is Uilora?",
        answer: "Uilora is a premium component library for React and Next.js. Every component ships with production-grade motion, accessible markup, and Tailwind CSS styling — crafted to drop directly into real projects without modification.",
    },
    {
        question: "How do I install a component?",
        answer: "Copy the component source from the Uilora library directly into your codebase. No npm package, no locked API — you own the code the moment you paste it. The CLI copies it straight to your components folder.",
    },
    {
        question: "Does Uilora support TypeScript?",
        answer: "Every component ships in both TypeScript and JavaScript variants. All props are fully typed with strict interfaces, providing complete IntelliSense coverage in VS Code and JetBrains IDEs.",
    },
    {
        question: "Can I customize the visual design?",
        answer: "Fully. Every color, spacing, and animation parameter is exposed as a typed prop. Uilora components are designed to be forked and extended — not locked into a preset design system or forced theme.",
    },
    {
        question: "Which frameworks does Uilora support?",
        answer: "Uilora targets React 18+ and Next.js 13+. Any React-based framework — Remix, Vite, Astro — works out of the box since components carry no framework-specific runtime dependencies.",
    },
];

export const AccordionFAQDark: React.FC<AccordionFAQDarkProps> = ({
    accentColor = "#a78bfa",
    items = DEFAULT_ITEMS,
    title = "Frequently Asked",
    eyebrow = "Uilora Support",
}) => {
    const [active, setActive] = useState<number | null>(0);

    return (
        <div
            className="w-full max-w-2xl rounded-2xl p-6"
            style={{ background: "#0f0f12" }}
        >
            {/* Header */}
            <div className="mb-7">
                <p
                    className="text-[10px] font-mono tracking-[0.32em] uppercase mb-2"
                    style={{ color: accentColor }}
                >
                    {eyebrow}
                </p>
                <h2 className="text-white text-2xl font-bold tracking-tight">{title}</h2>
            </div>

            {/* Items */}
            <div className="space-y-2">
                {items.map((item, i) => {
                    const isActive = active === i;
                    return (
                        <motion.div
                            key={i}
                            layout
                            className="rounded-xl overflow-hidden cursor-pointer"
                            style={{
                                background: isActive ? "#18181c" : "#141417",
                                border: `1px solid ${isActive ? accentColor + "35" : "#ffffff0c"}`,
                                boxShadow: isActive
                                    ? `0 0 0 1px ${accentColor}15, 0 4px 20px ${accentColor}08`
                                    : "none",
                                transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                            }}
                            onClick={() => setActive(isActive ? null : i)}
                        >
                            {/* Trigger */}
                            <button className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                                <span
                                    className="text-sm font-medium pr-4 leading-snug transition-colors duration-200"
                                    style={{ color: isActive ? "#ffffff" : "#a1a1aa" }}
                                >
                                    {item.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: isActive ? 45 : 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
                                    style={{
                                        background: isActive ? accentColor + "18" : "transparent",
                                        border: `1px solid ${isActive ? accentColor + "50" : "#2a2a30"}`,
                                    }}
                                >
                                    <span
                                        className="text-sm font-bold leading-none"
                                        style={{ color: isActive ? accentColor : "#52525b" }}
                                    >
                                        +
                                    </span>
                                </motion.div>
                            </button>

                            {/* Content */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4">
                                            <div
                                                className="h-px mb-3"
                                                style={{ background: accentColor + "20" }}
                                            />
                                            <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
                                                {item.answer}
                                            </p>
                                            <button
                                                className="mt-3 text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-60"
                                                style={{ color: accentColor }}
                                            >
                                                View more <span>→</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
