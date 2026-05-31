"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const STORAGE_PREFIX = "wishlist_";

function getStorageKey(userId: string | undefined): string {
    return userId ? `${STORAGE_PREFIX}${userId}` : `${STORAGE_PREFIX}guest`;
}

function parseWishlistValue(value: string | null): string[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
        return [];
    }
}

export function useWishlist() {
    const { user } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const loadedRef = useRef(false);

    // Load wishlist: server-first for logged in users, localStorage for guests
    useEffect(() => {
        loadedRef.current = false;

        async function loadWishlist() {
            const storageKey = getStorageKey(user?.id);

            if (user?.id) {
                // Authenticated: load from server
                try {
                    const res = await fetch("/api/wishlist");
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data.ids)) {
                            setWishlistIds(data.ids);
                            window.localStorage.setItem(storageKey, JSON.stringify(data.ids));
                            loadedRef.current = true;
                            return;
                        }
                    }
                } catch {
                    // Fall through to user-specific localStorage
                }
            }

            // Fallback: user-specific localStorage
            const value = window.localStorage.getItem(storageKey);
            setWishlistIds(parseWishlistValue(value));
            loadedRef.current = true;
        }

        loadWishlist();
    }, [user?.id]);

    const toggleWishlist = useCallback(
        (trackId: string) => {
            const storageKey = getStorageKey(user?.id);

            setWishlistIds((current) => {
                const next = current.includes(trackId)
                    ? current.filter((id) => id !== trackId)
                    : [...current, trackId];

                if (typeof window !== "undefined") {
                    window.localStorage.setItem(storageKey, JSON.stringify(next));
                }

                // Sync with server if logged in (fire-and-forget)
                if (user?.id) {
                    fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ trackId }),
                    }).catch(() => {});
                }

                return next;
            });
        },
        [user?.id]
    );

    const addToWishlist = useCallback(
        (trackId: string) => {
            const storageKey = getStorageKey(user?.id);

            setWishlistIds((current) => {
                if (current.includes(trackId)) return current;
                const next = [...current, trackId];
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(storageKey, JSON.stringify(next));
                }
                if (user?.id) {
                    fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ trackId }),
                    }).catch(() => {});
                }
                return next;
            });
        },
        [user?.id]
    );

    const removeFromWishlist = useCallback(
        (trackId: string) => {
            const storageKey = getStorageKey(user?.id);

            setWishlistIds((current) => {
                const next = current.filter((id) => id !== trackId);
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(storageKey, JSON.stringify(next));
                }
                if (user?.id) {
                    fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ trackId }),
                    }).catch(() => {});
                }
                return next;
            });
        },
        [user?.id]
    );

    const isWishlisted = useCallback(
        (trackId: string) => wishlistIds.includes(trackId),
        [wishlistIds]
    );

    const persistWishlist = useCallback(
        (nextIds: string[]) => {
            const storageKey = getStorageKey(user?.id);
            setWishlistIds(nextIds);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(storageKey, JSON.stringify(nextIds));
            }
        },
        [user?.id]
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
