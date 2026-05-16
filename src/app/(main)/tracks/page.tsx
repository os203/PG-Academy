"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
interface PublicCourse {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string | null;
  rating: number;
  studentsCount: number;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  instructorName: string;
  modulesCount: number;
  lessonsCount: number;
}

interface PublicCoursesResponse {
  tracks?: PublicCourse[];
  error?: string;
}


async function readJsonSafely<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text.trim()) {
    return null;
  }

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function CoursesPage() {
  const router = useRouter();
  const [tracks, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/tracks", { cache: "no-store" });
      const data = await readJsonSafely<PublicCoursesResponse>(res);

      if (!res.ok) {
        console.error(data?.error || "Failed to fetch tracks");
        setCourses([]);
        return;
      }
      setCourses(Array.isArray(data?.tracks) ? data.tracks : []);
    } catch (error) {
      console.error(error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCourses();
  }, []);

  const viewCourseDetails = (trackId: string) => {
    router.push(`/tracks/${trackId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const overlays = [
    "from-blue-900/90 to-blue-900/50",
    "from-indigo-900/90 to-indigo-900/50",
    "from-purple-900/90 to-purple-900/50",
    "from-pink-900/90 to-pink-900/50",
  ];

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative bg-background">
      {/* Background Starfield/Particles Effect (simulated with CSS) */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, hsl(var(--foreground)/0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Animated background blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1], 
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-[#E5C158] rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-purple-900 rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0" 
      />

      <div className="max-w-[1340px] mx-auto px-6 py-20 relative z-10">
        
        {/* Top Header Section */}
        <div className="max-w-4xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 backdrop-blur-md mb-8 border border-[#E5C158]/30 text-sm font-medium text-[#E5C158]">
            <span className="w-2 h-2 rounded-full bg-[#E5C158] animate-pulse" />
            Tracks Hub
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight text-foreground drop-shadow-sm">
            Choose the Right Track for Your <br className="hidden md:block"/> Future
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl drop-shadow-sm">
            Explore every PG Academy track, review module and lesson depth, then apply to start a guided learning journey built for real career outcomes.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-lg bg-[#E5C158] text-black font-bold hover:bg-[#D4B047] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Apply Now
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 rounded-lg border border-border bg-foreground/5 text-foreground font-bold hover:bg-foreground/10 transition-all backdrop-blur-sm"
            >
              Discover PG Academy
            </Link>
          </div>
        </div>

        {/* Tracks Grid Section */}
        <div>
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Four Specialized Tracks. One Career Path.</h2>
            <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
              Explore PG Academy&apos;s four specialized tracks, choose the one that matches your ambition, and advance through a structured journey built for real career outcomes.
            </p>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
              No published tracks available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tracks.map((track, i) => {
                const num = (i + 1).toString().padStart(2, '0');
                const overlay = overlays[i % overlays.length];
                // Use existing DB subtitle if available, else a fallback
                const subtitle = track.category || "Specialized Track";

                return (
                  <div
                    key={track.id}
                    onClick={() => viewCourseDetails(track.id)}
                    className="bg-card rounded-2xl overflow-hidden border border-border hover:border-brand-primary/30 transition-all duration-300 flex flex-col cursor-pointer group shadow-md hover:shadow-xl dark:hover:shadow-brand-primary/10"
                  >
                    <div className="relative h-64 w-full overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${track.thumbnail || '/placeholder.jpg'})` }}
                      />
                      <div className={`absolute inset-0 bg-linear-to-b ${overlay}`} />
                      
                      {/* Track specific stylized graphic representation */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <span className="absolute top-4 left-4 text-brand-primary font-mono text-sm font-bold bg-brand-primary/10 px-2 py-1 rounded">
                          {num}
                        </span>
                        <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-lg text-shadow-xl">
                          {track.title}
                        </h3>
                        <p className="text-white/80 font-medium tracking-widest text-xs uppercase">
                          {subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-8 grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-foreground mb-3">{track.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
                          {track.description}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // prevent double navigation
                          viewCourseDetails(track.id);
                        }}
                        className="inline-flex self-start items-center px-6 py-2.5 bg-brand-primary text-primary-foreground rounded-lg font-bold transition-all duration-300 hover:bg-brand-hover"
                      >
                        View Track
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}