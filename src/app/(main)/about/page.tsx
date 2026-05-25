"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowLeft,
  Megaphone,
  Gamepad2,
  Film,
  Clapperboard,
  Rocket,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 16 },
  },
};

// Tracks will be defined inside the component to use the translation hook

export default function AboutPage() {
  const { t } = useLanguage();

  const tracks = [
    {
      icon: Megaphone,
      title: t("tracksHub.track4.title"),
      desc: t("tracksHub.track4.desc"),
    },
    {
      icon: Gamepad2,
      title: t("tracksHub.track3.title"),
      desc: t("tracksHub.track3.desc"),
    },
    {
      icon: Film,
      title: t("tracksHub.track2.title"),
      desc: t("tracksHub.track2.desc"),
    },
    {
      icon: Clapperboard,
      title: t("tracksHub.track1.title"),
      desc: t("tracksHub.track1.desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 overflow-hidden">
      {/* Back Link */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand-primary hover:text-brand-accent transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("nav.backToHome")}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-card border border-border rounded-2xl p-8 md:p-14 relative overflow-hidden"
        >
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-brand-primary/30 text-sm font-medium text-brand-primary">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              {t("about.badge")}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              {t("about.hero.title")}
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              {t("about.hero.p1")}
            </p>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              {t("about.hero.p2")}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Future-Proof Curriculum Tracks */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("about.curriculum.title")}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
            {t("about.curriculum.desc")}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {tracks.map((track, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-card border border-border rounded-2xl p-8 hover:border-brand-primary/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-[#E5C158] mb-6 border border-brand-primary/20 group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all">
                <track.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {track.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {track.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Our Vision and Impact */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="bg-card border border-border rounded-2xl p-8 md:p-14 relative overflow-hidden"
        >
          {/* Subtle glow */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-[#E5C158] border border-brand-primary/20">
              <Rocket className="w-6 h-6" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t("about.vision.title")}
            </h2>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              {t("about.vision.p1.start")}{" "}
              <span className="text-foreground font-semibold">
                {t("about.vision.p1.highlight")}
              </span>{" "}
              {t("about.vision.p1.end")}
            </p>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              {t("about.vision.p2")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/tracks"
                className="px-6 py-3 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-semibold text-sm transition-all shadow-lg"
              >
                {t("home.hero.exploreTracks")}
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-transparent border border-border hover:border-foreground/50 text-foreground rounded-lg font-semibold text-sm transition-all"
              >
                {t("home.hero.cta")}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
