"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Download,
  Search,
  Filter,
  Users,
  GraduationCap,
  BarChart3,
  Loader2,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface StudentRecord {
  userId: string;
  name: string;
  email: string;
  trackId: string;
  courseTitle: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  bestQuizScore: number | null;
}

interface CourseName {
  id: string;
  title: string;
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [courseNames, setCourseNames] = useState<CourseName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/instructor/students");
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
          setCourseNames(data.courseNames || []);
        }
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse =
        courseFilter === "ALL" || s.trackId === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, courseFilter]);

  const totalStudents = new Set(students.map((s) => s.userId)).size;
  const avgProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.progressPercent, 0) /
            students.length
        )
      : 0;
  const avgQuizScore = (() => {
    const scored = students.filter((s) => s.bestQuizScore !== null);
    if (scored.length === 0) return 0;
    return Math.round(
      scored.reduce((sum, s) => sum + (s.bestQuizScore ?? 0), 0) /
        scored.length
    );
  })();

  const exportCSV = () => {
    const headers = [
      "Student Name",
      "Email",
      "Track",
      "Enrolled",
      "Lessons Completed",
      "Total Lessons",
      "Progress %",
      "Best Quiz Score",
    ];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.email,
      s.courseTitle,
      format(new Date(s.enrolledAt), "yyyy-MM-dd"),
      s.completedLessons.toString(),
      s.totalLessons.toString(),
      `${s.progressPercent}%`,
      s.bestQuizScore !== null ? s.bestQuizScore.toString() : "N/A",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-performance-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Student Performance
          </h1>
          <p className="text-muted-foreground">
            Track progress and quiz scores across your tracks.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Students
                </p>
                <p className="text-2xl font-bold mt-1">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg. Progress
                </p>
                <p className="text-2xl font-bold mt-1">{avgProgress}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-brand-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg. Quiz Score
                </p>
                <p className="text-2xl font-bold mt-1">{avgQuizScore}%</p>
              </div>
              <Trophy className="h-8 w-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>
              Enrolled Students ({filteredStudents.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-8 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-background hover:bg-accent px-3 h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Track</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Filter by Track</DropdownMenuLabel>
                    <DropdownMenuItem
                      className={`cursor-pointer ${courseFilter === "ALL" ? "bg-accent" : ""}`}
                      onSelect={() => setCourseFilter("ALL")}
                    >
                      All Tracks
                    </DropdownMenuItem>
                    {courseNames.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        className={`cursor-pointer ${courseFilter === c.id ? "bg-accent" : ""}`}
                        onSelect={() => setCourseFilter(c.id)}
                      >
                        {c.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              Loading student data...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p>
                {searchTerm || courseFilter !== "ALL"
                  ? "No students match your search criteria."
                  : "No students enrolled in your tracks yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Track</th>
                    <th className="px-6 py-4">Enrolled</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4 text-right">Quiz Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr
                      key={`${s.userId}-${s.trackId}`}
                      className={`transition-colors hover:bg-muted/80 ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {s.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {s.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {s.courseTitle}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(s.enrolledAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                s.progressPercent >= 80
                                  ? "bg-emerald-500"
                                  : s.progressPercent >= 40
                                    ? "bg-brand-primary"
                                    : "bg-amber-500"
                              }`}
                              style={{
                                width: `${s.progressPercent}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">
                            {s.progressPercent}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {s.completedLessons}/{s.totalLessons} lessons
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {s.bestQuizScore !== null ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              s.bestQuizScore >= 80
                                ? "bg-emerald-500/10 text-emerald-500"
                                : s.bestQuizScore >= 50
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {s.bestQuizScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
