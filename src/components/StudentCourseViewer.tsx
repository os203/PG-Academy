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
import StudentQuizPanel from "@/components/StudentQuizPanel";
import StudentQAPanel from "@/components/StudentQAPanel";

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
  quizId: string | null;
  hasQuiz: boolean;
  quizPassed: boolean;
  attemptCount: number;
  latestScore: number | null;
  resources: Array<{ id: string; name: string; url: string }>;
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

      if (!stillExists) {
        const firstUnlockedLesson =
          allLessons.find((lesson) => lesson.isUnlocked) || allLessons[0];

        setSelectedLessonId(firstUnlockedLesson.id);
      }
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
        alert(data?.error || "Failed to save progress");
        return;
      }

      await fetchCourse();
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving progress");
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
        This course is not accessible or you are not enrolled
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-6 space-y-5">
          <div>
            <h1 className="text-2xl font-black mb-2">{course.title}</h1>
            <p className="text-sm text-gray-500">
              {course.description || "No description for this course"}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Course Progress</span>
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
                          className={`w-full text-left border rounded-xl p-3 transition ${
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

                              <div className="text-xs text-gray-500 mt-1 space-y-1">
                                <p>Progress: {lesson.watchedPercent}%</p>
                                {lesson.hasQuiz && (
                                  <p>
                                    Quiz:{" "}
                                    {lesson.quizPassed
                                      ? "Passed"
                                      : lesson.attemptCount > 0
                                      ? `Last score ${lesson.latestScore ?? 0}%`
                                      : "Not attempted"}
                                  </p>
                                )}
                              </div>
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
                No modules or lessons in this course yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedLesson ? (
          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-black mb-2">{selectedLesson.title}</h2>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold">
                      {selectedLesson.watchedPercent}% progress
                    </span>

                    {selectedLesson.isCompleted ? (
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold inline-flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold inline-flex items-center gap-1">
                        <CircleDashed size={14} />
                        Incomplete
                      </span>
                    )}

                    {selectedLesson.hasQuiz && (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold">
                        {selectedLesson.quizPassed
                          ? "Quiz: Passed"
                          : "Quiz: Required"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-2xl bg-gray-50 p-6 space-y-4">
                <h3 className="font-bold text-gray-800">Lesson Player</h3>

                <div className="border-2 border-dashed rounded-2xl p-8 bg-white text-center text-gray-500">
                  {selectedLesson.videoPath ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">
                        Current video path / URL:
                      </p>
                      <p className="text-sm break-all">{selectedLesson.videoPath}</p>
                    </div>
                  ) : (
                    <p>No video uploaded for this lesson yet.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold mb-2">Lesson Notes</h4>
                  <div className="bg-white border rounded-xl p-4 text-gray-700 min-h-[120px]">
                    {selectedLesson.notes || "No notes for this lesson."}
                  </div>
                </div>

                {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                  <div className="pt-2 border-t">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                      </span>
                      Downloads & Materials
                    </h4>
                    <div className="space-y-2">
                      {selectedLesson.resources.map((res) => (
                        <a
                          key={res.id}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 border rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition group"
                        >
                          <span className="font-medium text-gray-700 group-hover:text-indigo-700 transition">
                            {res.name}
                          </span>
                          <span className="text-sm text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition">
                            Open
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-gray-800">Save Progress</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Watch / Completion Percentage
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
                    Current value: {watchedPercentDraft}%
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Position (seconds)
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Progress
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500">
                  To complete this lesson: progress must reach at least 80%, and if
                  there is a quiz, you must pass it as well before the next lesson
                  is unlocked.
                </p>
              </div>
            </div>

            {selectedLesson.hasQuiz && (
              <StudentQuizPanel
                lessonId={selectedLesson.id}
                onSubmitted={fetchCourse}
              />
            )}

            <StudentQAPanel lessonId={selectedLesson.id} />
          </div>
        ) : (
          <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
            No lesson selected to display.
          </div>
        )}
      </div>
    </div>
  );
}