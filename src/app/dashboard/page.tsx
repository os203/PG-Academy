"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardGateway() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user?.role) {
        // Redirect to their specific dashboard based on role
        router.push(`/dashboard/${user.role.toLowerCase()}`);
      } else {
        // If no user/role, send back to login
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-brand-primary mb-4" />
      <p className="text-muted-foreground animate-pulse">Routing to your secure dashboard...</p>
    </div>
  );
}
