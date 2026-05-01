"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  Lock,
  PlayCircle,
  Save,
} from "lucide-react";

interface StudentLesson {
  id: string;
  title: string;
  notes: string | null;
  videoPath: string | null;
  order: number;
  watchedPercent: number;
  lastPosition: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

interface StudentModule {
  id: string;
  title: string;
  order: number;
  lessons: StudentLesson[];
}

interface StudentCourseResponse {
  id?: string;
  title?: string;
  description?: string;
  overallProgress?: number;
  modules?: StudentModule[];
  error?: string;
}

interface ApiMessageResponse {
  error?: string;
  message?: string;
}

interface ProgressSaveResponse {
  message?: string;
  progress?: {
    watchedPercent: number;
    lastPosition: number;
  };
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

export default function StudentCourseViewer({
  courseId,
}: {
  courseId: string;
}) {
  const [course, setCourse] = useState<{
    id: string;
    title: string;
    description: string;
    overallProgress: number;
    modules: StudentModule[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [watchedPercentDraft, setWatchedPercentDraft] = useState<number>(0);
  const [lastPositionDraft, setLastPositionDraft] = useState<number>(0);
  const [savingProgress, setSavingProgress] = useState(false);

  const fetchCourse = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch(`/api/student/courses/${courseId}`, {
        cache: "no-store",
      });

      const data = await readJsonSafely<StudentCourseResponse>(res);

      if (!res.ok || !data) {
        console.error(data?.error || "Failed to fetch student course");
        setCourse(null);
        return;
      }

      const normalizedModules = Array.isArray(data.modules) ? data.modules : [];

      const normalizedCourse = {
        id: data.id ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        overallProgress:
          typeof data.overallProgress === "number" ? data.overallProgress : 0,
        modules: normalizedModules.map((module) => ({
          id: module.id,
          title: module.title,
          order: module.order,
          lessons: Array.isArray(module.lessons) ? module.lessons : [],
        })),
      };

      setCourse(normalizedCourse);

      const allLessons = normalizedCourse.modules.flatMap((module) => module.lessons);

      if (allLessons.length === 0) {
        setSelectedLessonId(null);
        return;
      }

      const stillExists = allLessons.some((lesson) => lesson.id === selectedLessonId);

      if (stillExists) {
        return;
      }

      const firstUnlockedLesson =
        allLessons.find((lesson) => lesson.isUnlocked) || allLessons[0];

      setSelectedLessonId(firstUnlockedLesson.id);
    } catch (error) {
      console.error(error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const selectedLesson = useMemo(() => {
    if (!course || !selectedLessonId) return null;

    return (
      course.modules
        .flatMap((module) => module.lessons)
        .find((lesson) => lesson.id === selectedLessonId) || null
    );
  }, [course, selectedLessonId]);

  useEffect(() => {
    if (!selectedLesson) return;

    setWatchedPercentDraft(selectedLesson.watchedPercent);
    setLastPositionDraft(selectedLesson.lastPosition);
  }, [selectedLesson]);

  const saveProgress = async (): Promise<void> => {
    if (!selectedLesson) return;

    setSavingProgress(true);

    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: selectedLesson.id,
          watchedPercent: watchedPercentDraft,
          lastPosition: lastPositionDraft,
        }),
      });

      const data = await readJsonSafely<ProgressSaveResponse>(res);

      if (!res.ok) {
        alert(data?.error || "فشل حفظ التقدم");
        return;
      }

      await fetchCourse();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ التقدم");
    } finally {
      setSavingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center font-bold text-red-500">
        لا يمكن الوصول إلى هذا الكورس أو أنك غير مسجل فيه
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8" dir="rtl">
      <div className="lg:col-span-1">
        <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-6 space-y-5">
          <div>
            <h1 className="text-2xl font-black mb-2">{course.title}</h1>
            <p className="text-sm text-gray-500">
              {course.description || "لا يوجد وصف لهذا الكورس"}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>تقدم الكورس</span>
              <span>{course.overallProgress}%</span>
            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${course.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {course.modules.length > 0 ? (
              course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border rounded-2xl p-4 bg-gray-50">
                  <h3 className="font-bold text-gray-800 mb-3">
                    {moduleIndex + 1}. {module.title}
                  </h3>

                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isSelected = selectedLessonId === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          disabled={!lesson.isUnlocked}
                          onClick={() => {
                            if (lesson.isUnlocked) {
                              setSelectedLessonId(lesson.id);
                            }
                          }}
                          className={`w-full text-right border rounded-xl p-3 transition ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-gray-200 bg-white"
                          } ${!lesson.isUnlocked ? "opacity-60 cursor-not-allowed" : "hover:border-indigo-300"}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                التقدم: {lesson.watchedPercent}%
                              </p>
                            </div>

                            <div className="shrink-0">
                              {lesson.isCompleted ? (
                                <CheckCircle2 className="text-green-600" size={18} />
                              ) : lesson.isUnlocked ? (
                                <PlayCircle className="text-indigo-600" size={18} />
                              ) : (
                                <Lock className="text-gray-400" size={18} />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                لا توجد وحدات أو دروس في هذا الكورس بعد.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedLesson ? (
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-black mb-2">{selectedLesson.title}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold">
                    {selectedLesson.watchedPercent}% تقدم
                  </span>

                  {selectedLesson.isCompleted ? (
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      مكتمل
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold inline-flex items-center gap-1">
                      <CircleDashed size={14} />
                      غير مكتمل
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-2xl bg-gray-50 p-6 space-y-4">
              <h3 className="font-bold text-gray-800">واجهة الدرس</h3>

              <div className="border-2 border-dashed rounded-2xl p-8 bg-white text-center text-gray-500">
                {selectedLesson.videoPath ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-700">
                      مسار / رابط الفيديو الحالي:
                    </p>
                    <p className="text-sm break-all">{selectedLesson.videoPath}</p>
                  </div>
                ) : (
                  <p>لا يوجد فيديو مرفوع لهذا الدرس بعد.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold mb-2">ملاحظات الدرس</h4>
                <div className="bg-white border rounded-xl p-4 text-gray-700 min-h-[120px]">
                  {selectedLesson.notes || "لا توجد ملاحظات لهذا الدرس."}
                </div>
              </div>
            </div>

            <div className="border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-gray-800">حفظ التقدم</h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  نسبة المشاهدة / الإنجاز
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={watchedPercentDraft}
                  onChange={(e) => setWatchedPercentDraft(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-2">
                  القيمة الحالية: {watchedPercentDraft}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  آخر موضع (ثانية)
                </label>
                <input
                  type="number"
                  min="0"
                  value={lastPositionDraft}
                  onChange={(e) => setLastPositionDraft(Number(e.target.value))}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => void saveProgress()}
                disabled={savingProgress}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
              >
                {savingProgress ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    حفظ التقدم
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500">
                ملاحظة: في هذه المرحلة، الدرس التالي يفتح عندما يصل الدرس الحالي إلى
                80% أو أكثر. سنربط هذا لاحقًا مع الاختبارات ومنطق الـ progression
                الكامل.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
            لا يوجد درس محدد لعرضه حاليًا.
          </div>
        )}
      </div>
    </div>
  );
}