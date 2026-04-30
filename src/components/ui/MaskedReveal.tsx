"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface MaskedRevealProps {
    text?: string;
    stagger?: number;
}

export const MaskedReveal = ({
    text = "Orchestrated Chaos",
    stagger = 0.12,
}: MaskedRevealProps) => {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: stagger, delayChildren: 0.04 * i },
        }),
    };

    const child: Variants = {
        visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", damping: 12, stiffness: 100 } },
        hidden: { opacity: 0, y: 50, rotateX: -20, transition: { type: "spring", damping: 12, stiffness: 100 } },
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-zinc-950 overflow-hidden">
            <motion.div
                className="overflow-hidden flex flex-wrap gap-4 justify-center text-6xl md:text-8xl font-bold tracking-tighter px-4"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
            >
                {words.map((word, index) => (
                    <div key={index} className="overflow-hidden pb-4">
                        <motion.span
                            variants={child}
                            className="inline-block origin-bottom bg-clip-text text-transparent bg-gradient-to-b from-zinc-100 to-zinc-500"
                        >
                            {word}
                        </motion.span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
