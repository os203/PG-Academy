"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import {
  Shield,
  User,
  GraduationCap,
  MoreHorizontal,
  Key,
  Search,
  Download,
  UserPlus,
  Filter,
  Trash2,
  ArrowUpDown,
  BookOpen,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    enrollments: number;
    tracks: number;
  };
}

interface CourseOption {
  id: string;
  title: string;
}

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roleFilterOpen, setRoleFilterOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Role change confirmation modal
  const [roleChangeModal, setRoleChangeModal] = useState<{
    user: AdminUser;
    newRole: string;
  } | null>(null);

  // Enrollment modal state
  const [enrollModalUser, setEnrollModalUser] = useState<AdminUser | null>(null);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Create Instructor modal state
  const [createInstructorModalOpen, setCreateInstructorModalOpen] = useState(false);
  const [newInstructor, setNewInstructor] = useState({ name: "", email: "", password: "" });
  const [creatingInstructor, setCreatingInstructor] = useState(false);
  const [instructorError, setInstructorError] = useState("");

  // Actions dropdown per user
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const confirmRoleChange = async () => {
    if (!roleChangeModal) return;
    const { user: targetUser, newRole } = roleChangeModal;
    setActionLoading(targetUser.id);
    setRoleChangeModal(null);

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
        showToast(t("admin.roleChangeSuccess"), "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update role", "error");
      }
    } catch (err) {
      console.error("Role change failed", err);
      showToast("An error occurred", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${userName}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast("User deleted successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete user", "error");
      }
    } catch (err) {
      console.error("Delete failed", err);
      showToast("An error occurred", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const openEnrollModal = async (user: AdminUser) => {
    setEnrollModalUser(user);
    setSelectedCourseId("");
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/admin/tracks");
      if (res.ok) {
        const data = await res.json();
        setAvailableCourses(
          (data.tracks || []).map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }))
        );
      }
    } catch (err) {
      console.error("Failed to load tracks", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!enrollModalUser || !selectedCourseId) return;
    setEnrolling(true);
    try {
      const res = await fetch("/api/admin/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: enrollModalUser.id, trackId: selectedCourseId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Enrolled successfully!", "success");
        setEnrollModalUser(null);
        fetchUsers();
      } else {
        showToast(data.error || "Failed to enroll", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setEnrolling(false);
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructor.name || !newInstructor.email || !newInstructor.password) {
      setInstructorError("All fields are required");
      return;
    }
    setCreatingInstructor(true);
    setInstructorError("");
    try {
      const res = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInstructor),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Instructor created successfully!", "success");
        setCreateInstructorModalOpen(false);
        setNewInstructor({ name: "", email: "", password: "" });
        fetchUsers();
      } else {
        setInstructorError(data.error || "Failed to create instructor");
      }
    } catch {
      setInstructorError("An error occurred");
    } finally {
      setCreatingInstructor(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Joined", "Enrollments", "Tracks"];
    const rows = filteredUsers.map((u) => [
      u.name, u.email, u.role,
      format(new Date(u.createdAt), "yyyy-MM-dd"),
      u._count.enrollments.toString(),
      u._count.tracks.toString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pg-academy-users-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return <Shield className="h-4 w-4 text-red-400" />;
      case "INSTRUCTOR": return <GraduationCap className="h-4 w-4 text-[#bd9759]" />;
      default: return <User className="h-4 w-4 text-blue-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "INSTRUCTOR": return "bg-[#bd9759]/10 text-[#bd9759] border-[#bd9759]/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const instructorCount = users.filter((u) => u.role === "INSTRUCTOR").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 inset-e-6 z-100 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success"
            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            : "bg-red-500/15 border border-red-500/30 text-red-400"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {t("admin.userManagement")}
          </h1>
          <p className="text-zinc-400">{t("admin.userManagementDesc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="gold-outline-btn px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
            <Download className="h-4 w-4" /> {t("admin.exportCSV")}
          </button>
          <button onClick={() => setCreateInstructorModalOpen(true)} className="gold-btn px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> {t("admin.createInstructor")}
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t("admin.totalUsers"), count: users.length, icon: <UserPlus className="h-7 w-7 text-zinc-600" />, filter: "ALL", ring: "" },
          { label: t("admin.studentsCount"), count: studentCount, icon: <User className="h-7 w-7 text-blue-500/30" />, filter: "STUDENT", ring: "ring-blue-500" },
          { label: t("admin.instructorsCount"), count: instructorCount, icon: <GraduationCap className="h-7 w-7 text-[#bd9759]/30" />, filter: "INSTRUCTOR", ring: "ring-[#bd9759]" },
          { label: t("admin.adminsCount"), count: adminCount, icon: <Shield className="h-7 w-7 text-red-500/30" />, filter: "ADMIN", ring: "ring-red-500" },
        ].map((card) => (
          <div
            key={card.filter}
            onClick={() => setRoleFilter(roleFilter === card.filter ? "ALL" : card.filter)}
            className={`bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-all ${
              roleFilter === card.filter && card.filter !== "ALL" ? `ring-2 ${card.ring}` : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold mt-1 text-white">{card.count}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white">
              {roleFilter === "ALL" ? t("admin.allUsers") : `${roleFilter.charAt(0) + roleFilter.slice(1).toLowerCase()}s`}
              {" "}({filteredUsers.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute inset-s-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={t("admin.searchUsers")}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg ps-9 pe-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#bd9759]/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setRoleFilterOpen(!roleFilterOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm hover:bg-zinc-800"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("admin.role")}</span>
                </button>
                {roleFilterOpen && (
                  <div className="absolute inset-e-0 top-full mt-1 w-40 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl z-50 overflow-hidden">
                    {["ALL", "STUDENT", "INSTRUCTOR", "ADMIN"].map((role) => (
                      <button
                        key={role}
                        onClick={() => { setRoleFilter(role); setRoleFilterOpen(false); }}
                        className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${
                          roleFilter === role ? "bg-[#bd9759]/10 text-[#e0a84d]" : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {role === "ALL" ? t("admin.allRoles") : role.charAt(0) + role.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin text-[#bd9759]" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            {searchTerm || roleFilter !== "ALL" ? t("common.noResults") : "No users found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <th className="px-6 py-4">{t("admin.name")}</th>
                  <th className="px-6 py-4">{t("admin.role")}</th>
                  <th className="px-6 py-4 text-end">{t("admin.joined")}</th>
                  <th className="px-6 py-4 text-end">{t("admin.activity")}</th>
                  <th className="px-6 py-4 text-end">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-zinc-800/50 ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-zinc-900/30"
                    } ${actionLoading === u.id ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#bd9759]/30 to-[#e0a84d]/20 flex items-center justify-center text-xs font-bold text-[#e0a84d]">
                          {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{u.name}</div>
                          <div className="text-zinc-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end text-zinc-500">
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-end">
                      {u.role === "INSTRUCTOR" ? (
                        <span className="text-xs font-medium text-zinc-400">{u._count.tracks} {t("admin.tracksCount")}</span>
                      ) : (
                        <span className="text-xs font-medium text-zinc-400">{u._count.enrollments} {t("admin.enrollmentsCount")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openDropdownId === u.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                            <div className="absolute inset-e-0 top-full mt-1 w-52 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl z-50 overflow-hidden">
                              <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase">{t("admin.adminActions")}</div>
                              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-start">
                                <User className="h-4 w-4" /> {t("admin.viewProfile")}
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-start">
                                <Key className="h-4 w-4" /> {t("admin.forcePasswordReset")}
                              </button>
                              <button
                                onClick={() => { openEnrollModal(u); setOpenDropdownId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-start"
                              >
                                <BookOpen className="h-4 w-4" /> {t("admin.enrollInTrack")}
                              </button>

                              <div className="border-t border-zinc-800 my-1" />
                              <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase">{t("admin.changeRole")}</div>
                              {["STUDENT", "INSTRUCTOR", "ADMIN"]
                                .filter((r) => r !== u.role)
                                .map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => {
                                      setRoleChangeModal({ user: u, newRole: role });
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-start"
                                  >
                                    <ArrowUpDown className="h-4 w-4" />
                                    {t(`admin.make${role.charAt(0) + role.slice(1).toLowerCase()}`)}
                                  </button>
                                ))}

                              <div className="border-t border-zinc-800 my-1" />
                              <button
                                onClick={() => { handleDelete(u.id, u.name); setOpenDropdownId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-start"
                              >
                                <Trash2 className="h-4 w-4" /> {t("admin.deleteAccount")}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== ROLE CHANGE CONFIRMATION MODAL ===== */}
      {roleChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("admin.confirmRoleChange")}</h3>
              <p className="text-zinc-400 text-sm">
                {t("admin.confirmRoleChangeMsg", {
                  name: roleChangeModal.user.name,
                  from: roleChangeModal.user.role,
                  to: roleChangeModal.newRole,
                })}
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setRoleChangeModal(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmRoleChange}
                className="flex-1 gold-btn px-4 py-2.5 rounded-lg text-sm"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ENROLLMENT MODAL ===== */}
      {enrollModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-linear-to-r from-[#bd9759] to-[#e0a84d]" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{t("enroll.title")}</h3>
                <button onClick={() => setEnrollModalUser(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                {t("enroll.enrolling")} <span className="font-medium text-white">{enrollModalUser.name}</span> ({enrollModalUser.email})
              </p>
              {coursesLoading ? (
                <div className="flex items-center gap-2 py-4 text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("enroll.loadingTracks")}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">{t("enroll.selectTrack")}</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#bd9759]/50"
                  >
                    <option value="">{t("enroll.chooseTrack")}</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setEnrollModalUser(null)} className="px-4 py-2.5 rounded-lg text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  {t("common.cancel")}
                </button>
                <button
                  className="gold-btn px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
                  onClick={handleEnroll}
                  disabled={!selectedCourseId || enrolling}
                >
                  {enrolling && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("enroll.enrollStudent")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE INSTRUCTOR MODAL ===== */}
      {createInstructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{t("admin.createInstructor")}</h3>
                <p className="text-sm text-zinc-500 mt-1">{t("admin.createInstructorDesc")}</p>
              </div>
              <button onClick={() => setCreateInstructorModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            <form onSubmit={handleCreateInstructor} className="p-6 space-y-4">
              {instructorError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{instructorError}</div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">{t("admin.fullName")}</label>
                <input
                  required
                  placeholder="John Doe"
                  value={newInstructor.name}
                  onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#bd9759]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">{t("admin.emailAddress")}</label>
                <input
                  required
                  type="email"
                  placeholder="john@pgacademy.com"
                  value={newInstructor.email}
                  onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#bd9759]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">{t("admin.tempPassword")}</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newInstructor.password}
                  onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#bd9759]/50"
                />
                <p className="text-xs text-zinc-500">{t("admin.tempPasswordHint")}</p>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setCreateInstructorModalOpen(false)} disabled={creatingInstructor}
                  className="px-4 py-2.5 rounded-lg text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  {t("common.cancel")}
                </button>
                <button type="submit" disabled={creatingInstructor} className="gold-btn px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-60">
                  {creatingInstructor ? (<><Loader2 className="h-4 w-4 animate-spin" /> {t("admin.creatingAccount")}</>) : t("admin.createAccount")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
