"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 ml-2"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#bd9759] hover:text-[#a6844b] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("nav.backToHome")}
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/80 rounded-[2rem] p-8 md:p-16 shadow-2xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#bd9759]/30 bg-[#bd9759]/10 text-[#bd9759] text-sm font-medium mb-8">
            <ShieldCheck className="w-4 h-4" />
            {t("privacy.badge")}
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("privacy.title")}
          </h1>

          {/* Subheading */}
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl leading-relaxed mb-12">
            {t("privacy.desc")}
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Card 1 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-3">{t("privacy.card1.title")}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {t("privacy.card1.desc")}
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-3">{t("privacy.card2.title")}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {t("privacy.card2.desc")}
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-3">{t("privacy.card3.title")}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {t("privacy.card3.desc")}
              </p>
            </div>
            {/* Card 4 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-3">{t("privacy.card4.title")}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {t("privacy.card4.desc")}
              </p>
            </div>
          </div>

          <div className="text-zinc-500 text-sm">
            {t("privacy.lastUpdated")}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
