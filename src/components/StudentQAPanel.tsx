"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  MessageCircleQuestion,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface QAItem {
  id: string;
  question: string;
  answer: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string;
  isOwn: boolean;
}

interface QAResponse {
  questions?: QAItem[];
  error?: string;
}

export default function StudentQAPanel({
  lessonId,
}: {
  lessonId: string;
}) {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/qa?lessonId=${lessonId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setQuestions([]);
        return;
      }

      const data: QAResponse = await res.json();
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async () => {
    if (!newQuestion.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/student/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          question: newQuestion.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data?.error || "Failed to submit question");
        return;
      }

      setNewQuestion("");
      await fetchQuestions();
    } catch {
      alert("An error occurred while submitting your question");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter((q) => q.answer).length;
  const unansweredCount = questions.filter((q) => !q.answer).length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary/10 text-brand-primary p-2.5 rounded-xl">
            <MessageCircleQuestion size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground">Q&A Discussion</h3>
            <p className="text-sm text-muted-foreground">
              {questions.length === 0
                ? "Ask a question about this lesson"
                : `${questions.length} question${questions.length !== 1 ? "s" : ""}`}
              {unansweredCount > 0 && (
                <span className="ml-2 text-amber-500">
                  • {unansweredCount} awaiting reply
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {answeredCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              {answeredCount} answered
            </span>
          )}

          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expandable body */}
      {isExpanded && (
        <div className="border-t border-border p-5 space-y-5">
          {/* Ask a question */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">
              Ask the instructor
            </h4>

            <div className="flex gap-2">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question here..."
                rows={2}
                className="flex-1 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground placeholder:text-muted-foreground resize-none text-sm"
              />

              <button
                onClick={() => void handleSubmit()}
                disabled={submitting || !newQuestion.trim()}
                className="self-end bg-brand-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2
                  className="animate-spin text-brand-primary"
                  size={22}
                />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                No questions yet. Be the first to ask!
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  {/* Question */}
                  <div className="p-4 bg-muted/20">
                    <div className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg shrink-0 mt-0.5">
                        <MessageCircleQuestion size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground">
                            {q.isOwn ? "You" : q.userName}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {new Date(q.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {q.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answer or pending */}
                  {q.answer ? (
                    <div className="p-4 bg-emerald-500/5 border-t border-border">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg shrink-0 mt-0.5">
                          <CheckCircle2 size={14} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-400 mb-1">
                            Instructor Reply
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {q.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 border-t border-border bg-amber-500/5">
                      <div className="flex items-center gap-2 text-amber-500 text-xs font-medium">
                        <Clock size={13} />
                        Awaiting instructor reply
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
