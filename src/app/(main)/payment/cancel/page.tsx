"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ShieldCheck } from "lucide-react";

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-linear-to-r from-amber-500 via-rose-500 to-rose-600" />

          <div className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 bg-linear-to-br from-amber-500/20 to-rose-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-amber-500" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground">Payment Cancelled</h1>
              <p className="text-muted-foreground text-lg">
                No worries — you weren&apos;t charged.
              </p>
            </div>

            {/* Reassurance */}
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Your payment information was not saved. You can try again anytime.</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              {courseId && (
                <Button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-6 text-base transition-transform active:scale-[0.98]"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Course
                </Button>
              )}
              <Button
                onClick={() => router.push("/courses")}
                variant="outline"
                className="w-full py-5"
              >
                Browse All Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" /></div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
