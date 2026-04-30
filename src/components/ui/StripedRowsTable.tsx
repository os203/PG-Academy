"use client";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "DRAFT" | "PUBLISHED";
}

const StatusBadge = ({ status }: { status: "DRAFT" | "PUBLISHED" }) => {
    const styles = {
        PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };

    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide", styles[status])}>
            <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-amber-400')} />
            {status}
        </span>
    );
};

export default function StripedRowsTable({
  courses,
  onEdit,
  onDelete,
}: {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}) {
    if (courses.length === 0) {
      return (
        <div className="text-center py-16 bg-background border border-border rounded-xl text-muted-foreground">
          No courses found. Start by creating your first course.
        </div>
      );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Price</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, idx) => (
                        <tr
                            key={course.id}
                            className={cn(
                                "transition-colors hover:bg-muted/80 group",
                                idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                            )}
                        >
                            <td className="px-6 py-3.5 font-medium text-foreground">{course.title}</td>
                            <td className="px-6 py-3.5"><StatusBadge status={course.status} /></td>
                            <td className="px-6 py-3.5 text-right font-mono text-brand-primary">
                                ${Number(course.price).toFixed(2)}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onEdit(course)}
                                        className="p-2 text-muted-foreground hover:text-brand-accent transition"
                                        title="Edit Course"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(course.id)}
                                        className="p-2 text-muted-foreground hover:text-rose-500 transition"
                                        title="Delete Course"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <Link
                                        href={`/dashboard/instructor/${course.id}`}
                                        className="p-2 text-muted-foreground hover:text-brand-primary transition"
                                        title="Manage Content"
                                    >
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}