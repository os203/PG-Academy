"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

interface UiloraLightBentoProps {
    title?: string;
    description?: string;
    accentColor?: string;
}

// Smooth bezier SVG path
function smoothPath(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
}

const UiloraLightBento: React.FC<UiloraLightBentoProps> = ({
    title = "Customize at will",
    description = "For anyone to start building their design system, no matter the size of your team.",
    accentColor = "#bbf451",
}) => {
    // ── Line chart ──
    const rawData = [42, 28, 50, 22, 58, 32, 68, 38, 62, 48, 72, 44, 78];
    const CW = 220;
    const CH = 64;

    const pts = useMemo(() => {
        const min = Math.min(...rawData);
        const max = Math.max(...rawData);
        return rawData.map((v, i) => ({
            x: (i / (rawData.length - 1)) * CW,
            y: CH - ((v - min) / (max - min)) * CH * 0.85 - CH * 0.06,
        }));
    }, []);

    const linePath = smoothPath(pts);
    const areaPath = `${linePath} L ${CW} ${CH} L 0 ${CH} Z`;

    const card = {
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)",
    };

    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, delay },
    });

    // ── Logo grid data ──
    const logos = [
        { label: "Ui", bg: "#7c3aed", color: "#fff", shape: "rounded-2xl" },
        { label: "Mc", bg: "#fbbf24", color: "#1a1a1a", shape: "rounded-2xl" },
        { label: "Nt", bg: "#f3f4f6", color: "#374151", shape: "rounded-2xl" },
        { label: "Sk", bg: "#fff", color: "#1a1a1a", border: true, shape: "rounded-2xl" },
        { label: "Zd", bg: "#fff", color: "#1a1a1a", border: true, shape: "rounded-2xl" },
        { label: "Zp", bg: "#fff", color: "#1a1a1a", border: true, shape: "rounded-2xl" },
        { label: "Rm", bg: "#fff", color: "#1a1a1a", border: true, shape: "rounded-2xl" },
    ];

    return (
        <div
            className="w-full min-h-screen p-6 md:p-10 font-sans"
            style={{ backgroundColor: "#f1f2f4" }}
        >
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-4">

                {/* ── Card A: Portfolio + Pie chart ── */}
                <motion.div {...fadeUp(0)} className="md:col-span-3 p-6" style={card}>

                    {/* Inner portfolio card */}
                    <div
                        className="rounded-2xl p-4 mb-5 flex gap-4 items-start"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #f0f0f2" }}
                    >
                        {/* Left: mini chart */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-800">Your Portfolio</span>
                                <ArrowUpRight size={14} className="text-gray-400 flex-shrink-0" />
                            </div>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-xl font-bold text-gray-900">€ 2.531,55</span>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-semibold text-gray-800"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    +15,5%
                                </span>
                            </div>

                            {/* SVG line chart */}
                            <svg
                                viewBox={`0 0 ${CW} ${CH}`}
                                style={{ width: "100%", height: "52px", overflow: "visible" }}
                            >
                                <defs>
                                    <linearGradient id="ulb-area" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.14" />
                                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#ulb-area)" />
                                <path d={linePath} fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>

                            {/* X axis labels */}
                            <div className="flex justify-between text-[9px] text-gray-400 mt-1 px-0.5">
                                {["2020", "2021", "2022", "2023"].map((y) => (
                                    <span key={y}>{y}</span>
                                ))}
                            </div>
                        </div>

                        {/* Right: donut pie chart */}
                        <div
                            className="flex flex-col items-center gap-2 pl-4 flex-shrink-0"
                            style={{ borderLeft: "1px solid #f0f0f2" }}
                        >
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">Your assets</span>
                            <div className="relative" style={{ width: 72, height: 72 }}>
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{
                                        background: `conic-gradient(
                                            ${accentColor} 0deg 132deg,
                                            #a855f7 132deg 244deg,
                                            #d1d5db 244deg 316deg,
                                            #1a1a1a 316deg 360deg
                                        )`,
                                    }}
                                />
                                {/* Donut hole */}
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div
                                        className="bg-white rounded-full"
                                        style={{ width: 28, height: 28 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">Explore 700+ components</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Start building your product with Uilora's production-ready components, no matter your stack.
                    </p>
                </motion.div>

                {/* ── Card B: Installs + Expected reach ── */}
                <motion.div {...fadeUp(0.1)} className="md:col-span-3 p-6" style={card}>

                    {/* Transaction rows */}
                    <div className="space-y-0 mb-4">
                        {[
                            { icon: "↓", label: "Component install", amount: "+ 120", positive: true },
                            { icon: "↓", label: "Component install", amount: "+ 85",  positive: true },
                            { icon: "↑", label: "Package removed",   amount: "− 1,540", positive: false },
                        ].map((row, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-3"
                                style={{ borderBottom: "1px solid #f4f4f6" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-gray-500"
                                        style={{ backgroundColor: "#f4f4f6" }}
                                    >
                                        {row.icon}
                                    </div>
                                    <span className="text-sm text-gray-600">{row.label}</span>
                                </div>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: row.positive ? "#1a1a1a" : "#ef4444" }}
                                >
                                    {row.amount}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Expected reach card */}
                    <div
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: "#f8f8fb", border: "1px solid #ededf0" }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    <CheckCircle2 size={15} className="text-gray-800" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Expected reach</span>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium text-purple-700 bg-purple-100">
                                36 months
                            </span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-gray-900">+ 12K installs</div>
                            <ArrowUpRight size={18} className="text-gray-400 mb-0.5" />
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Earn while you build</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Track component adoption and usage across your team's products in real time.
                    </p>
                </motion.div>

                {/* ── Card C: Lime green CTA ── */}
                <motion.div
                    {...fadeUp(0.2)}
                    className="md:col-span-2 rounded-3xl p-5 flex flex-col justify-between"
                    style={{
                        backgroundColor: accentColor,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)",
                    }}
                >
                    {/* Mini white card */}
                    <div
                        className="rounded-2xl p-4 mb-4"
                        style={{ backgroundColor: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.09)" }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Component usage</span>
                            <span className="text-xs text-purple-600 cursor-pointer">View more</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-3">€ 2.530,10</div>

                        {/* Dark CTA button */}
                        <button
                            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                            style={{ backgroundColor: "#111111" }}
                        >
                            Install Uilora
                            <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                            >
                                S
                            </span>
                        </button>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1.5">{title}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                    </div>
                </motion.div>

                {/* ── Card D: Code block ── */}
                <motion.div
                    {...fadeUp(0.3)}
                    className="md:col-span-2 rounded-3xl overflow-hidden flex flex-col"
                    style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)" }}
                >
                    {/* Dark code area */}
                    <div className="flex-1 p-5" style={{ backgroundColor: "#0d1117" }}>
                        <div className="font-mono text-[11px] leading-[1.75]">
                            {[
                                [{ t: " 1", c: "#3c4048" }, { t: "  // Protocol", c: "#6a9955" }],
                                [{ t: " 2", c: "#3c4048" }, { t: "  import ", c: "#c678dd" }, { t: "{ BentoGrid,", c: "#abb2bf" }],
                                [{ t: " 3", c: "#3c4048" }, { t: "    Button } ", c: "#abb2bf" }, { t: "from ", c: "#c678dd" }, { t: "'uilora'", c: "#98c379" }],
                                [{ t: " 4", c: "#3c4048" }, { t: "", c: "" }],
                                [{ t: " 5", c: "#3c4048" }, { t: "  // Efficiency", c: "#6a9955" }],
                                [{ t: " 6", c: "#3c4048" }, { t: "  export ", c: "#c678dd" }, { t: "default ", c: "#c678dd" }, { t: "fn", c: "#61afef" }],
                                [{ t: " 7", c: "#3c4048" }, { t: "    App() {", c: "#abb2bf" }],
                                [{ t: " 8", c: "#3c4048" }, { t: "  // Shield", c: "#6a9955" }],
                                [{ t: " 9", c: "#3c4048" }, { t: "  return ", c: "#c678dd" }, { t: "<", c: "#abb2bf" }, { t: "BentoGrid", c: "#e06c75" }, { t: " />", c: "#abb2bf" }],
                                [{ t: "10", c: "#3c4048" }, { t: "  }", c: "#abb2bf" }],
                            ].map((line, i) => (
                                <div key={i} className="flex">
                                    {line.map((tk, j) => (
                                        <span
                                            key={j}
                                            style={{
                                                color: tk.c,
                                                marginRight: j === 0 ? "12px" : undefined,
                                                flexShrink: j === 0 ? 0 : undefined,
                                            }}
                                        >
                                            {tk.t}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* White label at bottom */}
                    <div className="bg-white px-5 py-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Secure and reliable</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Every Uilora component is production-tested, typed, and battle-hardened.
                        </p>
                    </div>
                </motion.div>

                {/* ── Card E: Logo integration grid ── */}
                <motion.div {...fadeUp(0.4)} className="md:col-span-2 p-5" style={card}>

                    {/* Top row — 3 big logo cards */}
                    <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                        {[
                            { label: "Ui", bg: "#7c3aed", color: "#fff", size: "text-xl" },
                            { label: "🐵", bg: "#fff8f0", color: "#1a1a1a", size: "text-xl" },
                            { label: "N", bg: "#f3f4f6", color: "#374151", size: "text-xl font-black" },
                        ].map(({ label, bg, color, size }, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl flex items-center justify-center ${size} font-bold`}
                                style={{
                                    backgroundColor: bg,
                                    color,
                                    height: 64,
                                    border: "1px solid rgba(0,0,0,0.06)",
                                }}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Bottom row — 4 smaller logo cards */}
                    <div className="grid grid-cols-4 gap-2 mb-5">
                        {[
                            { label: "#", bg: "#4a154b", color: "#fff" },
                            { label: "Z", bg: "#03363d", color: "#fff" },
                            { label: "✳", bg: "#ff4a00", color: "#fff" },
                            { label: "◎", bg: "#f3f4f6", color: "#374151" },
                        ].map(({ label, bg, color }, i) => (
                            <div
                                key={i}
                                className="rounded-2xl flex items-center justify-center text-sm font-bold"
                                style={{
                                    backgroundColor: bg,
                                    color,
                                    height: 52,
                                    border: "1px solid rgba(0,0,0,0.06)",
                                }}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">100% integrated</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Easily connect Uilora with your design tools, frameworks, and existing workflows.
                    </p>
                </motion.div>

            </div>
        </div>
    );
};

export default UiloraLightBento;
