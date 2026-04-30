"use client";

import { useState, useEffect } from "react";
import { PanelRightClose, UserRoundPen, PanelLeftClose, House, BellRing, Settings } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    //Preventing Scroll on Mobile
    useEffect(() => {
        if (isMobile) {
            document.body.style.overflow = open ? "hidden" : "auto";
        }
    }, [open]);

    // close when click ESC  
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);



    return (
        <div className={`${!isMobile ?"flex min-h-screen min-w-14 bg-background flex-col items-center justify-center border-r-[1px] border-gray-700 pl-4" : ""}`}>
            <button
                onClick={() => setOpen(!open)}
                className={`fixed top-4 transition-all duration-300 ${open ? "left-52 md:left-60 top-6" : "py-2 left-4"} z-100  cursor-pointer text-foreground/80 hover:text-brand-accent transition-colors  rounded-md hover:-translate-y-0.5`}
            >
                {open ? <PanelLeftClose /> : <PanelRightClose />}
            </button>

            {/* Mobile Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-background text-foreground/80 h-screen z-50 transition-all duration-300 ease-in-out border-r-[1px] border-gray-700
                fixed top-0 left-0 ${open ? "translate-x-0 -translate-y-9" : "-translate-x-full"} md:static md:translate-x-0 w-64 max-w-xs sm:w-64 md:w-72 ${isMobile ? "top-8": ''} ${!open ? "md:hidden" : "md:block"}
                `}>
                <div className=" flex items-center gap-2 p-5 text-lg font-bold border-b border-gray-700">

                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-accent to-brand-primary flex items-center justify-center text-white font-bold text-l shadow-lg shadow-brand-accent/20">
                        PG
                    </div>
                    <div className="flex flex-col font-bold text-xs tracking-tight text-foreground pr-2">
                        <span>PG Academy</span>
                        <span className="font-normal text-[9px]">{user?.role}</span>
                    </div>

                </div>

                <nav className="flex flex-col gap-3 p-4">
                    <a href={`/dashboard/${user?.role.toLowerCase()}`} className=" flex items-center hover:text-brand-accent transition-colors pt-2 pl-2 rounded">
                        <House />
                        <span className="ml-2">Dashboard</span>
                    </a>
                    <a href="/dashboard/admin" className="flex items-center hover:text-brand-accent transition-colors pt-2 pl-2 rounded">
                        <BellRing />
                        <span className="ml-2">Notifications</span>
                    </a>
                    <a href="/dashboard/student" className="flex  items-center hover:text-brand-accent transition-colors pt-2 pl-2 rounded">
                        <UserRoundPen />
                        <span className="ml-2">Profile</span>
                    </a>
                    <a
                        href="/dashboard/instructor"
                        className="flex items-center hover:text-brand-accent transition-colors pt-2 pl-2 rounded"
                    >
                        <Settings />
                        <span className="ml-2">Sitting</span>
                    </a>

                </nav>
            </aside>
        </div>
    );
}