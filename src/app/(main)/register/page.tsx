"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, ClipboardList, ArrowRight } from "lucide-react";import { useLanguage } from "@/context/LanguageContext";

export default function RegisterLandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/80 rounded-[2rem] p-8 md:p-16 shadow-2xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#bd9759]/30 bg-[#bd9759]/10 text-[#bd9759] text-sm font-medium mb-8">
            <UserPlus className="w-4 h-4" />
            {t("register.badge")}
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("register.title")}
          </h1>

          {/* Subheading */}
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl leading-relaxed mb-12">
            {t("register.desc")}
          </p>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Step 1 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#bd9759] mb-6">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t("register.step1.title")}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {t("register.step1.desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#bd9759] mb-6">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t("register.step2.title")}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {t("register.step2.desc")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/sign-up" 
              className="w-full sm:w-auto bg-[#bd9759] hover:bg-[#a6844b] text-black font-bold px-8 py-3.5 rounded-lg transition-colors flex items-center justify-center"
            >
              {t("register.btnPrimary")}
            </Link>
            
            <Link 
              href="/sign-in" 
              className="w-full sm:w-auto bg-transparent hover:bg-zinc-900 border border-zinc-700 text-white font-medium px-8 py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 group"
            >
              {t("register.btnSecondary")}
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
