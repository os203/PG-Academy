"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface SentNotification {
  id: string;
  message: string;
  type: string;
  targetRole: string;
  audienceSize: number;
  createdAt: string;
  track?: { title: string } | null;
}

export default function InstructorNotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<SentNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && (user.role === "INSTRUCTOR" || user.role === "ADMIN")) {
      fetch("/api/instructor/notifications/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.history) setHistory(data.history);
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [user]);

  if (isLoading || loadingHistory) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground animate-pulse">Loading history...</p>
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

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sent Broadcasts History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                You haven&apos;t sent any broadcast notifications yet.
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-muted/30 border border-border flex items-start gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    item.type === "WARNING" ? "bg-amber-500" :
                    item.type === "SUCCESS" ? "bg-emerald-500" : "bg-brand-accent"
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.type} Broadcast</p>
                    <p className="text-sm text-foreground mt-1">{item.message}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {item.targetRole.replace("_", " ")}
                      </span>
                      {item.track && (
                        <span className="inline-flex items-center rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 text-[10px] font-bold tracking-wider">
                          {item.track.title}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Sent to {item.audienceSize} user(s)
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
