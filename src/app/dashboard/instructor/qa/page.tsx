"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QAItem {
  id: string;
  question: string;
  answer: string | null;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  lessonTitle: string;
  courseTitle: string;
}

export default function InstructorQAPage() {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"unanswered" | "answered">("unanswered");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/instructor/qa");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setUnansweredCount(data.unansweredCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch Q&A", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (questionId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/instructor/qa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer: replyText.trim() }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId ? { ...q, answer: replyText.trim() } : q
          )
        );
        setUnansweredCount((c) => Math.max(0, c - 1));
        setReplyingId(null);
        setReplyText("");
      } else {
        alert("Failed to submit reply");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const unanswered = questions.filter((q) => !q.answer);
  const answered = questions.filter((q) => q.answer);
  const displayedQuestions = tab === "unanswered" ? unanswered : answered;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p>Loading Q&A...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Q&A Management
        </h1>
        <p className="text-muted-foreground">
          Review and reply to student questions across your courses.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-500 uppercase tracking-wider">
                  Unanswered
                </p>
                <p className="text-2xl font-bold mt-1">{unansweredCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider">
                  Answered
                </p>
                <p className="text-2xl font-bold mt-1">{answered.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("unanswered")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === "unanswered"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unanswered ({unanswered.length})
        </button>
        <button
          onClick={() => setTab("answered")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === "answered"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Answered ({answered.length})
        </button>
      </div>

      {/* Questions list */}
      {displayedQuestions.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p>
              {tab === "unanswered"
                ? "All caught up! No unanswered questions."
                : "No answered questions yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedQuestions.map((q) => (
            <Card key={q.id} className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-base">{q.question}</CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" /> {q.studentName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {q.courseTitle} →{" "}
                        {q.lessonTitle}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(q.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  {q.answer ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" /> Answered
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {q.answer && (
                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground border-l-4 border-brand-primary">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Your Reply:
                    </p>
                    {q.answer}
                  </div>
                )}

                {!q.answer && replyingId !== q.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setReplyingId(q.id);
                      setReplyText("");
                    }}
                  >
                    <Send className="h-3.5 w-3.5" /> Reply
                  </Button>
                )}

                {replyingId === q.id && (
                  <div className="space-y-3 mt-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[100px]"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-brand-primary text-white hover:bg-brand-primary/90 gap-2"
                        onClick={() => handleReply(q.id)}
                        disabled={submitting || !replyText.trim()}
                      >
                        {submitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Submit Reply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingId(null);
                          setReplyText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
