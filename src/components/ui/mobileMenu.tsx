"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from '@/context/AuthContext';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when pressed outside the menu
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden";
        }else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Close when pressed X 
    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <div className="md:hidden flex items-center gap-2">

            <ThemeToggle />

            <button onClick={() => setIsOpen(true)}>
                <Menu size={28} />
            </button>

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            />

            {/* Sidebar */}
            <div
                ref={menuRef}
                className={`fixed top-0 right-0 h-full w-72 bg-background z-50 shadow-xl 
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <span className="font-bold text-lg">Menu</span>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={26} />
                    </button>
                </div>

                <div className="flex flex-col p-6 space-y-5">

                    <Link href="/courses" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">
                        Courses
                    </Link>

                    <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">
                        About
                    </Link>

                    {user ? (
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 px-5 py-3 rounded-xl flex items-center gap-3 font-medium transition-colors"
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setIsOpen(false)}
                                className="bg-brand-primary text-white px-5 py-2 rounded-full text-center"
                            >
                                Get Started
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}