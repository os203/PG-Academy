"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    ShieldCheck,
    Sparkles,
    Upload,
    User,
    Users,
    ArrowRight,
    Pencil,
    Check,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type CourseSummary = {
    id: string;
    title: string;
    progress?: number;
    studentCount?: number;
};

type ProfileResponse = {
    id: string;
    name: string;
    email: string;
    role: string;
    bio: string;
    avatarUrl: string | null;
    enrolledCourses?: CourseSummary[];
    assignedCourses?: CourseSummary[];
    stats?: {
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
    };
};

export default function ProfilePage() {
    const { user, isLoading: authLoading, refreshUser, login } = useAuth();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const roleLabel = useMemo(() => {
        return profile?.role
            ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
            : "Profile";
    }, [profile]);

    useEffect(() => {
        if (!authLoading && user) {
            void loadProfile();
        }
    }, [authLoading, user]);

    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setBio(profile.bio || "");
        }
    }, [profile]);

    const loadProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/profile", { cache: "no-store" });
            if (!response.ok) {
                throw new Error("Unable to load profile.");
            }

            const data = (await response.json()) as ProfileResponse;
            setProfile(data);
            setAvatarPreview(data.avatarUrl ?? null);
        } catch (err) {
            console.error(err);
            setError("Failed to load profile. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("bio", bio);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const response = await fetch("/api/profile", {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(err.error || "Unable to save profile.");
            }

            const updated = (await response.json()) as ProfileResponse;
            setProfile((current) => ({
                ...current,
                ...updated,
            } as ProfileResponse));

            // update local auth state so navbar refreshes immediately
            try {
                if (login) {
                    login({
                        id: updated.id,
                        name: updated.name,
                        email: updated.email,
                        role: updated.role,
                        avatarUrl: updated.avatarUrl,
                    });
                }
            } catch (e) {
                console.warn("login update failed", e);
            }

            // also refresh from server to be safe
            if (refreshUser) await refreshUser();

            // reflect saved avatar
            setAvatarPreview(updated.avatarUrl ?? null);
            setAvatarFile(null);
            setEditMode(false);
        } catch (err) {
            console.error("Profile save error:", err);
            setError(err instanceof Error ? err.message : "Unable to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const triggerAvatarInput = () => {
        fileInputRef.current?.click();
    };

    const initials = useMemo(() => {
        if (!profile?.name) {
            return "PG";
        }

        return profile.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((segment) => segment[0].toUpperCase())
            .join("");
    }, [profile]);

    if (authLoading || loading) {
        return (
            <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
                <div className="rounded-3xl border border-border bg-card px-8 py-10 text-center shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Loading your profile...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
                <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
                    <p className="font-semibold text-foreground">You need to sign in to view your profile.</p>
                    <Link href="/login" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
                        Go to Login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                        <User size={14} />
                        Profile
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Your profile</h1>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                            A clean personal dashboard that adapts to your role and keeps all account details in one place.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setEditMode((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#5b42f4] to-[#a855f7] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:brightness-110"
                >
                    {!editMode && <Pencil size={16} />}
                    {editMode ? "Exit edit" : "Edit profile"}
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-3xl font-black text-white shadow-xl">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Profile avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            {editMode && <button
                                type="button"
                                onClick={triggerAvatarInput}
                                className="absolute -bottom-1 -right-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white text-black shadow-lg transition hover:bg-primary/10"
                                aria-label="Upload avatar"
                            >
                                <Upload size={18} />
                            </button>}
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">Profile photo</p>
                            <p className="text-sm text-muted-foreground">Upload a new avatar to personalize your account.</p>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />

                    <div className="mt-8 space-y-5">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Full name
                            </label>
                            {editMode ? (
                                <input
                                    className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                />
                            ) : (
                                <p className="mt-3 text-lg font-semibold text-foreground">{profile?.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Email address
                            </label>
                            <p className="mt-3 rounded-3xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                                {profile?.email}
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Description
                            </label>
                            {editMode ? (
                                <textarea
                                    className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    rows={5}
                                    value={bio}
                                    onChange={(event) => setBio(event.target.value)}
                                />
                            ) : (
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                    {profile?.bio || "Write a brief introduction about yourself."}
                                </p>
                            )}
                        </div>

                        {editMode ? (
                            <>
                                {error && (
                                    <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition duration-300 hover:bg-muted-foreground/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                                        ) : (
                                            <Check size={16} />
                                        )}
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            setName(profile?.name ?? "");
                                            setBio(profile?.bio ?? "");
                                            setAvatarPreview(profile?.avatarUrl ?? null);
                                            setAvatarFile(null);
                                            setError(null);
                                        }}
                                        disabled={saving}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition duration-300 hover:bg-muted-foreground/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-primary">
                                <User size={18} />
                                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Role</span>
                            </div>
                            <p className="mt-4 text-xl font-black text-foreground">{roleLabel}</p>
                        </div>
                        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-emerald-500">
                                <Sparkles size={18} />
                                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Status</span>
                            </div>
                            <p className="mt-4 text-xl font-black text-foreground">Active</p>
                        </div>
                    </div>

                    {profile?.role === "student" && (
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Student section</p>
                                    <h2 className="mt-2 text-2xl font-black text-foreground">Enrolled courses</h2>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                    {profile.enrolledCourses?.length ?? 0} courses
                                </span>
                            </div>

                            {profile.enrolledCourses?.length ? (
                                <div className="space-y-4">
                                    {profile.enrolledCourses.map((course) => (
                                        <div key={course.id} className="rounded-3xl border border-border bg-background p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-foreground">{course.title}</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">Course in your active learning list.</p>
                                                </div>
                                                <ArrowRight className="text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                                    No enrolled courses found yet. Keep learning to populate this view.
                                </div>
                            )}
                        </div>
                    )}

                    {profile?.role === "instructor" && (
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Instructor section</p>
                                    <h2 className="mt-2 text-2xl font-black text-foreground">Assigned courses</h2>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                    {profile.assignedCourses?.length ?? 0} courses
                                </span>
                            </div>

                            {profile.assignedCourses?.length ? (
                                <div className="space-y-4">
                                    {profile.assignedCourses.map((course) => (
                                        <div key={course.id} className="grid gap-4 rounded-3xl border border-border bg-background p-4 md:grid-cols-[1fr_auto] md:items-center">
                                            <div>
                                                <p className="font-semibold text-foreground">{course.title}</p>
                                                <p className="mt-1 text-sm text-muted-foreground">Students enrolled: {course.studentCount ?? 0}</p>
                                            </div>
                                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                                                <Users size={16} /> {course.studentCount ?? 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                                    You don&apos;t have assigned courses yet. Create your first track to populate this area.
                                </div>
                            )}
                        </div>
                    )}

                    {profile?.role === "admin" && (
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-5">
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Admin section</p>
                                <h2 className="mt-2 text-2xl font-black text-foreground">Platform statistics</h2>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-3xl border border-border bg-background p-5 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Users size={20} />
                                    </div>
                                    <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">Users</p>
                                    <p className="mt-2 text-3xl font-black text-foreground">{profile.stats?.totalUsers ?? 0}</p>
                                </div>

                                <div className="rounded-3xl border border-border bg-background p-5 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                                        <BookOpen size={20} />
                                    </div>
                                    <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">Courses</p>
                                    <p className="mt-2 text-3xl font-black text-foreground">{profile.stats?.totalCourses ?? 0}</p>
                                </div>

                                <div className="rounded-3xl border border-border bg-background p-5 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">Enrollments</p>
                                    <p className="mt-2 text-3xl font-black text-foreground">{profile.stats?.totalEnrollments ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}
                </section>
            </div>
        </main>
    );
}
