"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Ticket,
  Plus,
  Trash2,
  Loader2,
  Percent,
  DollarSign,
  X,
  Calendar,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  value: number;
  expiryDate: string | null;
  createdAt: string;
  _count: {
    payments: number;
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          value: parseFloat(value),
          expiryDate: expiryDate || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        setCode("");
        setValue("");
        setExpiryDate("");
        fetchCoupons();
      } else {
        alert(data.error || "Failed to create coupon");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete coupon");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setDeleting(null);
    }
  };

  const activeCoupons = coupons.filter(
    (c) => !c.expiryDate || new Date(c.expiryDate) > new Date()
  );
  const expiredCoupons = coupons.filter(
    (c) => c.expiryDate && new Date(c.expiryDate) <= new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Coupon Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for your tracks.
          </p>
        </div>
        <Button
          className="bg-brand-primary text-white hover:bg-brand-primary/90 gap-2"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Coupons
                </p>
                <p className="text-2xl font-bold mt-1">{coupons.length}</p>
              </div>
              <Ticket className="h-8 w-8 text-brand-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider">
                  Active
                </p>
                <p className="text-2xl font-bold mt-1">{activeCoupons.length}</p>
              </div>
              <Percent className="h-8 w-8 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-500 uppercase tracking-wider">
                  Expired
                </p>
                <p className="text-2xl font-bold mt-1">{expiredCoupons.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>All Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              <Ticket className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p>No coupons created yet. Click &quot;Create Coupon&quot; to get started.</p>
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
                    <th className="px-6 py-4 text-right">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon, idx) => {
                    const isExpired =
                      coupon.expiryDate &&
                      new Date(coupon.expiryDate) <= new Date();
                    return (
                      <tr
                        key={coupon.id}
                        className={`transition-colors hover:bg-muted/80 ${
                          idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                        } ${deleting === coupon.id ? "opacity-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold bg-muted px-2.5 py-1 rounded">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            {coupon.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1">
                            {coupon.discountType === "PERCENTAGE" ? (
                              <>
                                <Percent className="h-3.5 w-3.5 text-brand-accent" />
                                <span className="font-medium">{coupon.value}%</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="font-medium">${coupon.value}</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {coupon.expiryDate
                            ? format(new Date(coupon.expiryDate), "MMM d, yyyy")
                            : "No expiry"}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {coupon._count.payments}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isExpired
                                ? "bg-red-500/10 text-red-500"
                                : "bg-emerald-500/10 text-emerald-500"
                            }`}
                          >
                            {isExpired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={deleting === coupon.id}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-medium transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-brand-primary/50 shadow-2xl relative overflow-hidden bg-background">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Create New Coupon</CardTitle>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Coupon Code
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. SUMMER25"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="font-mono uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) =>
                        setDiscountType(
                          e.target.value as "PERCENTAGE" | "FIXED"
                        )
                      }
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Value
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={discountType === "PERCENTAGE" ? "100" : undefined}
                      step="0.01"
                      placeholder={
                        discountType === "PERCENTAGE" ? "25" : "10.00"
                      }
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Expiry Date (optional)
                  </label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-brand-primary text-white hover:bg-brand-primary/90"
                    disabled={creating}
                  >
                    {creating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Coupon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
