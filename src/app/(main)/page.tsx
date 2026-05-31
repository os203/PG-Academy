'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { AccordionFAQDark } from '@/components/ui/FaqDark';
import { ClipboardCheck, CheckCircle2, Layers, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};

const statContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.6,
    },
  },
};

const statVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="grow flex flex-col w-full bg-transparent">
      
      {/* Hero Section */}
      <section className="relative z-20 w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black/50">
        {/* Video Background */}
        <video 
          ref={(el) => {
            if (el) {
              el.defaultMuted = true;
              el.muted = true;
              el.play().catch(e => console.log("Autoplay prevented:", e));
            }
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/Pg-Academy-Optimized-edited.mp4"
          className="absolute inset-0 w-full h-full object-cover z-1"
        />
        
        {/* Gradient Overlay to fade into the background color below without hiding the video */}
        <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-[#09090b]/80 to-transparent z-2 pointer-events-none" />

        {/* Animated background glow (optional, kept for extra effect) */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1], 
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-[#bd9759] rounded-full blur-[200px] pointer-events-none z-0" 
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-3 flex flex-col items-start w-full mt-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bd9759]/20 backdrop-blur-md mb-8 border border-[#bd9759]/40 text-sm font-medium text-[#bd9759] self-start">
            <Sparkles className="w-4 h-4" />
            {t('home.hero.badge') || "Official Identity"}
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white max-w-4xl text-left self-start drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            {t('home.hero.title')}
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-zinc-100 max-w-2xl mb-12 leading-relaxed text-left self-start drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
            {t('home.hero.subtitle')}
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-start w-full self-start">
            <Link href="/sign-up" className="w-full sm:w-auto gold-btn px-8 py-3.5 rounded-lg font-semibold text-lg flex items-center justify-center shadow-xl hover:shadow-2xl transition-all group">
              {t('home.hero.cta')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:mr-2 rtl:ml-0" />
            </Link>
            <Link href="/tracks" className="w-full sm:w-auto gold-outline-btn bg-background/20 backdrop-blur-sm px-8 py-3.5 rounded-lg text-lg flex items-center justify-center hover:bg-background/60 transition-all border-[#bd9759]">
              {t('home.hero.exploreTracks')}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Rest of the Page */}
      <div className="relative w-full overflow-hidden">
        {/* Background Art for the rest of the page */}
        <div className="absolute inset-0 z-1 pointer-events-none">
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#bd9759]/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#bd9759]/3 rounded-full blur-[150px]" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-32 relative z-10 flex flex-col items-start w-full"
        >

        {/* How the learning process works */}
        <motion.div
          variants={statContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full mt-40"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">{t('home.howItWorks')}</h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">{t('home.howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ClipboardCheck className="w-5 h-5 text-[#bd9759]" />,
                title: t('home.step1.title'),
                desc: t('home.step1.desc')
              },
              {
                icon: <CheckCircle2 className="w-5 h-5 text-[#bd9759]" />,
                title: t('home.step2.title'),
                desc: t('home.step2.desc')
              },
              {
                icon: <Layers className="w-5 h-5 text-[#bd9759]" />,
                title: t('home.step3.title'),
                desc: t('home.step3.desc')
              },
              {
                icon: <GraduationCap className="w-5 h-5 text-[#bd9759]" />,
                title: t('home.step4.title'),
                desc: t('home.step4.desc')
              }
            ].map((step, i) => (
              <motion.div key={i} variants={statVariants} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 hover:border-[#bd9759]/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#bd9759]/10 flex items-center justify-center mb-6 border border-[#bd9759]/20">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tracks Grid */}
        <motion.div
          variants={statContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full mt-40"
        >
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.tracks.subtitle')}</h2>
            <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
              {t('home.tracks.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                id: "01", 
                title: t("home.track1.title"), 
                subtitle: t("home.track1.subtitle"),
                bullet1: t("home.track1.bullet1"),
                bullet2: t("home.track1.bullet2"),
                desc: t("home.track1.desc"),
                bgImg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
              },
              { 
                id: "02", 
                title: t("home.track2.title"), 
                subtitle: t("home.track2.subtitle"),
                bullet1: t("home.track2.bullet1"),
                bullet2: t("home.track2.bullet2"),
                desc: t("home.track2.desc"),
                bgImg: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
              },
              { 
                id: "03", 
                title: t("home.track3.title"), 
                subtitle: t("home.track3.subtitle"),
                bullet1: t("home.track3.bullet1"),
                bullet2: t("home.track3.bullet2"),
                desc: t("home.track3.desc"),
                bgImg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
              },
              { 
                id: "04", 
                title: t("home.track4.title"), 
                subtitle: t("home.track4.subtitle"),
                bullet1: t("home.track4.bullet1"),
                bullet2: t("home.track4.bullet2"),
                desc: t("home.track4.desc"),
                bgImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
              }
            ].map((track, i) => (
              <motion.div
                key={i}
                variants={statVariants}
                className="bg-zinc-950/90 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-[#bd9759]/40 transition-all duration-300 flex flex-col p-3 shadow-lg group"
              >
                {/* Image Section */}
                <div className="relative h-56 w-full rounded-xl overflow-hidden mb-5">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${track.bgImg})` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-transparent to-transparent opacity-80" />
                  
                  {/* Top left badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[#bd9759] text-xs font-bold font-mono border border-[#bd9759]/20">
                    {track.id}
                  </div>
                  
                  {/* Center Titles */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 text-center px-2">
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{track.title}</h3>
                    <p className="text-xs text-white/90 font-medium drop-shadow-md">{track.subtitle}</p>
                  </div>
                  
                  {/* Bottom Bullets */}
                  <div className="absolute bottom-3 left-4 right-4 text-[10px] sm:text-xs text-zinc-300 space-y-1.5 font-medium">
                    <p className="flex items-center gap-1.5"><span className="text-[#bd9759] text-[10px]">▶</span> {track.bullet1}</p>
                    <p className="flex items-center gap-1.5"><span className="text-[#bd9759] text-[10px]">▶</span> {track.bullet2}</p>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="px-2 pb-2 flex flex-col grow justify-between">
                  <div>
                    <div className="text-[#bd9759] font-mono text-xs font-bold mb-1.5 tracking-wider">{track.id}</div>
                    <h4 className="text-lg font-bold text-white mb-2.5">{track.title}</h4>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                      {track.desc}
                    </p>
                  </div>
                  <Link href="/sign-up" className="inline-flex items-center justify-center bg-[#bd9759] hover:bg-[#a6844b] text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-colors w-fit">
                    {t('home.exploreTrack')} <span className="mx-2">→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Student Testimonials */}
        <motion.div
          variants={statContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full mt-40"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">{t('home.testimonials')}</h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">{t('home.testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: t('home.testimonial1.name'),
                role: t('home.testimonial1.role'),
                quote: t('home.testimonial1.quote'),
              },
              {
                name: t('home.testimonial2.name'),
                role: t('home.testimonial2.role'),
                quote: t('home.testimonial2.quote'),
              },
              {
                name: t('home.testimonial3.name'),
                role: t('home.testimonial3.role'),
                quote: t('home.testimonial3.quote'),
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={statVariants}
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 hover:border-[#bd9759]/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-[#bd9759]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <div className="text-[#bd9759] text-2xl font-serif font-bold mb-3 leading-none select-none">&ldquo;&rdquo;</div>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    {testimonial.quote}
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <p className="font-bold text-white text-sm">{testimonial.name}</p>
                  <p className="text-zinc-500 text-xs">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          variants={statContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-40 w-full max-w-5xl mx-auto flex flex-col gap-6 pb-20 px-4 sm:px-6"
        >
          {/* FAQ Card */}
          <div className="rounded-3xl border border-[#bd9759]/20 bg-[#0a0805]/80 p-8 md:p-12 shadow-2xl shadow-black">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">{t('home.faq')}</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { q: t('home.faq.q1'), a: t('home.faq.a1') },
                { q: t('home.faq.q2'), a: t('home.faq.a2') },
                { q: t('home.faq.q3'), a: t('home.faq.a3') },
                { q: t('home.faq.q4'), a: t('home.faq.a4') },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-[#bd9759]/15 bg-black/40 p-6 hover:border-[#bd9759]/30 transition-colors">
                  <h3 className="text-base font-bold text-white mb-3">{item.q}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="rounded-2xl border border-[#bd9759]/20 bg-[#0a0805]/80 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-black">
            <p className="text-[15px] text-zinc-200 font-medium">{t('home.faq.cta')}</p>
            <Link 
              href="/sign-up"
              className="gold-btn px-6 py-3 rounded-lg text-sm font-semibold shrink-0"
            >
              {t('home.hero.cta')}
            </Link>
          </div>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
