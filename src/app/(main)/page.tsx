'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

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
      delayChildren: 0.6, // Wait for hero to animate in
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
  return (
    <div className="grow flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1], 
          opacity: [0.15, 0.25, 0.15],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-brand-accent rounded-full blur-[120px] mix-blend-screen pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.15, 0.3, 0.15],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-brand-primary rounded-full blur-[120px] mix-blend-screen pointer-events-none" 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 flex flex-col items-center text-center"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-brand-accent/30 text-sm font-medium text-brand-accent">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          The Arab-First AI Learning Platform
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground max-w-4xl">
          Master Your Future with{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-accent to-brand-primary">
            Intelligent Learning
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-foreground/70 max-w-2xl mb-12 leading-relaxed">
          Unlock your potential with PG Academy. Enjoy secure, culturally-tailored tracks powered by AI, and earn verified credentials on your schedule.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
          <Link href="/tracks" className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-semibold text-lg transition-all hover-lift shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2">
            Explore Tracks
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href="/about" className="w-full sm:w-auto px-8 py-4 glass border border-white/10 hover:border-brand-accent/50 text-foreground rounded-full font-semibold text-lg transition-all hover-lift flex items-center justify-center">
            Learn More
          </Link>
        </motion.div>

        {/* Feature stats */}
        <motion.div 
          variants={statContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 w-full max-w-4xl mx-auto border-t border-white/5 pt-12"
        >
          {[
            { value: "AI", label: "Smart Assistant" },
            { value: "100%", label: "Data Sovereignty" },
            { value: "HLS", label: "Secure Streaming" },
            { value: "QR", label: "Verified Certificates" }
          ].map((stat, i) => (
            <motion.div key={i} variants={statVariants} className="flex flex-col items-center">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-accent to-brand-primary mb-2">
                {stat.value}
              </span>
              <span className="text-sm text-foreground/60 font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
