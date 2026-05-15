"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  trackId,
  phaseId,
  moduleId,
  lessonId,
  quizId,
}: {
  trackId: string;
  phaseId: string;
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

  const endpoint = `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons/${lessonId}/quiz/${quizId}/questions`;

  const fetchQuestions = useCallback(async (): Promise<void> => {
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
  }, [endpoint]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  const addQuestion = async (): Promise<void> => {
    if (!questionText.trim()) {
      alert("Question text is required");
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
          alert("Please add at least two options for a multiple choice question");
          return;
        }

        const correctIndex = Number(correctOptionIndex);

        if (
          Number.isNaN(correctIndex) ||
          correctIndex < 1 ||
          correctIndex > optionLines.length
        ) {
          alert("Invalid correct option number");
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
        alert(data?.details || data?.error || "Failed to create question");
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
      alert("An error occurred while creating the question");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (questionId: string): Promise<void> => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (!confirmed) return;

    setDeletingId(questionId);

    try {
      const res = await fetch(`${endpoint}/${questionId}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to delete question");
        return;
      }

      await fetchQuestions();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the question");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="border border-border rounded-2xl p-4 bg-card space-y-4">
      <h4 className="font-bold text-foreground">Quiz Questions</h4>

      <div className="space-y-3">
        <input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Question text"
          className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as QuestionTypeValue)}
          className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
        >
          <option value="TRUE_FALSE">True / False</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
        </select>

        {type === "TRUE_FALSE" ? (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={correctTrueFalse}
              onChange={(e) => setCorrectTrueFalse(e.target.checked)}
            />
            Correct answer = True
          </label>
        ) : (
          <div className="space-y-3">
            <textarea
              value={mcqOptionsText}
              onChange={(e) => setMcqOptionsText(e.target.value)}
              placeholder={"Write each option on a new line\nOption 1\nOption 2\nOption 3"}
              rows={4}
              className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary resize-none bg-background text-foreground"
            />

            <input
              type="number"
              min="1"
              value={correctOptionIndex}
              onChange={(e) => setCorrectOptionIndex(e.target.value)}
              placeholder="Correct option number"
              className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
            />
          </div>
        )}

        <button
          onClick={() => void addQuestion()}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-primary/90 transition disabled:opacity-70"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus size={16} />
              Add Question
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-brand-primary" size={22} />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed border-border rounded-2xl p-4 text-center">
            No questions yet.
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="border border-border rounded-xl p-4 bg-muted/30 space-y-2"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-bold text-foreground">{question.questionText}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type:{" "}
                    {question.type === "TRUE_FALSE"
                      ? "True / False"
                      : "Multiple Choice"}
                  </p>
                </div>

                <button
                  onClick={() => void deleteQuestion(question.id)}
                  disabled={deletingId === question.id}
                  className="p-2 text-muted-foreground hover:text-red-500 transition disabled:opacity-50"
                  title="Delete Question"
                >
                  {deletingId === question.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>

              {question.type === "TRUE_FALSE" ? (
                <p className="text-sm text-muted-foreground">
                  Correct answer:{" "}
                  <span className="font-bold">
                    {question.correctTrueFalse ? "True" : "False"}
                  </span>
                </p>
              ) : (
                <div className="space-y-1">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`text-sm px-3 py-2 rounded-lg border ${
                        option.isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-muted/50 border-border text-foreground"
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