"use client";

import { useState } from "react";
import { format, subHours, subMinutes, subDays } from "date-fns";
import {
  ScrollText,
  Shield,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Activity,
  Wifi,
  HardDrive,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock audit log data — will be replaced with real backend logging
const mockAuditLogs = [
  {
    id: "log_001",
    admin: "Admin User",
    action: "Changed role of 'Omar Salameh' from STUDENT to INSTRUCTOR",
    category: "USER_MGMT",
    severity: "info" as const,
    timestamp: subMinutes(new Date(), 15).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "log_002",
    admin: "Admin User",
    action: "Approved course 'Advanced React Patterns' for publication",
    category: "CONTENT",
    severity: "info" as const,
    timestamp: subHours(new Date(), 2).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "log_003",
    admin: "System",
    action: "Automated database backup completed successfully",
    category: "SYSTEM",
    severity: "success" as const,
    timestamp: subHours(new Date(), 6).toISOString(),
    ip: "127.0.0.1",
  },
  {
    id: "log_004",
    admin: "System",
    action: "Stripe webhook endpoint returned 502 — retrying in 30s",
    category: "PAYMENT",
    severity: "warning" as const,
    timestamp: subHours(new Date(), 8).toISOString(),
    ip: "52.89.214.238",
  },
  {
    id: "log_005",
    admin: "Admin User",
    action: "Created coupon code 'RAMADAN2026' — 20% off, no expiry",
    category: "FINANCE",
    severity: "info" as const,
    timestamp: subHours(new Date(), 12).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "log_006",
    admin: "System",
    action: "Database connection pool exhausted — auto-scaled from 10 to 20 connections",
    category: "SYSTEM",
    severity: "warning" as const,
    timestamp: subDays(new Date(), 1).toISOString(),
    ip: "127.0.0.1",
  },
  {
    id: "log_007",
    admin: "Admin User",
    action: "Deleted user account 'test@example.com' (GDPR request)",
    category: "USER_MGMT",
    severity: "error" as const,
    timestamp: subDays(new Date(), 1).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "log_008",
    admin: "System",
    action: "SSL certificate renewal triggered — expires in 14 days",
    category: "SYSTEM",
    severity: "info" as const,
    timestamp: subDays(new Date(), 2).toISOString(),
    ip: "127.0.0.1",
  },
  {
    id: "log_009",
    admin: "Admin User",
    action: "Force-unpublished course 'Outdated Tutorial' due to policy violation",
    category: "CONTENT",
    severity: "warning" as const,
    timestamp: subDays(new Date(), 3).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "log_010",
    admin: "System",
    action: "Failed to send welcome email to 'new_user@mail.com' — SMTP timeout",
    category: "SYSTEM",
    severity: "error" as const,
    timestamp: subDays(new Date(), 3).toISOString(),
    ip: "127.0.0.1",
  },
];

export default function AdminLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || log.category === categoryFilter;
    const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" /> OK
          </span>
        );
      case "info":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 text-xs font-medium">
            <Activity className="h-3 w-3" /> Info
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 text-xs font-medium">
            <AlertTriangle className="h-3 w-3" /> Warn
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 text-xs font-medium">
            <XCircle className="h-3 w-3" /> Error
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      USER_MGMT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      CONTENT: "bg-brand-accent/10 text-brand-accent border-brand-accent/20",
      SYSTEM: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      PAYMENT: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      FINANCE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[category] || "bg-muted text-muted-foreground"}`}>
        {category.replace("_", " ")}
      </span>
    );
  };

  const categories = ["ALL", "USER_MGMT", "CONTENT", "SYSTEM", "PAYMENT", "FINANCE"];
  const severities = ["ALL", "success", "info", "warning", "error"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Logs</h1>
        <p className="text-muted-foreground">
          Audit trail, admin actions, and system health monitoring.
        </p>
      </div>

      {/* System Health Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Database className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Database</p>
                <p className="text-sm font-bold text-emerald-500">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Server className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">API Server</p>
                <p className="text-sm font-bold text-emerald-500">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Wifi className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">CDN/Network</p>
                <p className="text-sm font-bold text-emerald-500">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <HardDrive className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Storage</p>
                <p className="text-sm font-bold text-amber-500">68% used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>Read-only record of all admin and system actions</CardDescription>
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search logs..."
                  className="pl-8 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    categoryFilter === cat
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat === "ALL" ? "All" : cat.replace("_", " ")}
                </button>
              ))}
              <span className="text-xs text-muted-foreground self-center ml-3 mr-1">Severity:</span>
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    severityFilter === sev
                      ? sev === "error"
                        ? "bg-red-500 text-white"
                        : sev === "warning"
                          ? "bg-amber-500 text-white"
                          : sev === "success"
                            ? "bg-emerald-500 text-white"
                            : "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sev === "ALL" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              No logs match your filter criteria.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="shrink-0 mt-0.5">{getSeverityBadge(log.severity)}</div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm text-foreground leading-tight">{log.action}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(log.category)}
                      <span className="text-[10px] text-muted-foreground">
                        by <span className="font-medium">{log.admin}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        IP: {log.ip}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
