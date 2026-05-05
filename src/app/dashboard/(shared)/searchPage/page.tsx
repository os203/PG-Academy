"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Search, Layers3, Sparkles } from "lucide-react";

interface PublicCourse {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    price: number;
    status: "DRAFT" | "PUBLISHED";
    instructorName: string;
    modulesCount: number;
    lessonsCount: number;
}

const filterCategories = [
    { key: "all", label: "All" },
    { key: "2d", label: "2D" },
    { key: "3d", label: "3D" },
    { key: "animation", label: "Animation" },
    { key: "design", label: "Design" },
];

const categoryTags: Record<string, string[]> = {
    "2d": ["2d", "2d animation"],
    "3d": ["3d", "3d modeling", "3d animation"],
    animation: ["animation", "animated", "motion"],
    design: ["design", "ui", "ux", "graphic"],
    all: [],
};

async function readJsonSafely<T>(res: Response): Promise<T | null> {
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    if (!text.trim() || !contentType.includes("application/json")) {
        return null;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

export default function SearchPage() {
    const [courses, setCourses] = useState<PublicCourse[]>([]);
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/public/courses", { cache: "no-store" });
                const data = await readJsonSafely<{ courses?: PublicCourse[]; error?: string }>(res);

                if (!res.ok) {
                    setError(data?.error || "Failed to load published courses.");
                    setCourses([]);
                    return;
                }

                setCourses(Array.isArray(data?.courses) ? data.courses : []);
            } catch (fetchError) {
                setError("Unable to load courses. Please try again later.");
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return courses.filter((course) => {
            const searchText = `${course.title} ${course.description} ${course.instructorName}`.toLowerCase();
            const matchesQuery =
                !normalizedQuery || searchText.includes(normalizedQuery);

            if (!matchesQuery) {
                return false;
            }

            if (activeFilter === "all") {
                return true;
            }

            return categoryTags[activeFilter]?.some((tag) =>
                searchText.includes(tag)
            );
        });
    }, [courses, query, activeFilter]);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-black mb-3 text-foreground">
                        Browse Courses
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mb-1">
                        Discover your next learning adventure
                    </p>
                    <p className="text-muted-foreground max-w-2xl text-xs">
                        Use the search to filter courses. Type a name, description or Author name, then choose one of the categories.
                    </p>
                </div>

                <div className="shadow-md dark:shadow-brand-accent/20 dark:bg-gray-900 rounded-2xl p-8 mb-12">
                    <div className="space-y-3">
                        <label htmlFor="course-search" className="text-sm font-semibold  text-foreground pl-1">
                            Search for a course
                        </label>
                        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card mt-2 px-4 shadow-sm focus-within:border-primary">
                            <Search className="h-5 w-5 text-foreground " />
                            <input
                                id="course-search"
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search ....."
                                className="w-full rounded-2xl border-none bg-transparent pr-12 py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {filterCategories.map((filter) => {
                                const isActive = activeFilter === filter.key;
                                return (
                                    <button
                                        key={filter.key}
                                        type="button"
                                        onClick={() => setActiveFilter(filter.key)}
                                        className={`rounded-xl border px-4 py-2 text-sm font-medium text-brand-accent transition ${isActive
                                            ? " bg-primary "
                                            : "border-border bg-card text-foreground hover:text-brand-accent"
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                    <p className="text-sm text-muted-foreground font-bold pb-8">
                        {filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"} found
                    </p>

                {loading ? (
                    <div className="rounded-3xl border border-border bg-card p-12 text-center text-foreground">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
                        Loading courses...
                    </div>
                ) : error ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                        {error}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
                        No courses match the search or filter.
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="h-52 bg-slate-900/5">
                                    <img
                                        src={course.thumbnail ?? "/default-course.png"}
                                        alt={course.title}
                                        className="h-52 w-full object-cover"
                                    />
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">{course.title}</h2>
                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                {course.description || "No description for the course"}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                            Published
                                        </span>
                                    </div>

                                    <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                                        <div className="flex items-center gap-2">
                                            <Layers3 size={16} className="text-primary" />
                                            <span>{course.modulesCount} module{course.modulesCount === 1 ? "" : "s"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={16} className="text-primary" />
                                            <span>{course.lessonsCount} lesson{course.lessonsCount === 1 ? "" : "s"}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                        <span className="font-semibold text-foreground">
                                            {course.price.toFixed(2)}$
                                        </span>
                                        <Link
                                            href="/courses"
                                            className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-hover"
                                        >
                                            View Course
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
