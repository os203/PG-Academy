"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Shield,
  User,
  GraduationCap,
  MoreHorizontal,
  Ban,
  Key,
  Search,
  Download,
  UserPlus,
  Filter,
  Trash2,
  ArrowUpDown,
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
    courses: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Joined", "Enrollments", "Courses"];
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.role,
      format(new Date(u.createdAt), "yyyy-MM-dd"),
      u._count.enrollments.toString(),
      u._count.courses.toString(),
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
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
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
                          <span className="text-xs font-medium">{u._count.courses} Courses</span>
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
    </div>
  );
}
