"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
    question: string;
    answer: string;
    points?: string[];
}

interface AccordionFAQLightProps {
    accentColor?: string;
    items?: FAQItem[];
    title?: string;
    subtitle?: string;
}

const DEFAULT_ITEMS: FAQItem[] = [
    {
        question: "When and how should it be used?",
        answer: "Use this accordion when you need clean, accessible content disclosure that doesn't compete with the main page hierarchy.",
        points: ["FAQ pages and documentation", "Product feature breakdowns", "Onboarding and setup guides"],
    },
    {
        question: "What makes Uilora components different?",
        answer: "Uilora prioritizes motion craft and code ownership above all. You get components that are readable, extensible, and yours.",
        points: ["Named exports, no black-box APIs", "Full TypeScript with strict props", "Zero framework-specific lock-in"],
    },
    {
        question: "How do I customize colors and spacing?",
        answer: "Pass hex, rgb, or hsl strings to any color prop. Every visual variable is exposed at the component interface level.",
        points: ["accentColor controls all highlights", "Background, border, text — all configurable", "Animation intensity is a numeric prop"],
    },
    {
        question: "Is this production-ready out of the box?",
        answer: "Every Uilora component is SSR-compatible, WCAG-audited, and tested in live Next.js deployments before shipping.",
        points: ["Server-side rendering safe", "No hydration mismatches", "Accessible keyboard navigation"],
    },
];

export const AccordionFAQLight: React.FC<AccordionFAQLightProps> = ({
    accentColor = "#6366f1",
    items = DEFAULT_ITEMS,
    title = "Uilora Components",
    subtitle = "A vertically stacked set of items. Each expands to reveal its associated content, then collapses to preserve density.",
}) => {
    const [active, setActive] = useState<number | null>(2);

    return (
        <div
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{
                background: "#ffffff",
                boxShadow: "0 4px 40px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
            }}
        >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
                <h2 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">{title}</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">{subtitle}</p>
            </div>

            {/* Items */}
            <div>
                {items.map((item, i) => {
                    const isActive = active === i;
                    return (
                        <div
                            key={i}
                            className="border-b border-zinc-100 last:border-b-0"
                        >
                            {/* Trigger */}
                            <button
                                onClick={() => setActive(isActive ? null : i)}
                                className="w-full flex items-center gap-4 px-8 py-5 text-left transition-colors hover:bg-zinc-50"
                            >
                                <motion.div
                                    animate={{ rotate: isActive ? 45 : 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-200"
                                    style={{
                                        borderColor: isActive ? accentColor : "#d4d4d8",
                                        background: isActive ? accentColor + "10" : "transparent",
                                    }}
                                >
                                    <span
                                        className="text-xs font-bold leading-none"
                                        style={{ color: isActive ? accentColor : "#71717a" }}
                                    >
                                        +
                                    </span>
                                </motion.div>
                                <span className="text-sm font-medium text-zinc-800">{item.question}</span>
                            </button>

                            {/* Content */}
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
                                            className="px-8 pb-5"
                                            style={{ paddingLeft: "4.5rem", background: "#fafafa" }}
                                        >
                                            {item.points && (
                                                <div className="space-y-1.5 mb-3">
                                                    {item.points.map((pt, pi) => (
                                                        <div key={pi} className="flex items-center gap-2">
                                                            <div
                                                                className="w-1 h-1 rounded-full flex-shrink-0"
                                                                style={{ background: accentColor }}
                                                            />
                                                            <span className="text-xs font-medium text-zinc-600">
                                                                {pt}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                                                {item.answer}
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="text-xs font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                                                style={{ background: accentColor }}
                                            >
                                                Learn more
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
