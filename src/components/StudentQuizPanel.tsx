"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send, XCircle, Trophy, RotateCcw, Sparkles } from "lucide-react";

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

  const answeredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter(q => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.type === "TRUE_FALSE") return a.answerBoolean !== undefined;
      return !!a.selectedOptionId;
    }).length;
  }, [quiz, answers]);

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

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 flex justify-center">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  /* ───── Result Screen ───── */
  if (result) {
    const passed = result.passed;
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Result Header */}
        <div className={`p-8 text-center ${passed
          ? 'bg-linear-to-br from-emerald-500/20 via-emerald-600/10 to-transparent'
          : 'bg-linear-to-br from-red-500/20 via-red-600/10 to-transparent'
        }`}>
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            passed ? 'bg-emerald-500/20 border-2 border-emerald-400/40' : 'bg-red-500/20 border-2 border-red-400/40'
          }`}>
            {passed ? (
              <Trophy size={36} className="text-emerald-500" />
            ) : (
              <XCircle size={36} className="text-red-500" />
            )}
          </div>

          <h3 className={`text-2xl font-black mb-1 ${passed ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}`}>
            {passed ? '🎉 Quiz Passed!' : 'Not Passed Yet'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {passed ? 'Great job! You\'ve mastered this material.' : 'Keep studying and try again.'}
          </p>
        </div>

        {/* Score Details */}
        <div className="p-6 space-y-4">
          {/* Score Ring */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-5xl font-black ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.score}%
              </div>
              <p className="text-muted-foreground text-xs mt-1">Your Score</p>
            </div>
            <div className="w-px h-16 bg-border" />
            <div className="text-center">
              <div className="text-5xl font-black text-muted-foreground">
                {quiz.passingScore}%
              </div>
              <p className="text-muted-foreground text-xs mt-1">Required</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                passed
                  ? 'bg-linear-to-r from-emerald-500 to-emerald-400'
                  : 'bg-linear-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${Math.min(result.score ?? 0, 100)}%` }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-foreground/40"
              style={{ left: `${quiz.passingScore}%` }}
              title={`Passing: ${quiz.passingScore}%`}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Correct</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {result.attemptCount ?? 1}
              </div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Attempts</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className={`text-lg font-bold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {typeof result.remainingAttempts === "number" ? result.remainingAttempts : '∞'}
              </div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Remaining</p>
            </div>
          </div>

          {/* Retry Button (only if failed and has remaining attempts) */}
          {!passed && (typeof result.remainingAttempts !== "number" || result.remainingAttempts > 0) && (
            <button
              onClick={handleRetry}
              className="w-full inline-flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-3 rounded-xl font-bold transition border border-border"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ───── Quiz Form ───── */
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Quiz Header */}
      <div className="p-6 border-b border-border bg-linear-to-r from-purple-500/10 via-transparent to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-500/20 p-2 rounded-xl">
            <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-black text-foreground">{quiz.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Passing: <span className="text-purple-600 dark:text-purple-400 font-semibold">{quiz.passingScore}%</span>
          </span>
          {quiz.maxAttempts !== null && (
            <span className="text-muted-foreground">
              Max attempts: <span className="text-purple-600 dark:text-purple-400 font-semibold">{quiz.maxAttempts}</span>
            </span>
          )}
          <span className="text-muted-foreground ml-auto">
            <span className="text-foreground font-semibold">{answeredCount}</span>/{questionCount} answered
          </span>
        </div>
        {/* Progress */}
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-300"
            style={{ width: `${questionCount > 0 ? (answeredCount / questionCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="p-6 space-y-5">
        {quiz.questions.map((question, index) => {
          const isAnswered = question.type === "TRUE_FALSE"
            ? answers[question.id]?.answerBoolean !== undefined
            : !!answers[question.id]?.selectedOptionId;

          return (
            <div
              key={question.id}
              className={`rounded-xl p-5 border transition-all ${
                isAnswered
                  ? 'bg-purple-500/5 border-purple-500/20'
                  : 'bg-muted/50 border-border'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                  isAnswered
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-foreground text-sm leading-relaxed">
                    {question.questionText}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    {question.type === "TRUE_FALSE" ? "True / False" : "Multiple Choice"}
                  </p>
                </div>
              </div>

              {question.type === "TRUE_FALSE" ? (
                <div className="flex gap-3 pl-10">
                  <button
                    type="button"
                    onClick={() =>
                      setAnswers((prev: AnswersState) => ({
                        ...prev,
                        [question.id]: { answerBoolean: true },
                      }))
                    }
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      answers[question.id]?.answerBoolean === true
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
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
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      answers[question.id]?.answerBoolean === false
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    False
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pl-10">
                  {question.options.map((option) => {
                    const isSelected = answers[question.id]?.selectedOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setAnswers((prev: AnswersState) => ({
                            ...prev,
                            [question.id]: { selectedOptionId: option.id },
                          }))
                        }
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                          isSelected
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-white' : 'border-muted-foreground'
                        }`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        {option.optionText}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="p-6 pt-0">
        <button
          onClick={() => void submitQuiz()}
          disabled={submitting || answeredCount < questionCount}
          className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
            answeredCount >= questionCount
              ? 'bg-linear-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/25'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={16} />
              {answeredCount < questionCount
                ? `Answer all questions (${answeredCount}/${questionCount})`
                : 'Submit Quiz'
              }
            </>
          )}
        </button>
      </div>
    </div>
  );
}