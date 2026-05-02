"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Trophy,
  GraduationCap,
  DollarSign,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface AnalyticsData {
  enrollmentTrend: Record<string, number>;
  userGrowth: Record<string, number>;
  topCourses: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    instructor: { name: string };
    enrollments: number;
    estimatedRevenue: number;
  }>;
  instructorLeaderboard: Array<{
    id: string;
    name: string;
    email: string;
    courseCount: number;
    totalEnrollments: number;
    estimatedRevenue: number;
  }>;
  revenueByStatus: Array<{
    status: string;
    total: number;
    count: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform business intelligence and performance metrics.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-border shadow-sm animate-pulse">
              <CardHeader><div className="h-5 bg-muted rounded w-32" /></CardHeader>
              <CardContent><div className="h-[200px] bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-muted-foreground">Failed to load analytics data.</div>
    );
  }

  // Process enrollment trend for chart
  const enrollmentChartData = Object.entries(data.enrollmentTrend).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    enrollments: count,
  }));

  // Process user growth for chart
  const userGrowthData = Object.entries(data.userGrowth).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    signups: count,
  }));

  // Revenue pie chart data
  const pieColors = ["#10b981", "#f59e0b", "#ef4444"];
  const revenuePieData = data.revenueByStatus.map((r) => ({
    name: r.status,
    value: r.total,
    count: r.count,
  }));

  // Top courses bar chart data
  const topCoursesChart = data.topCourses.slice(0, 8).map((c) => ({
    name: c.title.length > 20 ? c.title.substring(0, 20) + "..." : c.title,
    enrollments: c.enrollments,
    revenue: c.estimatedRevenue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform business intelligence and performance metrics.</p>
        </div>
      </div>

      {/* Enrollment Trend + User Growth */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle>Enrollment Trend</CardTitle>
                <CardDescription>New enrollments over the last 30 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {enrollmentChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No enrollment data in the last 30 days.
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Area type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnroll)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <div>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New signups over the last 30 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {userGrowthData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No new signups in the last 30 days.
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Area type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Courses Bar Chart + Revenue Pie */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle>Top Performing Courses</CardTitle>
                <CardDescription>By enrollment count</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {topCoursesChart.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No course data available.
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCoursesChart} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, angle: -45, textAnchor: "end" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number, name: string) =>
                        name === "revenue" ? [`$${value.toFixed(2)}`, "Est. Revenue"] : [value, "Enrollments"]
                      }
                    />
                    <Bar dataKey="enrollments" radius={[6, 6, 0, 0]}>
                      {topCoursesChart.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 15}, 70%, ${55 + index * 3}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <CardTitle>Revenue by Status</CardTitle>
                <CardDescription>Payment status distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {revenuePieData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No payment data available.
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenuePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {revenuePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {revenuePieData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                      <span className="text-muted-foreground">{item.name} ({item.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Courses Table */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Course Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.topCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No courses yet.</div>
            ) : (
              <div className="space-y-3">
                {data.topCourses.slice(0, 5).map((course, i) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        i === 0 ? "bg-amber-500/20 text-amber-500" :
                        i === 1 ? "bg-gray-300/20 text-gray-400" :
                        i === 2 ? "bg-orange-500/20 text-orange-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{course.title}</p>
                        <p className="text-xs text-muted-foreground">by {course.instructor.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{course.enrollments} students</p>
                      <p className="text-xs text-emerald-500 font-medium">${course.estimatedRevenue.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Instructors Table */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              <CardTitle>Instructor Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.instructorLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No instructors yet.</div>
            ) : (
              <div className="space-y-3">
                {data.instructorLeaderboard.slice(0, 5).map((inst, i) => (
                  <div key={inst.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        i === 0 ? "bg-amber-500/20 text-amber-500" :
                        i === 1 ? "bg-gray-300/20 text-gray-400" :
                        i === 2 ? "bg-orange-500/20 text-orange-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.courseCount} courses · {inst.totalEnrollments} students</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-500">${inst.estimatedRevenue.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">est. earnings</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
