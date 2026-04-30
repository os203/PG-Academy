"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

interface UiloraFlipRevealProps {
    flipAxis?: "x" | "y";
    accentColor?: string;
    perspective?: number;
}

export const UiloraFlipReveal = ({
    flipAxis = "y",
    accentColor = "#f59e0b",
    perspective = 1200,
}: UiloraFlipRevealProps) => {
    const [flipped, setFlipped] = useState(false);
    const isY = flipAxis === "y";

    const faceBase: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        borderRadius: "24px",
        overflow: "hidden",
    };

    const features = [
        { icon: "⚡", title: "Instant Deploys", desc: "Push to ship in under 30 seconds" },
        { icon: "◈", title: "Component Studio", desc: "Live preview for every component" },
        { icon: "🔒", title: "Team Access", desc: "Unlimited seats, one workspace" },
    ];

    return (
        <div className="min-h-screen bg-[#060406] flex flex-col items-center justify-center relative overflow-hidden">
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "180px 180px",
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${accentColor}0b, transparent)` }}
            />

            {/* The flip card */}
            <div
                className="relative cursor-pointer select-none"
                style={{ perspective: `${perspective}px` }}
                onClick={() => setFlipped(!flipped)}
            >
                <motion.div
                    className="relative w-72 h-[400px]"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{
                        rotateY: isY ? (flipped ? 180 : 0) : 0,
                        rotateX: !isY ? (flipped ? 180 : 0) : 0,
                    }}
                    transition={{ type: "spring", stiffness: 70, damping: 14 }}
                >
                    {/* FRONT */}
                    <div style={faceBase}>
                        <div
                            className="w-full h-full flex flex-col items-center justify-center p-6 relative"
                            style={{
                                background: "linear-gradient(145deg, rgba(35,25,45,0.95), rgba(10,8,15,0.98))",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <div
                                className="absolute inset-0 rounded-3xl pointer-events-none"
                                style={{ background: `radial-gradient(ellipse 60% 55% at 50% 30%, ${accentColor}14, transparent)` }}
                            />
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                                style={{
                                    background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                                    border: `1px solid ${accentColor}30`,
                                    boxShadow: `0 0 40px ${accentColor}12`,
                                }}
                            >
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <h3 className="text-white font-black text-xl tracking-tight mb-2 relative">Uilora Pro</h3>
                            <p className="text-zinc-500 text-sm text-center max-w-[180px] leading-relaxed relative">
                                Flip to unlock everything included in your plan
                            </p>
                            <div
                                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold relative"
                                style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}38`, color: accentColor }}
                            >
                                <span>Click to reveal</span>
                                <span>→</span>
                            </div>
                        </div>
                    </div>

                    {/* BACK */}
                    <div style={{ ...faceBase, transform: isY ? "rotateY(180deg)" : "rotateX(180deg)" }}>
                        <div
                            className="w-full h-full flex flex-col p-6 relative"
                            style={{
                                background: "linear-gradient(145deg, rgba(30,22,8,0.98), rgba(10,8,5,0.99))",
                                border: `1px solid ${accentColor}22`,
                            }}
                        >
                            <div
                                className="absolute inset-0 rounded-3xl pointer-events-none"
                                style={{ background: `radial-gradient(ellipse 50% 50% at 50% 20%, ${accentColor}10, transparent)` }}
                            />
                            <div className="flex items-center gap-2 mb-6 relative">
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}38` }}
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill={accentColor}>
                                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                    </svg>
                                </div>
                                <span className="text-white font-bold text-sm">Uilora Pro Includes</span>
                            </div>

                            <div className="space-y-4 flex-1 relative">
                                {features.map(({ icon, title, desc }) => (
                                    <div key={title} className="flex items-start gap-3">
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                                        >
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{title}</p>
                                            <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="w-full py-3 rounded-2xl font-bold text-sm relative mt-4"
                                style={{
                                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}90)`,
                                    color: "#050301",
                                    boxShadow: `0 0 30px ${accentColor}28`,
                                }}
                            >
                                Upgrade to Uilora Pro →
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <p className="absolute bottom-8 text-zinc-700 text-xs tracking-wide">Click to flip</p>
        </div>
    );
};
