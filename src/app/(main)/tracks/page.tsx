"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function CoursesPage() {
  const { t } = useLanguage();

  const specializedTracks = [
    { 
      id: "01", 
      title: t("tracksHub.track1.title"), 
      subtitle: t("tracksHub.track1.subtitle"),
      desc: t("tracksHub.track1.desc"),
      bgImg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
      overlay: "from-zinc-950/90 to-transparent"
    },
    { 
      id: "02", 
      title: t("tracksHub.track2.title"), 
      subtitle: t("tracksHub.track2.subtitle"),
      desc: t("tracksHub.track2.desc"),
      bgImg: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
      overlay: "from-zinc-950/90 to-transparent"
    },
    { 
      id: "03", 
      title: t("tracksHub.track3.title"), 
      subtitle: t("tracksHub.track3.subtitle"),
      desc: t("tracksHub.track3.desc"),
      bgImg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      overlay: "from-zinc-950/90 to-transparent"
    },
    { 
      id: "04", 
      title: t("tracksHub.track4.title"), 
      subtitle: t("tracksHub.track4.subtitle"),
      desc: t("tracksHub.track4.desc"),
      bgImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
      overlay: "from-zinc-950/90 to-transparent"
    }
  ];

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative bg-transparent">
      {/* Background Starfield/Particles Effect (simulated with CSS) */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, hsl(var(--foreground)/0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1340px] mx-auto px-6 py-20 relative z-10">
        
        {/* Top Header Section */}
        <div className="max-w-4xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 backdrop-blur-md mb-8 border border-[#bd9759]/30 text-sm font-medium text-[#bd9759]">
            <span className="w-2 h-2 rounded-full bg-[#bd9759] animate-pulse" />
            {t("tracksHub.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight text-foreground drop-shadow-sm">
            {t("tracksHub.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl drop-shadow-sm">
            {t("tracksHub.desc")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-lg bg-[#bd9759] text-black font-bold hover:bg-[#a6844c] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {t("tracksHub.btnApply")}
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 rounded-lg border border-border bg-foreground/5 text-foreground font-bold hover:bg-foreground/10 transition-all backdrop-blur-sm"
            >
              {t("tracksHub.btnDiscover")}
            </Link>
          </div>
        </div>

        {/* Tracks Grid Section */}
        <div>
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("tracksHub.grid.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
              {t("tracksHub.grid.desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specializedTracks.map((track, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 15, delay: i * 0.1 }}
                className="bg-zinc-900/60 rounded-2xl overflow-hidden border border-zinc-800 hover:border-[#bd9759]/30 transition-all duration-300 flex flex-col shadow-sm"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${track.bgImg})` }}
                  />
                  <div className={`absolute inset-0 bg-linear-to-b ${track.overlay}`} />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <span className="absolute top-4 inset-s-4 text-[#bd9759] font-mono text-sm font-bold bg-[#bd9759]/10 px-2 py-1 rounded border border-[#bd9759]/20">
                      {track.id}
                    </span>
                    <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-lg">
                      {track.title}
                    </h3>
                    <p className="text-white/80 font-medium tracking-widest text-xs uppercase">
                      {track.subtitle}
                    </p>
                  </div>
                </div>
                
                <div className="p-8 grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-3">{track.title}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                      {track.desc}
                    </p>
                  </div>
                  <Link href="/register" className="inline-flex self-start items-center gold-btn px-6 py-2.5 rounded-lg text-sm font-semibold">
                    {t("tracksHub.startRegistration")}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}