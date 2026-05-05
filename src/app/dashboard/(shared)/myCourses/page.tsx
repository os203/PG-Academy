"use client";

import { useEffect, useState } from "react";
import MyCourseCard from "@/components/ui/myCouaseCard";
import { useAuth } from "@/context/AuthContext";

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

export default function MyCoursesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/student/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    const fetchInstructorCourses = async () => {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    if (user && user.role === "STUDENT") {
        fetchCourses();
    } else if (user && user.role === "INSTRUCTOR") {
        fetchInstructorCourses();
    }
  }, [user]);

  if (isAuthLoading || isCoursesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-muted-foreground">
        <p className="animate-pulse">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-6 max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === "INSTRUCTOR" 
            ? "Manage and track the courses you've created." 
            : "Pick up where you left off and track your progress."}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-lg max-w-4xl mx-auto w-full">
          You haven&apos;t {user?.role === "INSTRUCTOR" ? "created" : "enrolled in"} any courses yet.
        </div>
      ) : (
        <div className="grid gap-6 gap-y-8 justify-items-center" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
          {courses.map((course) => (
            <MyCourseCard
              key={course.id}
              thumbnail={course.thumbnail || "/taco3.jpg"} // Fallback image
              courseName={course.title}
              instructor={course.instructorName || user?.name || "Instructor"}
              category={course.category || "General"}
              progress={course.progressPercentage || 0}
              onContinue={() => window.location.href = `/dashboard/${user?.role?.toLowerCase()}/courses/${course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
