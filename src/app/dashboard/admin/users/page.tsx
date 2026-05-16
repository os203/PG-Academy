"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update role");
      }
    } catch (err) {
      console.error("Role change failed", err);
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
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Delete failed", err);
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
          (data.tracks || []).map((c: { id: string; title: string }) => ({
            id: c.id,
            title: c.title,
          }))
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
        body: JSON.stringify({
          userId: enrollModalUser.id,
          trackId: selectedCourseId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Enrolled successfully!");
        setEnrollModalUser(null);
        // Refresh users to update enrollment count
        fetchUsers();
      } else {
        alert(data.error || "Failed to enroll");
      }
    } catch {
      alert("An error occurred");
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
        alert("Instructor created successfully!");
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
      u.name,
      u.email,
      u.role,
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
      case "ADMIN":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "INSTRUCTOR":
        return <GraduationCap className="h-4 w-4 text-brand-accent" />;
      default:
        return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "INSTRUCTOR":
        return "bg-brand-accent/10 text-brand-accent border-brand-accent/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const instructorCount = users.filter((u) => u.role === "INSTRUCTOR").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage accounts, roles, and access across PG Academy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setCreateInstructorModalOpen(true)} className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90">
            <UserPlus className="h-4 w-4" /> Create Instructor
          </Button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter("ALL")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-bold mt-1">{users.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-card border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${roleFilter === "STUDENT" ? "ring-2 ring-blue-500" : ""}`} onClick={() => setRoleFilter(roleFilter === "STUDENT" ? "ALL" : "STUDENT")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-500 uppercase tracking-wider">Students</p>
                <p className="text-2xl font-bold mt-1">{studentCount}</p>
              </div>
              <User className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-card border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${roleFilter === "INSTRUCTOR" ? "ring-2 ring-brand-accent" : ""}`} onClick={() => setRoleFilter(roleFilter === "INSTRUCTOR" ? "ALL" : "INSTRUCTOR")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-accent uppercase tracking-wider">Instructors</p>
                <p className="text-2xl font-bold mt-1">{instructorCount}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-brand-accent/20" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-card border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${roleFilter === "ADMIN" ? "ring-2 ring-red-500" : ""}`} onClick={() => setRoleFilter(roleFilter === "ADMIN" ? "ALL" : "ADMIN")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-500 uppercase tracking-wider">Admins</p>
                <p className="text-2xl font-bold mt-1">{adminCount}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>
              {roleFilter === "ALL" ? "All Users" : `${roleFilter.charAt(0) + roleFilter.slice(1).toLowerCase()}s`}
              {" "}({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-8 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-background hover:bg-accent px-3 h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Role</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                    {["ALL", "STUDENT", "INSTRUCTOR", "ADMIN"].map((role) => (
                      <DropdownMenuItem
                        key={role}
                        className={`cursor-pointer ${roleFilter === role ? "bg-accent" : ""}`}
                        onSelect={() => setRoleFilter(role)}
                      >
                        {role === "ALL" ? "All Roles" : role.charAt(0) + role.slice(1).toLowerCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              Loading users data...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              {searchTerm || roleFilter !== "ALL"
                ? "No users match your search criteria."
                : "No users found."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Joined</th>
                    <th className="px-6 py-4 text-right">Activity</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`transition-colors hover:bg-muted/80 ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                      } ${actionLoading === u.id ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                          {getRoleIcon(u.role)}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {format(new Date(u.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role === "INSTRUCTOR" ? (
                          <span className="text-xs font-medium">{u._count.tracks} Tracks</span>
                        ) : (
                          <span className="text-xs font-medium">{u._count.enrollments} Enrollments</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Key className="mr-2 h-4 w-4" /> Force Password Reset
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={() => openEnrollModal(u)}
                              >
                                <BookOpen className="mr-2 h-4 w-4" /> Enroll in Track
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              {["STUDENT", "INSTRUCTOR", "ADMIN"]
                                .filter((r) => r !== u.role)
                                .map((role) => (
                                  <DropdownMenuItem
                                    key={role}
                                    className="cursor-pointer"
                                    onSelect={() => handleRoleChange(u.id, role)}
                                  >
                                    <ArrowUpDown className="mr-2 h-4 w-4" />
                                    Make {role.charAt(0) + role.slice(1).toLowerCase()}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                              onSelect={() => handleDelete(u.id, u.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Modal */}
      {enrollModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-brand-primary/50 shadow-2xl relative overflow-hidden bg-background">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-primary to-brand-accent" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Enroll in Track</CardTitle>
                <button
                  onClick={() => setEnrollModalUser(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enrolling <span className="font-medium text-foreground">{enrollModalUser.name}</span> ({enrollModalUser.email})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {coursesLoading ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading tracks...
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Select Track
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">Choose a track...</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEnrollModalUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-brand-primary text-white hover:bg-brand-primary/90"
                  onClick={handleEnroll}
                  disabled={!selectedCourseId || enrolling}
                >
                  {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enroll Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Instructor Modal */}
      {createInstructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Create Instructor</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Provision a new instructor account manually.
                </p>
              </div>
              <button
                onClick={() => setCreateInstructorModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInstructor} className="p-6 space-y-4">
              {instructorError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                  {instructorError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  required
                  placeholder="John Doe"
                  value={newInstructor.name}
                  onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  required
                  type="email"
                  placeholder="john@pgacademy.com"
                  value={newInstructor.email}
                  onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Temporary Password</label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newInstructor.password}
                  onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">The instructor can change this later.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateInstructorModalOpen(false)}
                  disabled={creatingInstructor}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingInstructor}
                  className="bg-brand-primary text-white"
                >
                  {creatingInstructor ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
