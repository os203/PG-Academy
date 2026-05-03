"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

import Sidebar from "@/components/layout/Sidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground animate-pulse">Loading secure dashboard...</p>
      </div>
    );
  }

  // Double check authorization on the client side just in case
  if (user && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-950/20 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You do not have permission to view the Admin Dashboard.</p>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

      <div className="sticky top-0 z-50 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1">

        <div className="sticky top-0 z-30">
          <DashboardNavbar />
        </div>

        <div className="flex-1 bg-background p-8 py-12">
          {children}
        </div>

        <Footer />

      </div>
    </div>
  );
}
