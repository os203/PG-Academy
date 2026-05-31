"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Check, X, User as UserIcon, BookOpen, Calendar, ClipboardList, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Enrollment {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  enrolledAt: string;
  user: {
    name: string;
    email: string;
  };
  track: {
    title: string;
  };
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { t } = useLanguage();

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/admin/enrollments");
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const updateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (e) => activeTab === "ALL" || e.status === activeTab
  );

  const pendingCount = enrollments.filter((e) => e.status === "PENDING").length;
  const approvedCount = enrollments.filter((e) => e.status === "APPROVED").length;
  const rejectedCount = enrollments.filter((e) => e.status === "REJECTED").length;

  const tabs = [
    { key: "ALL" as const, label: t("admin.enrollments.all"), count: enrollments.length, color: "text-white" },
    { key: "PENDING" as const, label: t("admin.enrollments.pending"), count: pendingCount, color: "text-amber-400" },
    { key: "APPROVED" as const, label: t("admin.enrollments.approved"), count: approvedCount, color: "text-emerald-400" },
    { key: "REJECTED" as const, label: t("admin.enrollments.rejected"), count: rejectedCount, color: "text-red-400" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold uppercase tracking-wide border border-amber-500/20">
            <Clock size={12} />
            {t("admin.enrollments.statusPending")}
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold uppercase tracking-wide border border-emerald-500/20">
            <Check size={12} />
            {t("admin.enrollments.statusApproved")}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-bold uppercase tracking-wide border border-red-500/20">
            <X size={12} />
            {t("admin.enrollments.statusRejected")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="bg-[#bd9759]/10 p-3 rounded-2xl border border-[#bd9759]/20">
          <ClipboardList className="text-[#e0a84d] w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t("admin.enrollments.title")}
          </h1>
          <p className="text-zinc-400 mt-1">
            {t("admin.enrollments.subtitle")}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative p-4 rounded-2xl border transition-all text-left ${
              activeTab === tab.key
                ? "bg-zinc-800/80 border-[#bd9759]/40 shadow-lg shadow-[#bd9759]/5"
                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">{tab.label}</p>
            <p className={`text-2xl font-black ${activeTab === tab.key ? tab.color : "text-zinc-300"}`}>
              {tab.count}
            </p>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#bd9759] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-[#bd9759]" size={40} />
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="text-zinc-500 w-8 h-8" />
          </div>
          <p className="text-zinc-400 text-lg font-medium">{t("admin.enrollments.noEnrollments")}</p>
          <p className="text-zinc-600 text-sm mt-1">No enrollment requests match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className={`bg-zinc-900/60 border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-zinc-700 ${
                enrollment.status === "PENDING"
                  ? "border-amber-500/20"
                  : "border-zinc-800"
              }`}
            >
              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-[#bd9759]/10 flex items-center justify-center shrink-0 border border-[#bd9759]/20">
                    <UserIcon className="text-[#e0a84d]" size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base leading-tight truncate">
                      {enrollment.user.name}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate">{enrollment.user.email}</p>
                  </div>
                  {getStatusBadge(enrollment.status)}
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-zinc-400 pl-[52px]">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[#bd9759]" />
                    <span className="font-medium text-zinc-300">{enrollment.track.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-500" />
                    <span>
                      {t("admin.enrollments.appliedAgo").replace("{time}", formatDistanceToNow(new Date(enrollment.enrolledAt)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pl-[52px] md:pl-0">
                {enrollment.status !== "APPROVED" && (
                  <button
                    onClick={() => updateStatus(enrollment.id, "APPROVED")}
                    disabled={updatingId === enrollment.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white font-semibold transition-all border border-emerald-500/20 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingId === enrollment.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {t("admin.enrollments.approve")}
                  </button>
                )}
                {enrollment.status !== "REJECTED" && (
                  <button
                    onClick={() => updateStatus(enrollment.id, "REJECTED")}
                    disabled={updatingId === enrollment.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-semibold transition-all border border-red-500/20 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingId === enrollment.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    {t("admin.enrollments.reject")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
