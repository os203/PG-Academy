"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Lightbulb, 
  Sparkles, 
  Heart, 
  Clock, 
  TrendingUp, 
  Palette, 
  Video, 
  Mic, 
  Gamepad2,
  ChevronRight,
  Eye,
  Target
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const stats = [
  { value: "400K+", label: "MINUTES OF CONTENT" },
  { value: "90+", label: "CREATIVE TEAM" },
  { value: "15+", label: "YEARS EXCELLENCE" },
  { value: "10x", label: "FASTER WITH AI" },
];

const values = [
  { icon: Users, title: "People First", desc: "Culture is the foundation, the earth is what we all have in common!" },
  { icon: Lightbulb, title: "Think Smarter", desc: "Think Smarter... then work harder!" },
  { icon: Sparkles, title: "Imagination", desc: "Imagination and creativity can change the world" },
  { icon: Heart, title: "Artist-Centered", desc: "The artist is the center of the process" },
  { icon: Clock, title: "Heritage", desc: "The past inspires invention and innovation" },
  { icon: TrendingUp, title: "Collaboration", desc: "Collaboration activates growth" },
];

const studios = [
  { icon: Palette, title: "Animation Studio", desc: "Full in-house production pipeline from concept to final render." },
  { icon: Video, title: "Film Making Studio", desc: "Professional equipment and cinematic direction." },
  { icon: Mic, title: "Audio & Music Studio", desc: "Complete audio production, composition, SFX, and mixing." },
  { icon: Gamepad2, title: "Game Studio", desc: "Immersive gaming experiences and interactive content." },
];

const journey = [
  { year: "2011", title: "The Beginning", desc: "PG Studios was founded with a vision to create world-class animation content. Produced over 50,000 minutes of original children's content in multiple languages." },
  { year: "2015", title: "Forbes Recognition", desc: "Forbes Middle East Magazine recognized PG Holding as one of the top 50 start-ups to watch in the MENA region, highlighting our innovation and impact." },
  { year: "2018", title: "Professional Studios", desc: "Established three state-of-the-art studios for filming, audio recording, and music production, equipped with the latest hardware and software." },
  { year: "2019", title: "Royal Recognition", desc: "His Majesty King Abdullah II honored PG Studios as a key start-up supporting the Jordanian national economy, recognizing our significant contributions." },
  { year: "2020", title: "Content Milestone", desc: "Our library of original children's content has grown to over 130,000 minutes, available in multiple languages, showcasing our dedication to expansive storytelling." },
  { year: "2022", title: "PG Kids & AI Hub", desc: "Launched PG Kids OTT platform and PG AI Hub, revolutionizing production by accelerating processes up to tenfold while enhancing quality." },
  { year: "2023", title: "400K+ Minutes", desc: "Our library expanded to over 400,000 minutes of original children's content in multiple languages, demonstrating our commitment to diverse storytelling." },
  { year: "Future", title: "The Journey Continues", desc: "We continue to innovate and create, pushing the boundaries of animation and storytelling to inspire generations across the Arab world and beyond." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 text-center">
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-30">
          <div className="w-[800px] h-[400px] bg-brand-primary/40 blur-[120px] rounded-full" />
        </div>
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 drop-shadow-sm">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl font-medium text-brand-accent/90">
            Creating Stories That Inspire Generations
          </p>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="bg-card/40 border-border backdrop-blur-sm shadow-xl hover:border-brand-primary/30 transition-all hover:-translate-y-1">
                <CardContent className="p-6 text-center space-y-2 flex flex-col justify-center min-h-[140px]">
                  <div className="text-4xl md:text-5xl font-bold text-brand-primary drop-shadow-[0_0_15px_rgba(var(--brand-primary),0.3)]">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm tracking-wider text-muted-foreground uppercase font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-4 md:px-8 text-center">
        <motion.div 
          className="max-w-3xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Who We Are</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Progressive Generation Studios specializes in premier animation services, including 2D and 3D animations, storyboarding, and directing. Our state-of-the-art studios use the latest technology to deliver exceptional animation projects. In addition to animation, we offer comprehensive services such as music production, live streaming, voice-over services, chroma studios, audio recording studios, and video production studios.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Mission */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-card/20 border-border hover:bg-card/40 hover:border-brand-primary/50 transition-all overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[60px] group-hover:bg-brand-primary/20 transition-all pointer-events-none" />
              <CardContent className="p-8 md:p-12 space-y-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/30">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  At PG Studios, we're passionate storytellers on a mission to bring the magic of video to every corner of the globe, with a special spotlight on the beauty of the Arabic language. Through our vibrant brands and stories that touch the heart, we aim to stand out and make a mark. We're all about crafting animated adventures that not only wow audiences around the world but also inspire our young viewers to dream big.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vision */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-card/20 border-border hover:bg-card/40 hover:brand-accent/50 transition-all overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[60px] group-hover:bg-brand-accent/20 transition-all pointer-events-none" />
              <CardContent className="p-8 md:p-12 space-y-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-accent border border-brand-accent/30">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To be the Walt Disney of the Arab world! We see a horizon filled with tales that echo the laughter and wisdom of our vibrant culture, touching every young heart. With each story we craft, our vision is to guide, inspire, and light up the path for our youngsters. As we shape their today with tales of wonder, we're also dreaming and building a brighter, hopeful tomorrow for our entire region.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 space-y-4"
        >
          <h2 className="text-4xl font-bold">Core Values</h2>
          <p className="text-muted-foreground">The principles that guide everything we do</p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {values.map((val, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="h-full bg-card/20 border-border hover:border-brand-primary/40 transition-colors">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <val.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold">{val.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Studios Section */}
      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 space-y-4 relative z-10"
        >
          <h2 className="text-4xl font-bold">3,000 Square Feet Studios</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PG Studios is equipped with professional 2D & 3D animation studio, Video studio, and Audio / Music studio.
          </p>
        </motion.div>

        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {studios.map((studio, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="h-full bg-background border-brand-primary/20 hover:border-brand-primary hover:shadow-[0_0_30px_rgba(var(--brand-primary),0.15)] transition-all overflow-hidden group">
                <CardContent className="p-8 space-y-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all">
                    <studio.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold">{studio.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{studio.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* The Journey Timeline */}
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl font-bold">Our Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            For over 13 years, PG Studios has excelled in animations, promotional videos, music production, sound engineering, cartoon dubbing, TV ads, and game development.
          </p>
        </motion.div>

        <div className="relative border-l-2 border-border ml-4 md:ml-8 space-y-12">
          {journey.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="relative pl-8 md:pl-12"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              {/* Timeline Node */}
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-background border-4 border-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary),0.5)]" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-brand-primary font-bold text-xl">{item.year}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-lg md:text-xl font-semibold text-foreground">{item.title}</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
