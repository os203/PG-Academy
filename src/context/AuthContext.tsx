"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs";

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDbUser() {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        setDbUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setDbUser(data.user);
        } else {
          setDbUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch DB user profile", error);
        setDbUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDbUser();
  }, [isLoaded, isSignedIn, userId]);

  return (
    <AuthContext.Provider
      value={{
        user: dbUser,
        isAuthenticated: !!isSignedIn && !!dbUser,
        isLoading: !isLoaded || loading,
        logout: () => signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
