"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TrackCardForSale from "@/components/ui/TrackCardForSale";
import { useWishlist } from "@/hooks/use-wishlist";

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



interface StudentEnrolledCourse {
  id: string;
  title: string;
}

interface StudentCoursesResponse {
  tracks?: StudentEnrolledCourse[];
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
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="animate-spin text-[#E5C158]" size={40} />
      </div>
    );
  }

  const overlays = [
    "from-blue-900/80 to-[#111111]",
    "from-indigo-900/80 to-[#111111]",
    "from-purple-900/80 to-[#111111]",
    "from-pink-900/80 to-[#111111]",
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative">
      {/* Background Starfield/Particles Effect (simulated with CSS) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1340px] mx-auto px-6 py-20 relative z-10">
        
        {/* Top Header Section */}
        <div className="max-w-4xl mb-24">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white/80 mb-8">
            Tracks Hub
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            Choose the Right Track for Your <br className="hidden md:block"/> Future
          </h1>
          <p className="text-xl text-white/60 mb-10 leading-relaxed max-w-3xl">
            Explore every PG Academy track, review module and lesson depth, then apply to start a guided learning journey built for real career outcomes.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/apply" 
              className="px-8 py-4 rounded-lg bg-[#E5C158] text-black font-bold hover:bg-[#f1d06e] transition-colors"
            >
              Apply Now
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 rounded-lg border border-white/20 bg-black/50 text-white font-bold hover:bg-white/10 transition-colors"
            >
              Discover PG Academy
            </Link>
          </div>
        </div>

        {/* Tracks Grid Section */}
        <div>
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Four Specialized Tracks. One Career Path.</h2>
            <p className="text-white/60 text-lg max-w-3xl leading-relaxed">
              Explore PG Academy&apos;s four specialized tracks, choose the one that matches your ambition, and advance through a structured journey built for real career outcomes.
            </p>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-12 text-center text-white/60">
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
                    className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5 hover:border-[#E5C158]/30 transition-all duration-300 flex flex-col cursor-pointer group"
                  >
                    <div className="relative h-64 w-full overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${track.thumbnail || '/placeholder.jpg'})` }}
                      />
                      <div className={`absolute inset-0 bg-linear-to-b ${overlay}`} />
                      
                      {/* Track specific stylized graphic representation */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <span className="absolute top-4 left-4 text-[#E5C158] font-mono text-sm font-bold bg-[#E5C158]/10 px-2 py-1 rounded">
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
                        <h4 className="text-xl font-bold text-white mb-3">{track.title}</h4>
                        <p className="text-white/60 text-sm leading-relaxed mb-8 line-clamp-3">
                          {track.description}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // prevent double navigation
                          router.push('/register');
                        }}
                        className="inline-flex self-start items-center px-6 py-2.5 bg-[#E5C158] text-black rounded-lg font-bold transition-all duration-300 hover:bg-[#f1d06e]"
                      >
                        Start Registration
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