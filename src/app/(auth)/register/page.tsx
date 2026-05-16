"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, User, ArrowRight, Eye, EyeOff, UserPlus, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
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

  if (showForm) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-1 items-center justify-center p-4 relative overflow-hidden bg-[#0A0A0A] text-white">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5C158]/5 blur-[100px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[100px] mix-blend-screen pointer-events-none" />

        <div className="w-full max-w-md p-8 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Create Account</h1>
            <p className="text-white/60">Join PG Academy today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80" htmlFor="name">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E5C158]/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E5C158]/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E5C158]/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
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
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl font-bold text-black bg-[#E5C158] hover:bg-[#f1d06e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Create Account <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <button 
              onClick={() => setShowForm(false)}
              className="text-white/60 hover:text-white transition-colors mb-4 block w-full"
            >
              ← Back to instructions
            </button>
            <span className="text-white/60">Already have an account? </span>
            <Link href="/login" className="font-medium text-[#E5C158] hover:underline transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-4xl w-full relative z-10 border border-white/5 bg-[#111111]/80 rounded-3xl p-10 md:p-16 shadow-2xl backdrop-blur-sm">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5C158]/30 bg-[#E5C158]/5 text-sm font-medium text-[#E5C158] mb-8">
          <UserPlus size={16} />
          Student Registration
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight max-w-2xl">
          Create your account, then complete the academic enrollment form
        </h1>
        
        <p className="text-lg text-white/60 mb-12 leading-relaxed max-w-3xl">
          The enrollment form is available after sign-in. Once your account is created, you will be taken directly to the academic form to select track, level, and learning goal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#E5C158]/10 flex items-center justify-center mb-6">
              <UserPlus className="text-[#E5C158]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">1) Create account</h3>
            <p className="text-white/60 leading-relaxed">
              Create your student account with email to unlock the enrollment form.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#E5C158]/10 flex items-center justify-center mb-6">
              <ClipboardCheck className="text-[#E5C158]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">2) Complete form</h3>
            <p className="text-white/60 leading-relaxed">
              Fill in the academic enrollment form for admissions team review.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setShowForm(true)}
            className="px-8 py-4 rounded-xl bg-[#E5C158] text-black font-bold hover:bg-[#f1d06e] transition-colors"
          >
            Create Account & Register
          </button>
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-xl border border-white/10 bg-transparent text-white/80 font-medium hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
          >
            I already have an account <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
