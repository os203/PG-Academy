"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, BookOpen, Sparkles, Loader2, Receipt } from "lucide-react";

interface SessionInfo {
  courseName: string;
  amount: number;
  email: string;
  paymentId: string;
}

interface ConfettiParticle {
  left: string;
  top: string;
  delay: string;
  duration: string;
  color: string;
  rotation: string;
}

function generateConfetti(): ConfettiParticle[] {
  const colors = ['#6C63FF', '#00C9A7', '#FF6B6B', '#FFD93D', '#4ECDC4', '#A78BFA'];
  return Array.from({ length: 50 }, () => ({
    left: `${Math.random() * 100}%`,
    top: `-${Math.random() * 20}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 3}s`,
    color: colors[Math.floor(Math.random() * 6)],
    rotation: `rotate(${Math.random() * 360}deg)`,
  }));
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const sessionId = searchParams.get("session_id");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiParticles] = useState<ConfettiParticle[]>(() => generateConfetti());

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
    }
    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setSessionInfo(data.session);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiParticles.map((p, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            >
              <div
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: p.color,
                  transform: p.rotation,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-linear-to-r from-emerald-500 via-brand-primary to-brand-accent" />

          <div className="p-8 text-center space-y-6">
            {/* Animated checkmark */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="relative w-24 h-24 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground flex items-center justify-center gap-2">
                Payment Successful
                <Sparkles className="w-6 h-6 text-amber-400" />
              </h1>
              <p className="text-muted-foreground text-lg">
                You&apos;re now enrolled! Time to start learning.
              </p>
            </div>

            {/* Transaction details */}
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
              </div>
            ) : sessionInfo ? (
              <div className="bg-muted/50 rounded-xl p-5 text-left space-y-3 border border-border">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <Receipt className="w-4 h-4 text-brand-primary" />
                  Transaction Details
                </div>
                <div className="space-y-2 text-sm">
                  {sessionInfo.courseName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Course</span>
                      <span className="font-medium text-foreground">{sessionInfo.courseName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold text-emerald-500">${(sessionInfo.amount / 100).toFixed(2)}</span>
                  </div>
                  {sessionInfo.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground">{sessionInfo.email}</span>
                    </div>
                  )}
                  {sessionInfo.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="text-xs text-muted-foreground font-mono">{String(sessionInfo.paymentId).slice(0, 20)}...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              {courseId && (
                <Button
                  onClick={() => router.push(`/dashboard/student/${courseId}`)}
                  className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-6 text-base transition-transform active:scale-[0.98] group"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Go to Your Course
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
              <Button
                onClick={() => router.push("/dashboard/myCourses")}
                variant="outline"
                className="w-full py-5"
              >
                View All My Courses
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti animation styles */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
