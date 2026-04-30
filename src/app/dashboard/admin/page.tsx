"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center p-4"><p className="text-muted-foreground animate-pulse">Loading secure dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-background/95 p-4">
      <Card className="max-w-md w-full border-red-500/30 shadow-lg shadow-red-500/5">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Admin Dashboard</CardTitle>
          <CardDescription>System Administration & Oversight</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 p-4 bg-red-500/10 rounded-lg">
            <h3 className="font-semibold text-lg text-foreground">Welcome back, {user?.name}</h3>
            <p className="text-sm text-muted-foreground">Logged in as: <span className="font-mono text-red-600 dark:text-red-400 font-bold">{user?.role}</span></p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <Button onClick={logout} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
              Secure Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
