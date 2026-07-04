"use client";

import { useEffect, useState } from "react";
import MyCourseCard from "@/components/ui/myCouaseCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  instructorName: string;
  category?: string;
}

interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  category: { id: string; name: string; slug: string } | null;
  instructor?: { name: string };
  _count?: { modules: number; enrollments: number };
  modules?: Array<{ _count: { lessons: number } }>;
}

export default function MyCoursesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [studentCourses, setStudentCourses] = useState<EnrolledCourse[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStudentCourses = async () => {
      try {
        const res = await fetch("/api/student/tracks");
        if (res.ok) {
          const data = await res.json();
          setStudentCourses(data.tracks || []);
        }
      } catch (err) {
        console.error("Failed to fetch enrolled tracks", err);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    const fetchInstructorCourses = async () => {
      try {
        const res = await fetch("/api/tracks", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setInstructorCourses(data.tracks || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    if (user.role === "STUDENT") {
      fetchStudentCourses();
    } else if (user.role === "INSTRUCTOR") {
      fetchInstructorCourses();
    }
  }, [user]);

  if (isAuthLoading || isCoursesLoading) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center min-h-[50vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p>Loading your tracks...</p>
      </div>
    );
  }

  const isInstructor = user?.role === "INSTRUCTOR";
  const tracks = isInstructor ? instructorCourses : studentCourses;

  return (
    <div className="flex flex-col w-full px-6 max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tracks</h1>
        <p className="text-muted-foreground mt-2">
          {isInstructor
            ? "Manage your tracks and upload content."
            : "Pick up where you left off and track your progress."}
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-lg max-w-4xl mx-auto w-full">
          You haven&apos;t {isInstructor ? "been assigned" : "enrolled in"} any tracks yet.
        </div>
      ) : isInstructor ? (
        <div className="grid gap-6 gap-y-8 justify-items-center" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
          {instructorCourses.map((track) => {
            const totalLessons = (track.modules || []).reduce(
              (sum, m) => sum + (m._count?.lessons || 0),
              0
            );
            return (
              <MyCourseCard
                key={track.id}
                thumbnail={track.thumbnail || "/taco3.jpg"}
                courseName={track.title}
                instructor={track.instructor?.name || user?.name || "Instructor"}
                category={track.category?.name || "General"}
                progress={0}
                totalLessons={totalLessons}
                studentCount={track._count?.enrollments || 0}
                statusBadge={track.status}
                buttonLabel="Manage Content"
                onContinue={() => router.push(`/dashboard/instructor/${track.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 gap-y-8 justify-items-center" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
          {studentCourses.map((track) => (
            <MyCourseCard
              key={track.id}
              thumbnail={track.thumbnail || "/taco3.jpg"}
              courseName={track.title}
              instructor={track.instructorName || "Instructor"}
              category={track.category || "General"}
              progress={track.progressPercentage || 0}
              totalLessons={track.totalLessons || 0}
              completedLessons={track.completedLessons || 0}
              onContinue={() => router.push(`/dashboard/student/${track.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
