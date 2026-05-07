"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Heart } from "lucide-react";
import CourseCardForSale from "@/components/ui/CourseCardForSale";
import { useWishlist } from "@/hooks/use-wishlist";

interface PublicCourse {
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    rating: number;
    studentsCount: number;
    price: number;
    instructorName: string;
    modulesCount: number;
    lessonsCount: number;
}

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

export default function WishlistPage() {
    const [courses, setCourses] = useState<PublicCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
    const [enrollError, setEnrollError] = useState<string | null>(null);
    const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/public/courses", { cache: "no-store" });
                const data = await readJsonSafely<{ courses?: PublicCourse[]; error?: string }>(res);

                if (!res.ok) {
                    setError(data?.error || "Unable to load wishlist courses.");
                    return;
                }

                setCourses(Array.isArray(data?.courses) ? data.courses : []);
            } catch {
                setError("Unable to load wishlist courses. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        const fetchEnrolledCourses = async () => {
            try {
                const res = await fetch("/api/student/courses", { cache: "no-store" });
                const data = await readJsonSafely<{ courses?: { id: string }[]; error?: string }>(res);

                if (res.ok && Array.isArray(data?.courses)) {
                    setEnrolledCourseIds(data.courses.map((course) => course.id));
                }
            } catch {
                setEnrolledCourseIds([]);
            }
        };

        void Promise.all([fetchCourses(), fetchEnrolledCourses()]);
    }, []);

    const enrollInCourse = async (courseId: string) => {
        setEnrollError(null);
        setEnrollingCourseId(courseId);

        try {
            const res = await fetch("/api/student/enroll", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ courseId }),
            });

            const data = await readJsonSafely<{ message?: string; error?: string; alreadyEnrolled?: boolean }>(res);

            if (!res.ok) {
                setEnrollError(data?.error || "Unable to enroll in this course.");
                return;
            }

            if (data?.alreadyEnrolled) {
                setEnrollError("You are already enrolled in this course.");
            } else {
                setEnrolledCourseIds((prev) => [...new Set([...prev, courseId])]);
            }
        } catch {
            setEnrollError("Unable to enroll in this course. Please try again.");
        } finally {
            setEnrollingCourseId(null);
        }
    };

    const wishlistCourses = useMemo(
        () => courses.filter((course) => wishlistIds.includes(course.id)),
        [courses, wishlistIds]
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-black mb-3 text-foreground">
                        My Wishlist
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mb-1">
                        Save courses here for later and enroll when you’re ready.
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-3xl border border-border bg-card p-12 text-center text-foreground">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
                        Loading wishlist...
                    </div>
                ) : error ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                        {error}
                    </div>
                ) : wishlistCourses.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
                        <Heart className="mx-auto mb-4 h-10 w-10 text-brand-primary" />
                        <p className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty.</p>
                        <p className="mb-6">Browse courses and tap the heart to save them here.</p>
                        <Link
                            href="/dashboard/searchPage"
                            className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <>
                        {enrollError ? (
                            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
                                {enrollError}
                            </div>
                        ) : null}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlistCourses.map((course) => (
                                <CourseCardForSale
                                    key={course.id}
                                    thumbnail={course.thumbnail ?? "/taco3.jpg"}
                                    category={course.category ?? "General"}
                                    title={course.title}
                                    instructor={course.instructorName}
                                    rating={course.rating}
                                    studentsCount={course.studentsCount}
                                    price={course.price}
                                    isWishlisted={isWishlisted(course.id)}
                                    onToggleWishlist={() => toggleWishlist(course.id)}
                                    isEnrolled={enrolledCourseIds.includes(course.id)}
                                    isProcessing={enrollingCourseId === course.id}
                                    onEnroll={() => void enrollInCourse(course.id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
