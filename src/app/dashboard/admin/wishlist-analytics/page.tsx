"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  TrendingUp,
  Users,
  ArrowRight,
  Crown,
  Flame,
  BarChart3,
  Sparkles,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface WishlistAnalytics {
  totalWishlists: number;
  uniqueWishlisters: number;
  avgWishlistsPerUser: number;
  conversions: number;
  conversionRate: number;
  topWishlistedTracks: Array<{
    trackId: string;
    wishlistCount: number;
    title: string;
    thumbnail: string | null;
    price: number;
    status: string;
    instructor: string;
    enrollments: number;
  }>;
  wishlistTrend: Record<string, number>;
  topWishlistUsers: Array<{
    userId: string;
    name: string;
    email: string;
    wishlistCount: number;
  }>;
}

export default function AdminWishlistAnalyticsPage() {
  const [data, setData] = useState<WishlistAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/wishlist-analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Wishlist Intelligence</h1>
          <p className="text-muted-foreground">Track demand signals and student purchase intent.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-border shadow-sm animate-pulse">
              <CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-24" /></CardHeader>
              <CardContent><div className="h-8 bg-muted rounded w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-muted-foreground">Failed to load wishlist analytics.</div>
    );
  }

  // Process trend data for chart
  const trendData = Object.entries(data.wishlistTrend).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    wishlists: count,
  }));

  // Top tracks bar chart
  const topTracksChart = data.topWishlistedTracks.slice(0, 8).map((t) => ({
    name: t.title.length > 18 ? t.title.substring(0, 18) + "..." : t.title,
    wishlists: t.wishlistCount,
    enrollments: t.enrollments,
  }));

  // Gold/amber color palette for the bar chart
  const barColors = [
    "#f59e0b", "#d97706", "#b45309", "#92400e",
    "#78350f", "#fbbf24", "#f97316", "#ea580c",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <Heart className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Wishlist Intelligence</h1>
            <p className="text-muted-foreground">Track demand signals, purchase intent, and conversion opportunities.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full -translate-y-6 translate-x-6" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wishlists</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalWishlists}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all tracks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-6 translate-x-6" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wishlisters</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.uniqueWishlisters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. {data.avgWishlistsPerUser} tracks per user
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-6 translate-x-6" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Wishlist → Enrollment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -translate-y-6 translate-x-6" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.conversions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Wishlisted & enrolled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Wishlist Trend */}
        <Card className="md:col-span-4 bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-500" />
              <div>
                <CardTitle>Wishlist Activity</CardTitle>
                <CardDescription>New wishlists added over the last 30 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No wishlist data in the last 30 days.
              </div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWishlist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wishlists"
                      stroke="#ec4899"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorWishlist)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Active Wishlisters */}
        <Card className="md:col-span-3 bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <CardTitle>Top Wishlisters</CardTitle>
                <CardDescription>Most active students by wishlist count</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.topWishlistUsers.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No wishlist users yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.topWishlistUsers.map((user, i) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          i === 0
                            ? "bg-amber-500/20 text-amber-500"
                            : i === 1
                            ? "bg-gray-400/20 text-gray-400"
                            : i === 2
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i === 0 ? <Crown className="h-3.5 w-3.5" /> : `#${i + 1}`}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
                      <span className="text-sm font-bold">{user.wishlistCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Wishlisted Tracks — Full Width */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle>Most Wishlisted Tracks</CardTitle>
                <CardDescription>Tracks with the highest demand signal — sorted by wishlist count</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data.topWishlistedTracks.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
              <Heart className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">No wishlisted tracks yet.</p>
              <p className="text-xs mt-1">Students haven&apos;t added any tracks to their wishlists.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Bar chart */}
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topTracksChart}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="wishlists" radius={[0, 6, 6, 0]} name="Wishlists">
                      {topTracksChart.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed list */}
              <div className="space-y-2.5">
                {data.topWishlistedTracks.map((track, i) => (
                  <div
                    key={track.trackId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border hover:bg-muted/40 transition-colors group"
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                        i === 0
                          ? "bg-amber-500/20 text-amber-500"
                          : i === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : i === 2
                          ? "bg-orange-500/20 text-orange-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">by {track.instructor}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs font-medium text-emerald-500">${track.price}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            track.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {track.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
                        <span className="text-sm font-bold">{track.wishlistCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {track.enrollments} enrolled
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
