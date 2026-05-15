"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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

// Real backend logging interface
interface AuditLog {
  id: string;
  adminId: string | null;
  admin: { name: string; email: string } | null;
  action: string;
  category: string;
  severity: string;
  timestamp: string;
  ip: string | null;
}

export default function AdminLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin/logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const adminName = log.admin?.name || "System";
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adminName.toLowerCase().includes(searchTerm.toLowerCase());
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
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
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
                        by <span className="font-medium">{log.admin?.name || "System"}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        IP: {log.ip || "N/A"}
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
