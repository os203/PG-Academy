"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Check, X, User as UserIcon, BookOpen, Calendar } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const { t, locale } = useLanguage();

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
    }
  };

  const filteredEnrollments = enrollments.filter(
    (e) => activeTab === "ALL" || e.status === activeTab
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {t("admin.enrollments.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.enrollments.subtitle")}
        </p>
      </div>

      {/* Pill-shaped Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "ALL" | "PENDING" | "APPROVED" | "REJECTED")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-brand-primary text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab === "ALL" ? t("admin.enrollments.all") : 
             tab === "PENDING" ? t("admin.enrollments.pending") :
             tab === "APPROVED" ? t("admin.enrollments.approved") :
             t("admin.enrollments.rejected")}
            {tab !== "ALL" && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {enrollments.filter((e) => e.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center shadow-sm">
          <p className="text-gray-500 text-lg">{t("admin.enrollments.noEnrollments")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:border-brand-primary/30"
            >
              {/* Info section */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon className="text-brand-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none mb-1">
                      {enrollment.user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                  </div>
                  {enrollment.status === "PENDING" && (
                    <span className="ml-auto md:ml-4 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide">
                      {t("admin.enrollments.statusPending")}
                    </span>
                  )}
                  {enrollment.status === "APPROVED" && (
                    <span className="ml-auto md:ml-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                      {t("admin.enrollments.statusApproved")}
                    </span>
                  )}
                  {enrollment.status === "REJECTED" && (
                    <span className="ml-auto md:ml-4 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide">
                      {t("admin.enrollments.statusRejected")}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-400" />
                    <span className="font-medium">{enrollment.track.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" />
                    <span>
                      {t("admin.enrollments.appliedAgo").replace("{time}", formatDistanceToNow(new Date(enrollment.enrolledAt)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions section */}
              <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                {enrollment.status !== "APPROVED" && (
                  <button
                    onClick={() => updateStatus(enrollment.id, "APPROVED")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold transition-colors flex-1 md:flex-auto justify-center"
                  >
                    <Check size={18} />
                    {t("admin.enrollments.approve")}
                  </button>
                )}
                {enrollment.status !== "REJECTED" && (
                  <button
                    onClick={() => updateStatus(enrollment.id, "REJECTED")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-600 hover:text-white font-semibold transition-colors flex-1 md:flex-auto justify-center"
                  >
                    <X size={18} />
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
