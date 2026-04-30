"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InstructorNotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground animate-pulse">Loading notifications...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/instructor')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Bell className="h-6 w-6 text-brand-accent" />
                All Notifications
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                View your complete history of recent activity, reviews, and system alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder List */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-start gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-brand-accent shrink-0"></div>
              <div>
                <p className="font-medium text-foreground">New Student Enrolled</p>
                <p className="text-sm text-muted-foreground">Sarah enrolled in Admin Masterclass.</p>
                <p className="text-xs text-muted-foreground mt-1">just now</p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-start gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-brand-accent shrink-0"></div>
              <div>
                <p className="font-medium text-foreground">5-Star Review!</p>
                <p className="text-sm text-muted-foreground">David left a review on Designer Masterclass.</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-start gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-muted-foreground shrink-0"></div>
              <div>
                <p className="font-medium text-foreground">Payout Initiated</p>
                <p className="text-sm text-muted-foreground">Stripe payout of $1,200 is on the way.</p>
                <p className="text-xs text-muted-foreground mt-1">yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
