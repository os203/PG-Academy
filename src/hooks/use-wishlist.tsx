"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wishlist_course_ids";

function parseWishlistValue(value: string | null): string[] {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter((id) => typeof id === "string")
            : [];
    } catch {
        return [];
    }
}

export function useWishlist() {
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);

    useEffect(() => {
        const value = window.localStorage.getItem(STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWishlistIds(parseWishlistValue(value));
    }, []);

    const persistWishlist = useCallback((nextIds: string[]) => {
        setWishlistIds(nextIds);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
        }
    }, []);

    const addToWishlist = useCallback(
        (courseId: string) => {
            setWishlistIds((current) => {
                const next = current.includes(courseId) ? current : [...current, courseId];
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                }
                return next;
            });
        },
        []
    );

    const removeFromWishlist = useCallback((courseId: string) => {
        setWishlistIds((current) => {
            const next = current.filter((id) => id !== courseId);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            }
            return next;
        });
    }, []);

    const toggleWishlist = useCallback(
        (courseId: string) => {
            setWishlistIds((current) => {
                const next = current.includes(courseId)
                    ? current.filter((id) => id !== courseId)
                    : [...current, courseId];

                if (typeof window !== "undefined") {
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                }

                return next;
            });
        },
        []
    );

    const isWishlisted = useCallback(
        (courseId: string) => wishlistIds.includes(courseId),
        [wishlistIds]
    );

    return {
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        persistWishlist,
    };
}
