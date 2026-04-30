"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InstructorDashboard() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center p-4"><p className="text-muted-foreground animate-pulse">Loading teaching dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-background/95 p-4">
      <Card className="max-w-md w-full border-emerald-500/30 shadow-lg shadow-emerald-500/5">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Instructor Dashboard</CardTitle>
          <CardDescription>Course Management & Analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 p-4 bg-emerald-500/10 rounded-lg">
            <h3 className="font-semibold text-lg text-foreground">Welcome back, {user?.name}</h3>
            <p className="text-sm text-muted-foreground">Logged in as: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{user?.role}</span></p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <Button onClick={logout} variant="outline" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              Secure Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
