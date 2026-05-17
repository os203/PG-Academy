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

const tracks = [
  {
    icon: Megaphone,
    title: "AI Marketing",
    desc: "Master the integration of artificial intelligence into campaign strategies, data analysis, and brand engagement to revolutionize modern marketing.",
  },
  {
    icon: Gamepad2,
    title: "AI Gaming",
    desc: "Learn to build immersive, intelligent game environments and streamline complex development pipelines using next-generation AI tools.",
  },
  {
    icon: Film,
    title: "AI Filmmaking",
    desc: "Transform digital storytelling by integrating AI at every stage of production, from initial concept and scriptwriting to advanced post-production and visual effects.",
  },
  {
    icon: Clapperboard,
    title: "AI Animation",
    desc: "Master AI-powered animation pipelines and produce broadcast-quality animated content from character design to final render.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 overflow-hidden">
      {/* Back Link */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand-primary hover:text-brand-accent transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to homepage
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
              About Us
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Empowering the Next Generation of Creative Leaders
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              At PG Academy, our goal is clear: to train the next generation of
              animators, game developers, marketers, and digital content creators
              to lead the industry on a global stage.
            </p>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              Born from Progressive Generation Studios, which proudly stands at
              the forefront of the animation industry and hosts the largest
              library of original Arabic children&apos;s content in the MENA
              region, PG Academy was established to embed our core values of
              technology, innovation, and creativity into a formal educational
              framework.
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
            Future-Proof Curriculum Tracks
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
            We believe in pushing the boundaries of digital content creation. Our
            specialized curriculum tracks are designed to take students from
            foundational concepts to advanced, industry-standard production.
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
              Our Vision and Impact
            </h2>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              PG Academy is more than just an educational institution; it is a
              catalyst for regional growth. By training young talent in Jordan
              and across the Middle East, we are actively working toward a
              massive economic and creative milestone: creating{" "}
              <span className="text-foreground font-semibold">
                50,000 job opportunities
              </span>{" "}
              within the creative industries in the MENA region by 2030.
            </p>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              Whether you are looking to master animation, pioneer new game
              worlds, or embrace emerging digital marketing technologies, PG
              Academy is your launchpad. Join us, and become the future of
              digital content.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/tracks"
                className="px-6 py-3 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-semibold text-sm transition-all shadow-lg"
              >
                Explore Tracks
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-transparent border border-border hover:border-foreground/50 text-foreground rounded-lg font-semibold text-sm transition-all"
              >
                Start Registration
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
