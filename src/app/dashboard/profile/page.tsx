"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  User,
  Mail,
  Shield,
  GraduationCap,
  Calendar,
  Pencil,
  Loader2,
  BookOpen,
  Award,
  Library,
  CheckCircle2,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  createdAt: string;
  _count: {
    enrollments: number;
    tracks: number;
    certificates: number;
  };
}

export default function ProfilePage() {

  const { t } = useLanguage();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setEditForm({ name: data.user.name, bio: data.user.bio || "" });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setErrorMsg("Name is required");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          bio: editForm.bio.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile((prev) =>
          prev ? { ...prev, name: data.user.name, bio: data.user.bio } : prev
        );
        setEditing(false);
        setSuccessMsg(t("profile.profileUpdated"));
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(data.error || "Failed to update profile");
      }
    } catch {
      setErrorMsg("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { icon: <Shield className="h-4 w-4" />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
      case "INSTRUCTOR":
        return { icon: <GraduationCap className="h-4 w-4" />, color: "text-[#bd9759]", bg: "bg-[#bd9759]/10 border-[#bd9759]/20" };
      default:
        return { icon: <User className="h-4 w-4" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#bd9759]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-zinc-500">
        Failed to load profile data.
      </div>
    );
  }

  const roleConfig = getRoleConfig(profile.role);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {t("profile.title")}
        </h1>
        <p className="text-zinc-400 mt-1">{t("profile.subtitle")}</p>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-linear-to-r from-[#bd9759]/30 via-[#e0a84d]/20 to-[#bd9759]/10 relative">
          <div className="absolute -bottom-12 inset-s-6">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-linear-to-br from-[#bd9759] to-[#e0a84d] flex items-center justify-center text-3xl font-black text-black shadow-lg shadow-[#bd9759]/20 border-4 border-[#09090b]">
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(profile.name)
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="pt-16 px-6 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              {editing ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1 block">
                      {t("profile.name")}
                    </label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#bd9759]/50 focus:border-[#bd9759]/50"
                      placeholder={t("profile.name")}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1 block">
                      {t("profile.bio")}
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#bd9759]/50 focus:border-[#bd9759]/50 resize-none"
                      placeholder={t("profile.bioPlaceholder")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="gold-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t("profile.saveChanges")}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditForm({ name: profile.name, bio: profile.bio || "" });
                        setErrorMsg("");
                      }}
                      className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                      {t("profile.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-zinc-400 text-sm">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                  {profile.bio && (
                    <p className="mt-3 text-zinc-300 text-sm leading-relaxed max-w-lg">
                      {profile.bio}
                    </p>
                  )}
                </>
              )}
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="gold-outline-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2 shrink-0"
              >
                <Pencil className="h-4 w-4" />
                {t("profile.editProfile")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">{t("profile.accountInfo")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
            <div className={`p-2.5 rounded-lg ${roleConfig.bg}`}>
              {roleConfig.icon}
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t("profile.role")}</p>
              <p className={`font-semibold text-sm ${roleConfig.color}`}>
                {profile.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
            <div className="p-2.5 rounded-lg bg-zinc-700/50">
              <Calendar className="h-4 w-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t("profile.memberSince")}</p>
              <p className="font-semibold text-sm text-zinc-200">
                {format(new Date(profile.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <BookOpen className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t("profile.enrollments")}</p>
              <p className="font-semibold text-sm text-zinc-200">
                {profile._count.enrollments}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t("nav.certificates")}</p>
              <p className="font-semibold text-sm text-zinc-200">
                {profile._count.certificates}
              </p>
            </div>
          </div>

          {profile.role === "INSTRUCTOR" && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <div className="p-2.5 rounded-lg bg-[#bd9759]/10 border border-[#bd9759]/20">
                <Library className="h-4 w-4 text-[#bd9759]" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{t("nav.tracks")}</p>
                <p className="font-semibold text-sm text-zinc-200">
                  {profile._count.tracks}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
