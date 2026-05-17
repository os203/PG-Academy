"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import MobileMenu from "../ui/mobileMenu";
import Image from "next/image";



export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-background/80 backdrop-blur-2xl border border-border rounded-3xl shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="shrink-0 flex items-center gap-2 hover:scale-105 transition-transform rounded-xl">
            <Image src="/logo.jpg" alt="PG Academy" width={160} height={40} className="object-contain rounded-sm" priority />
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/tracks" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Tracks</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">About</Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-brand-primary hover:text-brand-accent transition-colors font-medium flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span>Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Sign In</Link>
                <Link href="/register" className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105">
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
