'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { AccordionFAQDark } from '@/components/ui/FaqDark';
import { ClipboardCheck, CheckCircle2, Layers, GraduationCap } from 'lucide-react';

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
  return (
    <div className="grow flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Art */}
      <div 
        className="absolute inset-0 z-0 opacity-10 dark:opacity-20 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat"
      />
      <div className="absolute inset-0 z-0 bg-linear-to-b from-background/40 via-background/80 to-background" />

      {/* Animated background blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1], 
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-brand-primary rounded-full blur-[150px] dark:mix-blend-screen opacity-50 pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-purple-600 dark:bg-purple-900 rounded-full blur-[150px] dark:mix-blend-screen opacity-50 pointer-events-none z-0" 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 flex flex-col items-start w-full"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 backdrop-blur-md mb-8 border border-brand-primary/30 text-sm font-medium text-brand-primary self-start md:self-center">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          Tracks Hub
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground max-w-4xl text-left md:text-center self-start md:self-center">
          Choose the Right Track for Your Future
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 leading-relaxed text-left md:text-center self-start md:self-center">
          Explore every PG Academy track, review module and lesson depth, then apply to start a guided learning journey built for real career outcomes.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-start md:justify-center w-full self-start md:self-center">
          <Link href="/register" className="w-full sm:w-auto px-8 py-3 bg-[#E5C158] hover:bg-[#D4B047] text-black rounded-lg font-semibold text-lg transition-all shadow-lg flex items-center justify-center">
            Apply Now
          </Link>
          <Link href="/about" className="w-full sm:w-auto px-8 py-3 bg-transparent border border-border hover:border-foreground/50 text-foreground rounded-lg font-semibold text-lg transition-all flex items-center justify-center">
            Discover PG Academy
          </Link>
        </motion.div>

        {/* How the learning process works */}
        <motion.div
          variants={statContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full mt-40"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">How the learning process works</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">A structured sequence that keeps your learning path clear, disciplined, and measurable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ClipboardCheck className="w-5 h-5 text-[#E5C158]" />,
                title: "1) Registration",
                desc: "Create your account and submit the academic enrollment form."
              },
              {
                icon: <CheckCircle2 className="w-5 h-5 text-[#E5C158]" />,
                title: "2) Admission Review",
                desc: "Admissions team reviews your request and approves the right track."
              },
              {
                icon: <Layers className="w-5 h-5 text-[#E5C158]" />,
                title: "3) Sequential Learning",
                desc: "Lessons unlock step by step inside each phase in strict order."
              },
              {
                icon: <GraduationCap className="w-5 h-5 text-[#E5C158]" />,
                title: "4) Quizzes and Certification",
                desc: "Pass required quizzes to validate mastery and complete your track."
              }
            ].map((step, i) => (
              <motion.div key={i} variants={statVariants} className="bg-card border border-border rounded-2xl p-8 hover:border-brand-primary/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-6 border border-brand-primary/20">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Four Specialized Tracks. One Career Path.</h2>
            <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
              Explore PG Academy&apos;s four specialized tracks, choose the one that matches your ambition, and advance through a structured journey built for real career outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                id: "01", 
                title: "AI Animation", 
                subtitle: "Motion Design for the AI Era",
                desc: "Master AI-powered animation pipelines and produce broadcast-quality content from concept to final render.",
                bgImg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
                overlay: "from-blue-900/80 to-transparent"
              },
              { 
                id: "02", 
                title: "AI Filmmaking", 
                subtitle: "Cinematic Storytelling for the AI Era",
                desc: "Create cinematic stories using AI tools across scriptwriting, production, VFX, and post-production.",
                bgImg: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
                overlay: "from-indigo-900/80 to-transparent"
              },
              { 
                id: "03", 
                title: "AI Games", 
                subtitle: "Game Worlds for the AI Era",
                desc: "Design and develop interactive gaming experiences powered by artificial intelligence and creative vision.",
                bgImg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
                overlay: "from-purple-900/80 to-transparent"
              },
              { 
                id: "04", 
                title: "AI Marketing", 
                subtitle: "Performance Marketing for the AI Era",
                desc: "Build high-impact campaigns using AI content generation, data storytelling, and next-gen digital strategy.",
                bgImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
                overlay: "from-pink-900/80 to-transparent"
              }
            ].map((track, i) => (
              <motion.div
                key={i}
                variants={statVariants}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-brand-primary/30 transition-all duration-300 flex flex-col shadow-sm"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${track.bgImg})` }}
                  />
                  <div className={`absolute inset-0 bg-linear-to-b ${track.overlay}`} />
                  
                  {/* Track specific stylized graphic representation */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <span className="absolute top-4 left-4 text-brand-primary font-mono text-sm font-bold bg-brand-primary/10 px-2 py-1 rounded">
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
                    <h4 className="text-xl font-bold text-foreground mb-3">{track.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                      {track.desc}
                    </p>
                  </div>
                  <Link href="/register" className="inline-flex self-start items-center px-6 py-2.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-primary-foreground rounded-lg font-semibold transition-all duration-300 border border-brand-primary/20 hover:border-transparent">
                    Start Registration
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Student Testimonials</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">Hear from our students about their learning journey at PG Academy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Layan Khaled",
                role: "AI Animation Student",
                quote: "For the first time, the curriculum feels directly tied to industry work. Every lesson is clear and every task produces real output.",
              },
              {
                name: "Omar Al Salem",
                role: "AI Filmmaking Student",
                quote: "The sequential system helped me build a structured short-film project without missing steps or losing focus.",
              },
              {
                name: "Nour Hamza",
                role: "AI Marketing Student",
                quote: "Training is highly practical. From concept to execution and measurement, every stage was connected and actionable.",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={statVariants}
                className="bg-card border border-border rounded-2xl p-8 hover:border-brand-primary/30 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Stars */}
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-[#E5C158]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote icon */}
                  <div className="text-[#E5C158] text-2xl font-serif font-bold mb-3 leading-none select-none">&ldquo;&rdquo;</div>

                  {/* Quote text */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                    {testimonial.quote}
                  </p>
                </div>

                {/* Divider + Author */}
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.role}</p>
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
          className="mt-40 w-full flex justify-center pb-20"
        >
          <AccordionFAQDark 
            title="Frequently Asked Questions"
            eyebrow="PG Academy Support"
            accentColor="#E5C158"
            items={[
              {
                question: "What makes PG Academy different?",
                answer: "PG Academy is built specifically for Arab creatives, offering culturally tailored content, 100% data sovereignty, and secure HLS streaming for all video content. You learn from industry experts with verified certificates."
              },
              {
                question: "Do I need prior experience?",
                answer: "No prior experience is necessary. Our specialized tracks are designed to take you from absolute beginner to industry-ready professional through structured, phase-by-phase learning."
              },
              {
                question: "How does the certification work?",
                answer: "Upon completing 100% of a track's modules and passing all associated quizzes, you are awarded a verified digital certificate with a unique code that can be authenticated by employers."
              },
              {
                question: "Are the courses self-paced?",
                answer: "Yes, our Learning Management System enforce sequential progression to ensure you master the fundamentals before moving on, but you can learn at your own pace whenever it suits you."
              }
            ]}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
