"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type') ?? '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { error: await res.text() };

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      login(data.user);
      router.push(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthLayout>
        <div className="min-h-[calc(100vh-80px)] flex flex-1 items-center justify-center p-4 relative overflow-hidden">
          {/* Abstract decorative blobs */}
          <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent/30 dark:bg-brand-accent/20 blur-[100px] dark:mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary/30 dark:bg-brand-primary/20 blur-[100px] dark:mix-blend-screen pointer-events-none" />

          <div className="w-full max-w-md p-8 rounded-2xl glass border border-border shadow-2xl relative z-10 hover-lift">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome Back</h1>
              <p className="text-muted-foreground">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="text-sm font-medium text-brand-accent hover:underline transition-all">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/register" className="font-medium text-brand-accent hover:underline transition-all">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
