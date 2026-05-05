"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import CourseCardForSale from "@/components/ui/CourseCardForSale";
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
  courses?: PublicCourse[];
  error?: string;
}

interface EnrollResponse {
  message?: string;
  error?: string;
  details?: string;
  alreadyEnrolled?: boolean;
}

interface StudentEnrolledCourse {
  id: string;
  title: string;
}

interface StudentCoursesResponse {
  courses?: StudentEnrolledCourse[];
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
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch("/api/public/courses", {
        cache: "no-store",
      });

      const data = await readJsonSafely<PublicCoursesResponse>(res);

      if (!res.ok) {
        console.error(data?.error || "Failed to fetch courses");
        setCourses([]);
        return;
      }

      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (error) {
      console.error(error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async (): Promise<void> => {
    try {
      const res = await fetch("/api/student/courses", {
        cache: "no-store",
      });

      if (!res.ok) {
        setEnrolledCourseIds([]);
        return;
      }

      const data = await readJsonSafely<StudentCoursesResponse>(res);

      const ids = Array.isArray(data?.courses)
        ? data.courses.map((course) => course.id)
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

  const enrollInCourse = async (courseId: string): Promise<void> => {
    setEnrollError(null);
    setEnrollingCourseId(courseId);

    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await readJsonSafely<EnrollResponse>(res);

      if (!res.ok) {
        setEnrollError(
          data?.details ||
            data?.error ||
            "Failed to enroll in this course. This action is available for students only."
        );
        return;
      }

      if (data?.alreadyEnrolled) {
        setEnrollError("You are already enrolled in this course.");
      } else {
        setEnrolledCourseIds((prev) =>
          prev.includes(courseId) ? prev : [...prev, courseId]
        );
      }
    } catch (error) {
      console.error(error);
      setEnrollError("An error occurred while enrolling in this course.");
    } finally {
      setEnrollingCourseId(null);
    }
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
              Available Courses
            </h1>
            <p className="text-muted-foreground">
              Browse published courses and enroll as a student
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

        {enrollError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
            {enrollError}
          </div>
        ) : null}

        {courses.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            No published courses available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCardForSale
                key={course.id}
                thumbnail={course.thumbnail ?? "/taco3.jpg"}
                category={course.category ?? "Others"}
                title={course.title}
                instructor={course.instructorName}
                rating={course.rating}
                studentsCount={course.studentsCount}
                price={course.price}
                isWishlisted={isWishlisted(course.id)}
                onToggleWishlist={() => toggleWishlist(course.id)}
                isEnrolled={enrolledCourseIds.includes(course.id)}
                isProcessing={enrollingCourseId === course.id}
                onEnroll={() => void enrollInCourse(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}