"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
    id: string;
    label: string;
    content?: React.ReactNode;
}

interface AccordionLiquidProps {
    items?: AccordionItem[];
    backgroundColor?: string;
    containerBgColor?: string;
    containerShadowColor?: string;
    itemBgColor?: string;
    itemTextColor?: string;
    contentTextColor?: string;
    iconColor?: string;
    defaultActive?: number | null;
    borderRadius?: string;
}

const AccordionLiquid: React.FC<AccordionLiquidProps> = ({
    items = [
        { id: "1", label: "What is Uilora?", content: "Uilora is a premium React and Next.js component library focused on motion craft and code ownership. Copy the source, own the code, ship with confidence." },
        { id: "2", label: "How does installation work?", content: "There is no npm package. Browse a component, copy its TSX or JSX source directly into your project, and it's yours to modify. The CLI automates the copy step." },
        { id: "3", label: "Is it TypeScript-first?", content: "Every component ships in both TSX and JSX with full prop interfaces. IntelliSense coverage across all color, animation, and content props is guaranteed." },
    ],
    backgroundColor = "transparent",
    containerBgColor = "#ffffff",
    containerShadowColor = "rgba(0,0,0,0.08)",
    itemBgColor = "#f4f4f5",
    itemTextColor = "#18181b",
    contentTextColor = "#71717a",
    iconColor = "#18181b",
    defaultActive = 0,
    borderRadius = "1rem",
}) => {
    const [active, setActive] = useState<number | null>(defaultActive);
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div
            className="w-full max-w-md p-4"
            style={{
                backgroundColor: containerBgColor,
                borderRadius,
                boxShadow: `0 20px 40px -8px ${containerShadowColor}, 0 8px 16px -4px ${containerShadowColor}`,
            }}
        >
            <div style={{ backgroundColor }}>
                {items.map((item, i) => (
                    <motion.div
                        key={item.id}
                        className="mb-2 overflow-hidden rounded-xl"
                        style={{
                            backgroundColor: itemBgColor,
                            boxShadow: hovered === i && active !== i
                                ? "0 2px 8px rgba(0,0,0,0.06)"
                                : "none",
                            transition: "box-shadow 0.15s ease",
                        }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <motion.button
                            onClick={() => setActive(active === i ? null : i)}
                            className="flex w-full items-center justify-between p-4 font-bold"
                            style={{ color: itemTextColor }}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.15 }}
                        >
                            <span className="text-sm">{item.label}</span>
                            <motion.div
                                animate={{ rotate: active === i ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                            >
                                <ChevronDown size={16} style={{ color: iconColor }} />
                            </motion.div>
                        </motion.button>
                        <AnimatePresence>
                            {active === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                                >
                                    <div className="px-4 pb-4 pt-0 text-sm leading-relaxed" style={{ color: contentTextColor }}>
                                        {item.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AccordionLiquid;
