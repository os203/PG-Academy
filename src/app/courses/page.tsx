"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Loader2,
  CheckCircle2,
  UserRound,
  Layers3,
  PlayCircle,
  Home,
  ArrowLeft,
} from "lucide-react";

interface PublicCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
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
        alert(
          data?.details ||
            data?.error ||
            "فشل التسجيل في الكورس. هذا الإجراء متاح للطلاب فقط."
        );
        return;
      }

      setEnrolledCourseIds((prev) =>
        prev.includes(courseId) ? prev : [...prev, courseId]
      );

      alert(data?.message || "تم التسجيل في الكورس بنجاح");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التسجيل في الكورس");
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
    <div className="min-h-screen bg-background py-10" dir="rtl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black mb-2 text-foreground">
              الكورسات المتاحة
            </h1>
            <p className="text-muted-foreground">
              تصفح الكورسات المنشورة وسجّل فيها كطالب
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            <Home size={18} />
            العودة للرئيسية
            <ChevronRight size={18} />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            لا توجد كورسات منشورة حاليًا.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {courses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);

              return (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition p-6 space-y-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl">
                      <BookOpen size={22} />
                    </div>

                    <span className="text-sm font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                      منشور
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">
                      {course.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                      {course.description || "لا يوجد وصف لهذا الكورس"}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <UserRound size={16} className="text-primary" />
                      <span>المدرب: {course.instructorName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Layers3 size={16} className="text-primary" />
                      <span>عدد الوحدات: {course.modulesCount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <PlayCircle size={16} className="text-primary" />
                      <span>عدد الدروس: {course.lessonsCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="font-bold text-primary text-lg">
                      {Number(course.price).toFixed(2)}$
                    </span>
                  </div>

           <div className="pt-2">
  {isEnrolled ? (
    <Link
      href={`/dashboard/student/${course.id}`}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition bg-green-600 text-white hover:bg-green-700 min-h-[48px]"
    >
      <CheckCircle2 size={16} />
      الدخول إلى الكورس
      <ArrowLeft size={16} />
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => void enrollInCourse(course.id)}
      disabled={enrollingCourseId === course.id}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition bg-indigo-600 text-white hover:bg-indigo-700 min-h-[48px] disabled:opacity-70"
    >
      {enrollingCourseId === course.id ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          جاري التسجيل...
        </>
      ) : (
        <>
          <BookOpen size={16} />
          التسجيل في الكورس
        </>
      )}
    </button>
  )}
</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}