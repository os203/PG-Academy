"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import QuizQuestionManager from "@/components/QuizQuestionManager";

export interface QuizMeta {
  id: string;
  title: string;
  passingScore: number;
  maxAttempts: number | null;
  lessonId: string;
}

interface QuizFormState {
  title: string;
  passingScore: string;
  maxAttempts: string;
}

interface ApiMessageResponse {
  error?: string;
  message?: string;
  details?: string;
}

interface QuizGetResponse {
  quiz?: QuizMeta | null;
  error?: string;
}

interface QuizMutationResponse {
  id?: string;
  title?: string;
  passingScore?: number;
  maxAttempts?: number | null;
  lessonId?: string;
  error?: string;
  message?: string;
  details?: string;
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

function normalizeQuiz(
  data: QuizGetResponse["quiz"] | QuizMutationResponse | null,
  fallbackLessonId: string
): QuizMeta | null {
  if (!data || !data.id || !data.title) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    passingScore:
      typeof data.passingScore === "number" ? data.passingScore : 50,
    maxAttempts:
      typeof data.maxAttempts === "number" ? data.maxAttempts : null,
    lessonId: data.lessonId ?? fallbackLessonId,
  };
}

export default function LessonQuizManager({
  courseId,
  moduleId,
  lessonId,
  initialQuiz,
  onChanged,
}: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  initialQuiz: QuizMeta | null;
  onChanged: () => Promise<void> | void;
}) {
  const [quiz, setQuiz] = useState<QuizMeta | null>(initialQuiz);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<QuizFormState>({
    title: "",
    passingScore: "50",
    maxAttempts: "",
  });

  useEffect(() => {
    setQuiz(initialQuiz);

    if (initialQuiz) {
      setForm({
        title: initialQuiz.title,
        passingScore: String(initialQuiz.passingScore),
        maxAttempts:
          typeof initialQuiz.maxAttempts === "number"
            ? String(initialQuiz.maxAttempts)
            : "",
      });
    } else {
      setForm({
        title: "",
        passingScore: "50",
        maxAttempts: "",
      });
    }
  }, [initialQuiz]);

  const startCreate = (): void => {
    setForm({
      title: "",
      passingScore: "50",
      maxAttempts: "",
    });
    setIsEditing(true);
  };

  const startEdit = (): void => {
    if (!quiz) {
      startCreate();
      return;
    }

    setForm({
      title: quiz.title,
      passingScore: String(quiz.passingScore),
      maxAttempts:
        typeof quiz.maxAttempts === "number" ? String(quiz.maxAttempts) : "",
    });
    setIsEditing(true);
  };

  const cancelEdit = (): void => {
    setIsEditing(false);
  };

  const saveQuiz = async (): Promise<void> => {
    if (!form.title.trim()) {
      alert("Quiz title is required");
      return;
    }

    setSaving(true);

    try {
      const endpoint = quiz
        ? `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz/${quiz.id}`
        : `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz`;

      const method = quiz ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          passingScore: form.passingScore,
          maxAttempts: form.maxAttempts,
        }),
      });

      const data = await readJsonSafely<QuizMutationResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to save quiz");
        return;
      }

      const normalizedQuiz = normalizeQuiz(data, lessonId);
      setQuiz(normalizedQuiz);
      setIsEditing(false);
      await onChanged();
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the quiz");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (): Promise<void> => {
    if (!quiz) return;

    const confirmed = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmed) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz/${quiz.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to delete quiz");
        return;
      }

      setQuiz(null);
      setIsEditing(false);
      await onChanged();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the quiz");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-2xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <BookOpen size={18} />
            Lesson Quiz
          </div>

          {quiz && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={startEdit}
                className="p-2 text-gray-400 hover:text-indigo-600 transition"
                title="Edit Quiz"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => void deleteQuiz()}
                disabled={deleting}
                className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                title="Delete Quiz"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          )}
        </div>

        {isEditing || !quiz ? (
          <>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Quiz title"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              value={form.passingScore}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, passingScore: e.target.value }))
              }
              placeholder="Passing score"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              value={form.maxAttempts}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxAttempts: e.target.value }))
              }
              placeholder="Max attempts (optional)"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => void saveQuiz()}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Quiz
                  </>
                )}
              </button>

              <button
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Quiz Title</p>
              <p className="font-bold text-gray-800">{quiz.title}</p>
            </div>

            <div>
              <p className="text-gray-400 mb-1">Passing Score</p>
              <p className="font-bold text-gray-800">{quiz.passingScore}%</p>
            </div>

            <div>
              <p className="text-gray-400 mb-1">Max Attempts</p>
              <p className="font-bold text-gray-800">
                {quiz.maxAttempts ?? "Unlimited"}
              </p>
            </div>
          </div>
        )}
      </div>

      {quiz && (
        <QuizQuestionManager
          courseId={courseId}
          moduleId={moduleId}
          lessonId={lessonId}
          quizId={quiz.id}
        />
      )}
    </div>
  );
}