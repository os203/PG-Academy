"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Heart } from "lucide-react";
import TrackCardForSale from "@/components/ui/TrackCardForSale";
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
    const [tracks, setCourses] = useState<PublicCourse[]>([]);
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
                const res = await fetch("/api/public/tracks", { cache: "no-store" });
                const data = await readJsonSafely<{ tracks?: PublicCourse[]; error?: string }>(res);

                if (!res.ok) {
                    setError(data?.error || "Unable to load wishlist tracks.");
                    return;
                }

                setCourses(Array.isArray(data?.tracks) ? data.tracks : []);
            } catch {
                setError("Unable to load wishlist tracks. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        const fetchEnrolledCourses = async () => {
            try {
                const res = await fetch("/api/student/tracks", { cache: "no-store" });
                const data = await readJsonSafely<{ tracks?: { id: string }[]; error?: string }>(res);

                if (res.ok && Array.isArray(data?.tracks)) {
                    setEnrolledCourseIds(data.tracks.map((track) => track.id));
                }
            } catch {
                setEnrolledCourseIds([]);
            }
        };

        void Promise.all([fetchCourses(), fetchEnrolledCourses()]);
    }, []);

    const enrollInCourse = async (trackId: string) => {
        setEnrollError(null);
        setEnrollingCourseId(trackId);

        try {
            const res = await fetch("/api/student/enroll", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ trackId }),
            });

            const data = await readJsonSafely<{ message?: string; error?: string; alreadyEnrolled?: boolean }>(res);

            if (!res.ok) {
                setEnrollError(data?.error || "Unable to enroll in this track.");
                return;
            }

            if (data?.alreadyEnrolled) {
                setEnrollError("You are already enrolled in this track.");
            } else {
                setEnrolledCourseIds((prev) => [...new Set([...prev, trackId])]);
            }
        } catch {
            setEnrollError("Unable to enroll in this track. Please try again.");
        } finally {
            setEnrollingCourseId(null);
        }
    };

    const wishlistCourses = useMemo(
        () => tracks.filter((track) => wishlistIds.includes(track.id)),
        [tracks, wishlistIds]
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-black mb-3 text-foreground">
                        My Wishlist
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mb-1">
                        Save tracks here for later and enroll when you’re ready.
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
                        <p className="mb-6">Browse tracks and tap the heart to save them here.</p>
                        <Link
                            href="/dashboard/searchPage"
                            className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
                        >
                            Browse Tracks
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
                            {wishlistCourses.map((track) => (
                                <TrackCardForSale
                                    key={track.id}
                                    thumbnail={track.thumbnail ?? "/taco3.jpg"}
                                    category={track.category ?? "General"}
                                    title={track.title}
                                    instructor={track.instructorName}
                                    rating={track.rating}
                                    studentsCount={track.studentsCount}
                                    price={track.price}
                                    isWishlisted={isWishlisted(track.id)}
                                    onToggleWishlist={() => toggleWishlist(track.id)}
                                    isEnrolled={enrolledCourseIds.includes(track.id)}
                                    isProcessing={enrollingCourseId === track.id}
                                    onEnroll={() => void enrollInCourse(track.id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
