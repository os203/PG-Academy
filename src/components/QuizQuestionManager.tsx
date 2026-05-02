"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

type QuestionTypeValue = "MULTIPLE_CHOICE" | "TRUE_FALSE";

interface QuestionOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  type: QuestionTypeValue;
  order: number;
  correctTrueFalse: boolean | null;
  options: QuestionOption[];
}

interface QuestionsResponse {
  questions?: QuizQuestion[];
  error?: string;
}

interface ApiMessageResponse {
  error?: string;
  message?: string;
  details?: string;
}

interface CreateQuestionResponse {
  id?: string;
  error?: string;
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

export default function QuizQuestionManager({
  courseId,
  moduleId,
  lessonId,
  quizId,
}: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  quizId: string;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState<QuestionTypeValue>("TRUE_FALSE");
  const [correctTrueFalse, setCorrectTrueFalse] = useState(true);

  const [mcqOptionsText, setMcqOptionsText] = useState("");
  const [correctOptionIndex, setCorrectOptionIndex] = useState("1");

  const endpoint = `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz/${quizId}/questions`;

  const fetchQuestions = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
      });

      const data = await readJsonSafely<QuestionsResponse>(res);

      if (!res.ok) {
        console.error(data?.error || "Failed to fetch questions");
        setQuestions([]);
        return;
      }

      setQuestions(Array.isArray(data?.questions) ? data.questions : []);
    } catch (error) {
      console.error(error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQuestions();
  }, [endpoint]);

  const addQuestion = async (): Promise<void> => {
    if (!questionText.trim()) {
      alert("نص السؤال مطلوب");
      return;
    }

    setSaving(true);

    try {
      let body: Record<string, unknown>;

      if (type === "TRUE_FALSE") {
        body = {
          questionText: questionText.trim(),
          type,
          correctTrueFalse,
        };
      } else {
        const optionLines = mcqOptionsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (optionLines.length < 2) {
          alert("أضف خيارين على الأقل لسؤال الاختيار من متعدد");
          return;
        }

        const correctIndex = Number(correctOptionIndex);

        if (
          Number.isNaN(correctIndex) ||
          correctIndex < 1 ||
          correctIndex > optionLines.length
        ) {
          alert("رقم الخيار الصحيح غير صحيح");
          return;
        }

        body = {
          questionText: questionText.trim(),
          type,
          options: optionLines.map((text, index) => ({
            optionText: text,
            isCorrect: index + 1 === correctIndex,
            order: index + 1,
          })),
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await readJsonSafely<CreateQuestionResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "فشل إنشاء السؤال");
        return;
      }

      setQuestionText("");
      setType("TRUE_FALSE");
      setCorrectTrueFalse(true);
      setMcqOptionsText("");
      setCorrectOptionIndex("1");

      await fetchQuestions();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إنشاء السؤال");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (questionId: string): Promise<void> => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا السؤال؟");
    if (!confirmed) return;

    setDeletingId(questionId);

    try {
      const res = await fetch(`${endpoint}/${questionId}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "فشل حذف السؤال");
        return;
      }

      await fetchQuestions();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف السؤال");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="border rounded-2xl p-4 bg-white space-y-4">
      <h4 className="font-bold text-gray-800">أسئلة الاختبار</h4>

      <div className="space-y-3">
        <input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="نص السؤال"
          className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as QuestionTypeValue)}
          className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="TRUE_FALSE">صح / خطأ</option>
          <option value="MULTIPLE_CHOICE">اختيار من متعدد</option>
        </select>

        {type === "TRUE_FALSE" ? (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={correctTrueFalse}
              onChange={(e) => setCorrectTrueFalse(e.target.checked)}
            />
            الإجابة الصحيحة = صح
          </label>
        ) : (
          <div className="space-y-3">
            <textarea
              value={mcqOptionsText}
              onChange={(e) => setMcqOptionsText(e.target.value)}
              placeholder={"اكتب كل خيار في سطر\nخيار 1\nخيار 2\nخيار 3"}
              rows={4}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <input
              type="number"
              min="1"
              value={correctOptionIndex}
              onChange={(e) => setCorrectOptionIndex(e.target.value)}
              placeholder="رقم الخيار الصحيح"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <button
          onClick={() => void addQuestion()}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Plus size={16} />
              إضافة سؤال
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-indigo-600" size={22} />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-sm text-gray-400 border border-dashed rounded-2xl p-4 text-center">
            لا توجد أسئلة بعد.
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="border rounded-xl p-4 bg-gray-50 space-y-2"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-bold text-gray-800">{question.questionText}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    النوع:{" "}
                    {question.type === "TRUE_FALSE"
                      ? "صح / خطأ"
                      : "اختيار من متعدد"}
                  </p>
                </div>

                <button
                  onClick={() => void deleteQuestion(question.id)}
                  disabled={deletingId === question.id}
                  className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                  title="حذف السؤال"
                >
                  {deletingId === question.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>

              {question.type === "TRUE_FALSE" ? (
                <p className="text-sm text-gray-600">
                  الإجابة الصحيحة:{" "}
                  <span className="font-bold">
                    {question.correctTrueFalse ? "صح" : "خطأ"}
                  </span>
                </p>
              ) : (
                <div className="space-y-1">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`text-sm px-3 py-2 rounded-lg border ${
                        option.isCorrect
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {option.order}. {option.optionText}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}