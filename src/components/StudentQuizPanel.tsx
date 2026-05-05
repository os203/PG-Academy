"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type QuestionTypeValue = "MULTIPLE_CHOICE" | "TRUE_FALSE";

interface StudentQuizOption {
  id: string;
  optionText: string;
  order: number;
}

interface StudentQuizQuestion {
  id: string;
  questionText: string;
  type: QuestionTypeValue;
  order: number;
  options: StudentQuizOption[];
}

interface StudentQuiz {
  id: string;
  title: string;
  passingScore: number;
  maxAttempts: number | null;
  questions: StudentQuizQuestion[];
}

interface StudentQuizResponse {
  quiz?: StudentQuiz | null;
  error?: string;
}

interface SubmitQuizResponse {
  message?: string;
  score?: number;
  passed?: boolean;
  correctAnswers?: number;
  totalQuestions?: number;
  attemptCount?: number;
  remainingAttempts?: number | null;
  error?: string;
}

type AnswersState = Record<
  string,
  {
    selectedOptionId?: string;
    answerBoolean?: boolean;
  }
>;

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

export default function StudentQuizPanel({
  lessonId,
  onSubmitted,
}: {
  lessonId: string;
  onSubmitted: () => Promise<void> | void;
}) {
  const [quiz, setQuiz] = useState<StudentQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState<AnswersState>({});
  const [result, setResult] = useState<SubmitQuizResponse | null>(null);

  const fetchQuiz = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setResult(null);
      setAnswers({});

      const res = await fetch(`/api/student/lessons/${lessonId}/quiz`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await readJsonSafely<StudentQuizResponse>(res);

      if (!res.ok) {
        console.error(data?.error || "Failed to fetch student quiz");
        setQuiz(null);
        return;
      }

      setQuiz(data?.quiz ?? null);
    } catch (error) {
      console.error(error);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void fetchQuiz();
  }, [fetchQuiz]);

  const questionCount = useMemo(() => quiz?.questions.length ?? 0, [quiz]);

  const submitQuiz = async (): Promise<void> => {
    if (!quiz) return;

    setSubmitting(true);

    try {
      const payload = {
        answers: quiz.questions.map((question) => ({
          questionId: question.id,
          selectedOptionId: answers[question.id]?.selectedOptionId,
          answerBoolean: answers[question.id]?.answerBoolean,
        })),
      };

      const res = await fetch(
        `/api/student/lessons/${lessonId}/quiz/${quiz.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await readJsonSafely<SubmitQuizResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to submit quiz");
        return;
      }

      setResult(data ?? null);
      await onSubmitted();
    } catch (error) {
      console.error(error);
      alert("An error occurred while submitting the quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-6 flex justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={22} />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="bg-white border rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-xl font-black mb-2">{quiz.title}</h3>
        <p className="text-sm text-gray-500">
          Required passing score: {quiz.passingScore}%
          {quiz.maxAttempts !== null &&
            ` — Max attempts: ${quiz.maxAttempts}`}
        </p>
      </div>

      <div className="space-y-5">
        {quiz.questions.map((question, index) => (
          <div
            key={question.id}
            className="border rounded-2xl p-4 bg-gray-50 space-y-3"
          >
            <div>
              <p className="font-bold text-gray-800">
                {index + 1}. {question.questionText}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {question.type === "TRUE_FALSE"
                  ? "True / False"
                  : "Multiple Choice"}
              </p>
            </div>

            {question.type === "TRUE_FALSE" ? (
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setAnswers((prev: AnswersState) => ({
                      ...prev,
                      [question.id]: { answerBoolean: true },
                    }))
                  }
                  className={`px-4 py-2 rounded-xl border font-bold ${
                    answers[question.id]?.answerBoolean === true
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  True
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAnswers((prev: AnswersState) => ({
                      ...prev,
                      [question.id]: { answerBoolean: false },
                    }))
                  }
                  className={`px-4 py-2 rounded-xl border font-bold ${
                    answers[question.id]?.answerBoolean === false
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  False
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setAnswers((prev: AnswersState) => ({
                        ...prev,
                        [question.id]: { selectedOptionId: option.id },
                      }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-xl border ${
                      answers[question.id]?.selectedOptionId === option.id
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    {option.order}. {option.optionText}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => void submitQuiz()}
        disabled={submitting || questionCount === 0}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send size={16} />
            Submit Quiz
          </>
        )}
      </button>

      {result && (
        <div
          className={`rounded-2xl p-4 border ${
            result.passed
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-2">
            <CheckCircle2 size={18} />
            Result
          </div>

          <p>Score: {result.score}%</p>
          <p>
            Correct answers: {result.correctAnswers} / {result.totalQuestions}
          </p>
          <p>{result.passed ? "Passed 🎉" : "Not passed yet"}</p>

          {typeof result.remainingAttempts === "number" && (
            <p>Remaining attempts: {result.remainingAttempts}</p>
          )}
        </div>
      )}
    </div>
  );
}