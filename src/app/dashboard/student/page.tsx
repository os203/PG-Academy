"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Loader2, PlayCircle } from "lucide-react";

interface StudentCourseCard {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

interface StudentCoursesResponse {
  courses?: StudentCourseCard[];
  error?: string;
}

async function readJsonSafely<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text.trim()) return null;
  if (!contentType.includes("application/json")) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function StudentDashboardPage() {
  const [courses, setCourses] = useState<StudentCourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async (): Promise<void> => {
      try {
        const res = await fetch("/api/student/courses", {
          cache: "no-store",
        });

        const data = await readJsonSafely<StudentCoursesResponse>(res);

        if (!res.ok) {
          console.error(data?.error || "Failed to fetch student courses");
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

    void fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black">كورساتي</h1>
          <p className="text-gray-500 mt-1">
            الكورسات التي أنت مسجل فيها ونسبة التقدم لكل كورس
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
          لا توجد كورسات مسجل فيها حاليًا.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                  <BookOpen size={22} />
                </div>

                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {course.progressPercentage}%
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-3 min-h-[60px]">
                  {course.description || "لا يوجد وصف لهذا الكورس"}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span>التقدم</span>
                  <span>
                    {course.completedLessons}/{course.totalLessons} دروس مكتملة
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${course.progressPercentage}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/dashboard/student/${course.id}`}
                className="w-full inline-flex items-center justify-between bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                <span className="inline-flex items-center gap-2">
                  <PlayCircle size={18} />
                  الدخول إلى الكورس
                </span>
                <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
