"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import TrackCardForSale from "@/components/ui/TrackCardForSale";
import { useWishlist } from "@/hooks/use-wishlist";
import { useRouter } from "next/navigation";

interface PublicCourse {
    id: string;
    title: string;
    category: string;
    thumbnail: string | null;
    rating: number; // من 5
    studentsCount: number;
    price: number;
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
    const router = useRouter();
    const [tracks, setCourses] = useState<PublicCourse[]>([]);
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
    const { toggleWishlist, isWishlisted } = useWishlist();

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/public/tracks", { cache: "no-store" });
                const data = await readJsonSafely<{ tracks?: PublicCourse[]; error?: string }>(res);

                if (!res.ok) {
                    setError(data?.error || "Failed to load published tracks.");
                    setCourses([]);
                    return;
                }

                setCourses(Array.isArray(data?.tracks) ? data.tracks : []);
            } catch {
                setError("Unable to load tracks. Please try again later.");
                setCourses([]);
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

        void fetchCourses();
        void fetchEnrolledCourses();
    }, []);

    const viewCourseDetails = (trackId: string) => {
        router.push(`/tracks/${trackId}`);
    };

    const filteredCourses = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return tracks.filter((track) => {
            const searchText = `${track.title} ${track.category} ${track.instructorName}`.toLowerCase();
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
    }, [tracks, query, activeFilter]);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-black mb-3 text-foreground">
                        Browse Tracks
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mb-1">
                        Discover your next learning adventure
                    </p>
                    <p className="text-muted-foreground max-w-2xl text-xs">
                        Use the search to filter tracks. Type a name, description or Author name, then choose one of the categories.
                    </p>
                </div>

                <div className="shadow-md dark:shadow-brand-accent/20 dark:bg-gray-900 rounded-2xl p-8 mb-12">
                    <div className="space-y-3">
                        <label htmlFor="track-search" className="text-sm font-semibold  text-foreground pl-1">
                            Search for a track
                        </label>
                        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card mt-2 px-4 shadow-sm focus-within:border-primary">
                            <Search className="h-5 w-5 text-foreground " />
                            <input
                                id="track-search"
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
                    {filteredCourses.length} track{filteredCourses.length === 1 ? "" : "s"} found
                </p>

                {loading ? (
                    <div className="rounded-3xl border border-border bg-card p-12 text-center text-foreground">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
                        Loading tracks...
                    </div>
                ) : error ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                        {error}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
                        No tracks match the search or filter.
                    </div>
                ) : (
                    <>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((track) => (
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
                                    isProcessing={false}
                                    onEnroll={() => viewCourseDetails(track.id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );


}
