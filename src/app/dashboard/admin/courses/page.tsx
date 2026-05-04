"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, MoreHorizontal, Eye, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface AdminCourse {
  id: string;
  title: string;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  instructor: {
    name: string;
    email: string;
  };
  _count: {
    enrollments: number;
    modules: number;
  }
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" })
      });
      if (res.ok) {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: "PUBLISHED" } : c));
        // Optional: show a success toast if you have a toast system, for now we will just let it visually update.
      } else {
        alert("Failed to approve course.");
      }
    } catch (err) {
      console.error("Failed to approve course", err);
      alert("An error occurred while approving the course.");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DRAFT" })
      });
      if (res.ok) {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: "DRAFT" } : c));
      } else {
        alert("Failed to unpublish course.");
      }
    } catch (err) {
      console.error("Failed to unpublish course", err);
      alert("An error occurred while unpublishing the course.");
    }
  };

  const StatusBadge = ({ status }: { status: "DRAFT" | "PUBLISHED" }) => {
    const isPub = status === "PUBLISHED";
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${
        isPub ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
      }`}>
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isPub ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Catalog</h1>
          <p className="text-muted-foreground">Review, approve, and moderate instructor content.</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>All Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8 text-muted-foreground">Loading catalog...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              No courses found on the platform.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4">Course Details</th>
                    <th className="px-6 py-4">Instructor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Metrics</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-muted/80 ${idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{c.title}</div>
                        <div className="text-muted-foreground text-xs font-mono">${Number(c.price).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{c.instructor.name}</div>
                        <div className="text-xs text-muted-foreground">{c.instructor.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-medium text-muted-foreground">{c._count.modules} Modules</span>
                          <span className="text-xs font-medium text-brand-primary">{c._count.enrollments} Students</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                              {c.status === "DRAFT" ? (
                                <DropdownMenuItem className="cursor-pointer text-emerald-500 focus:text-emerald-600" onClick={() => handleApprove(c.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" /> Approve & Publish
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="cursor-pointer text-amber-500 focus:text-amber-600" onClick={() => handleUnpublish(c.id)}>
                                  <XCircle className="mr-2 h-4 w-4" /> Revert to Draft
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Preview Content
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <BarChart className="mr-2 h-4 w-4" /> View Analytics
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

