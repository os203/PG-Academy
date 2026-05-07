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
  category: string | null;
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
        const res = await fetch("/api/student/courses");
        if (res.ok) {
          const data = await res.json();
          setStudentCourses(data.courses || []);
        }
      } catch (err) {
        console.error("Failed to fetch enrolled courses", err);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    const fetchInstructorCourses = async () => {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setInstructorCourses(data.courses || []);
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
        <p>Loading your courses...</p>
      </div>
    );
  }

  const isInstructor = user?.role === "INSTRUCTOR";
  const courses = isInstructor ? instructorCourses : studentCourses;

  return (
    <div className="flex flex-col w-full px-6 max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-2">
          {isInstructor
            ? "Manage your courses and upload content."
            : "Pick up where you left off and track your progress."}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-lg max-w-4xl mx-auto w-full">
          You haven&apos;t {isInstructor ? "been assigned" : "enrolled in"} any courses yet.
        </div>
      ) : isInstructor ? (
        <div className="grid gap-6 gap-y-8 justify-items-center" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
          {instructorCourses.map((course) => {
            const totalLessons = (course.modules || []).reduce(
              (sum, m) => sum + (m._count?.lessons || 0),
              0
            );
            return (
              <MyCourseCard
                key={course.id}
                thumbnail={course.thumbnail || "/taco3.jpg"}
                courseName={course.title}
                instructor={course.instructor?.name || user?.name || "Instructor"}
                category={course.category || "General"}
                progress={0}
                totalLessons={totalLessons}
                studentCount={course._count?.enrollments || 0}
                statusBadge={course.status}
                buttonLabel="Manage Content"
                onContinue={() => router.push(`/dashboard/instructor/${course.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 gap-y-8 justify-items-center" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
          {studentCourses.map((course) => (
            <MyCourseCard
              key={course.id}
              thumbnail={course.thumbnail || "/taco3.jpg"}
              courseName={course.title}
              instructor={course.instructorName || "Instructor"}
              category={course.category || "General"}
              progress={course.progressPercentage || 0}
              totalLessons={course.totalLessons || 0}
              completedLessons={course.completedLessons || 0}
              onContinue={() => router.push(`/dashboard/student/courses/${course.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
