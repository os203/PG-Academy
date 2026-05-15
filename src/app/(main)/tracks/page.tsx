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
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch("/api/public/tracks", {
        cache: "no-store",
      });

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

  const fetchEnrolledCourses = async (): Promise<void> => {
    try {
      const res = await fetch("/api/student/tracks", {
        cache: "no-store",
      });

      if (!res.ok) {
        setEnrolledCourseIds([]);
        return;
      }

      const data = await readJsonSafely<StudentCoursesResponse>(res);

      const ids = Array.isArray(data?.tracks)
        ? data.tracks.map((track) => track.id)
        : [];

      setEnrolledCourseIds(ids);
    } catch (error) {
      console.error(error);
      setEnrolledCourseIds([]);
    }
  };

  useEffect(() => {
    void fetchCourses();
    void fetchEnrolledCourses();
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

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black mb-2 text-foreground">
              Available Tracks
            </h1>
            <p className="text-muted-foreground">
              Browse published tracks and enroll as a student
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            <Home size={18} />
            Home
            <ChevronLeft size={18} />
          </Link>
        </div>



        {tracks.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            No published tracks available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <TrackCardForSale
                key={track.id}
                thumbnail={track.thumbnail ?? "/taco3.jpg"}
                category={track.category ?? "Others"}
                title={track.title}
                instructor={track.instructorName}
                rating={track.rating}
                studentsCount={track.studentsCount}
                price={track.price}
                isWishlisted={isWishlisted(track.id)}
                onToggleWishlist={() => toggleWishlist(track.id)}
                isEnrolled={enrolledCourseIds.includes(track.id)}
                isProcessing={false}
                onEnroll={() => viewCourseDetails(track.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}