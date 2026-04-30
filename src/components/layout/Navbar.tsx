"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import MobileMenu from "../ui/mobileMenu";



export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="shrink-0 flex items-center gap-2 hover-lift rounded-xl ">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-accent to-brand-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-accent/20">
              PG
            </div>
            <div className="font-bold text-2xl tracking-tight text-foreground pr-2">
              PG Academy
            </div>
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/courses" className="text-foreground/80 hover:text-brand-accent transition-colors font-medium">Courses</Link>
            <Link href="/about" className="text-foreground/80 hover:text-brand-accent transition-colors font-medium">About</Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-brand-primary hover:text-brand-accent transition-colors font-medium flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-foreground/80 hover:text-brand-accent transition-colors font-medium">Sign In</Link>
                <Link href="/register" className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2.5 rounded-full font-medium transition-all hover-lift">
                  Get Started
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
            <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
