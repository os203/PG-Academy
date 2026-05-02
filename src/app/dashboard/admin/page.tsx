"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  TrendingUp,
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/ui/RevenueChart";
import { formatDistanceToNow } from "date-fns";

interface AdminStats {
  users: { total: number; students: number; instructors: number; admins: number };
  courses: { total: number; published: number; draft: number };
  enrollments: { total: number; today: number };
  revenue: { gross: number; net: number; platformCut: number };
  payments: { completed: number; pending: number; failed: number };
  activityFeed: Array<{ type: string; message: string; time: string }>;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Overview</h1>
          <p className="text-muted-foreground">Monitor platform health, user growth, and revenue.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-border shadow-sm animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2" />
                <div className="h-3 bg-muted rounded w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Overview</h1>
        <p className="text-muted-foreground">Monitor platform health, user growth, and revenue.</p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.users.total}</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                {s.users.students} Students
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent font-medium">
                {s.users.instructors} Instructors
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${s.revenue.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-500 mt-1 font-medium flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Total platform revenue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue (20%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${s.revenue.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-brand-primary mt-1 font-medium">
              PG Academy&apos;s cut
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments Today</CardTitle>
            <GraduationCap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.enrollments.today}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.enrollments.total} total enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Healthy
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All services operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions + Payment Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{s.courses.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">Courses awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{s.payments.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.payments.pending > 0 && (
                <span className="text-amber-500 font-medium">{s.payments.pending} pending</span>
              )}
              {s.payments.pending > 0 && s.payments.failed > 0 && " · "}
              {s.payments.failed > 0 && (
                <span className="text-red-500 font-medium">{s.payments.failed} failed</span>
              )}
              {s.payments.pending === 0 && s.payments.failed === 0 && "No issues detected"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{s.courses.total}</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                {s.courses.published} Published
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                {s.courses.draft} Draft
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 bg-card border-border">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <RevenueChart />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-card border-border">
          <CardHeader>
            <CardTitle>Live Activity Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {s.activityFeed.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity to display.
                </p>
              ) : (
                s.activityFeed.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                      activity.type === "enrollment"
                        ? "bg-blue-500"
                        : activity.type === "payment"
                          ? "bg-emerald-500"
                          : "bg-brand-primary"
                    }`} />
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
