"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    }
    setUser(null);
    localStorage.removeItem('lastActivityTime');
    router.push('/login');
  }, [router]);

  const silentRefresh = async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Silent refresh failed', error);
      setUser(null);
    }
  };

  // 1. Initial auth check & Exit timeout check
  useEffect(() => {
    let isMounted = true;

    const checkActivity = () => {
      const lastActivity = localStorage.getItem('lastActivityTime');
      if (lastActivity) {
        const timeAway = Date.now() - parseInt(lastActivity, 10);
        // 15 minutes timeout
        if (timeAway > 15 * 60 * 1000) {
          logout();
          return true; // expired
        }
      }
      return false; // valid
    };

    const doInitialRefresh = async () => {
      if (checkActivity()) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error('Initial auth fetch failed', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    doInitialRefresh();

    // Check activity on tab switch / visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, logout]);

  // 2. Activity Tracker & JWT Refresh
  useEffect(() => {
    if (!user) return;

    // Refresh the token every 14 minutes (since it expires in 15m)
    const tokenInterval = setInterval(() => {
      silentRefresh();
    }, 14 * 60 * 1000);

    // --- Activity Tracking Logic ---
    const updateActivity = () => {
      localStorage.setItem('lastActivityTime', Date.now().toString());
    };

    // Update immediately
    updateActivity();

    // Keep session alive if tab is visibly open
    const activityInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    }, 60 * 1000);

    // Also update on basic interactions (throttled to 1 min)
    const handleInteraction = () => {
      const last = parseInt(localStorage.getItem('lastActivityTime') || '0', 10);
      if (Date.now() - last > 60 * 1000) {
        updateActivity();
      }
    };

    window.addEventListener('mousemove', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('scroll', handleInteraction, { passive: true });

    return () => {
      clearInterval(tokenInterval);
      clearInterval(activityInterval);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatarUrl: data.avatarUrl,
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
