"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Flag, Zap } from "lucide-react";

interface TimelineItem {
    year: string;
    title: string;
    desc: string;
    category: string;
}

interface TimelineGlassProps {
    items?: TimelineItem[];
    backgroundColor?: string;
    cardBgColor?: string;
    borderColor?: string;
    accentColor?: string;
}

const GlassCard = ({ item, index, cardBgColor, borderColor, accentColor }: { item: TimelineItem, index: number, cardBgColor: string, borderColor: string, accentColor: string }) => {
    const icons = [Star, Zap, Zap, Zap, Zap, Flag];
    const Icon = icons[index] || Zap;

    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            viewport={{ margin: "-100px" }}
            className={`relative flex ${index % 2 === 0 ? "justify-start" : "justify-end"} mb-12`}
        >
            <div className={`w-full md:w-[45%] p-8 rounded-[2rem] border backdrop-blur-xl shadow-2xl relative group overflow-hidden`} style={{ backgroundColor: cardBgColor, borderColor: borderColor }}>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" style={{ backgroundColor: `${accentColor}4d` }} />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-light text-white">{item.year}</span>
                        <div className="p-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                            <Icon size={16} className="text-white" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                    <p className="text-white/60 font-light leading-relaxed">{item.desc}</p>
                </div>
            </div>
        </motion.div>
    );
};

const TimelineGlass: React.FC<TimelineGlassProps> = ({
    items = [
        { year: "2020", title: "The Inception", desc: "A humble beginning in a garage, fueled by caffeine and code.", category: "Origin" },
        { year: "2021", title: "First Round", desc: "Secured seed funding and expanded the team to 10 dreamers.", category: "Growth" },
        { year: "2022", title: "Global Launch", desc: "Released version 1.0 to the world. Servers crashed, we celebrated.", category: "Product" },
        { year: "2023", title: "The Pivot", desc: "Realized our true calling. Shifted focus to AI-driven solutions.", category: "Strategy" },
        { year: "2024", title: "Unicorn Status", desc: "Valuation hit the magic number. The work has only just begun.", category: "Milestone" },
        { year: "2025", title: "Beyond Earth", desc: "Establishing the first orbital office. Sky is no longer the limit.", category: "Future" },
    ],
    backgroundColor = "#0f172a",
    cardBgColor = "rgba(255,255,255,0.05)",
    borderColor = "rgba(255,255,255,0.1)",
    accentColor = "#a855f7",
}) => {
    return (
        <div className="min-h-screen py-24 px-4 overflow-hidden flex items-center justify-center" style={{ backgroundColor }}>
            <div className="relative w-full max-w-4xl">
                {items.map((item, i) => (
                    <GlassCard key={i} item={item} index={i} cardBgColor={cardBgColor} borderColor={borderColor} accentColor={accentColor} />
                ))}
            </div>
        </div>
    );
};

export default TimelineGlass;

