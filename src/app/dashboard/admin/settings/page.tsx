"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Megaphone,
  Server,
  Copy,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  value: number;
  expiryDate: string | null;
  createdAt: string;
  _count: { payments: number };
}

export default function AdminSettingsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Coupon form state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [newValue, setNewValue] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [formError, setFormError] = useState("");

  // Announcement state
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setIsLoadingCoupons(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreateCoupon = async () => {
    setFormError("");
    if (!newCode.trim()) {
      setFormError("Coupon code is required");
      return;
    }
    if (!newValue || parseFloat(newValue) <= 0) {
      setFormError("Discount value must be greater than 0");
      return;
    }
    if (newType === "PERCENTAGE" && parseFloat(newValue) > 100) {
      setFormError("Percentage cannot exceed 100");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.toUpperCase(),
          discountType: newType,
          value: parseFloat(newValue),
          expiryDate: newExpiry || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => [{ ...data.coupon, _count: { payments: 0 } }, ...prev]);
        setNewCode("");
        setNewValue("");
        setNewExpiry("");
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to create coupon");
      }
    } catch (err) {
      setFormError("Network error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Manage promotions, announcements, and platform configuration.</p>
      </div>

      {/* Global Announcement */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" />
            <CardTitle>Global Announcement Banner</CardTitle>
          </div>
          <CardDescription>Display a persistent message across the entire platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="e.g., Scheduled maintenance on Friday at 2 AM UTC"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="flex-1 bg-background"
            />
            <Button
              variant={announcementActive ? "destructive" : "default"}
              onClick={() => setAnnouncementActive(!announcementActive)}
              className="shrink-0"
            >
              {announcementActive ? "Deactivate" : "Activate Banner"}
            </Button>
          </div>
          {announcementActive && announcementText && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
              <strong>Preview:</strong> {announcementText}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Management */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-accent" />
            <CardTitle>Coupon Management</CardTitle>
          </div>
          <CardDescription>Create and manage platform-wide discount codes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Coupon Form */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground">Create New Coupon</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Code (e.g. RAMADAN2026)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="bg-background font-mono"
              />
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    newType === "PERCENTAGE"
                      ? "bg-brand-primary text-white"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setNewType("PERCENTAGE")}
                >
                  <Percent className="h-3 w-3 inline mr-1" /> Percentage
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    newType === "FIXED"
                      ? "bg-brand-primary text-white"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setNewType("FIXED")}
                >
                  <DollarSign className="h-3 w-3 inline mr-1" /> Fixed
                </button>
              </div>
              <Input
                type="number"
                placeholder={newType === "PERCENTAGE" ? "Value (%)" : "Amount ($)"}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-background"
              />
              <Input
                type="date"
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="bg-background"
              />
            </div>
            {formError && (
              <p className="text-xs text-red-500 font-medium">{formError}</p>
            )}
            <Button onClick={handleCreateCoupon} disabled={isCreating} className="gap-2">
              <Plus className="h-4 w-4" />
              {isCreating ? "Creating..." : "Create Coupon"}
            </Button>
          </div>

          {/* Coupon List */}
          {isLoadingCoupons ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              No coupons created yet. Create your first promotion above.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Discount</th>
                    <th className="px-6 py-4">Expiry</th>
                    <th className="px-6 py-4 text-right">Uses</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-muted/80 ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">{c.code}</span>
                          <button
                            onClick={() => copyCode(c.code, c.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedId === c.id ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 text-brand-accent px-2.5 py-0.5 text-xs font-medium border border-brand-accent/20">
                          {c.discountType === "PERCENTAGE" ? (
                            <><Percent className="h-3 w-3" /> {c.value}%</>
                          ) : (
                            <><DollarSign className="h-3 w-3" /> {c.value.toFixed(2)}</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {c.expiryDate ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(c.expiryDate), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-medium">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {c._count.payments}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDeleteCoupon(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" />
            <CardTitle>Platform Information</CardTitle>
          </div>
          <CardDescription>Environment and system configuration details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Framework", value: "Next.js 16.2.4" },
              { label: "Database", value: "PostgreSQL (Prisma ORM)" },
              { label: "Authentication", value: "JWT (jose)" },
              { label: "Runtime", value: typeof window === "undefined" ? "Server" : "Client" },
              { label: "Node.js", value: "v22.x LTS" },
              { label: "Hosting", value: "Azure (Configured)" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
