"use client";

import { useState, useEffect } from "react";
import { PanelRightClose, UserRoundPen, PanelLeftClose, House, BellRing, Settings, LogOut, GraduationCap, BrickWallShield, BookSearch, ListTodo, Globe, Send, LayoutDashboard, Users, Library, CreditCard, BarChart3, ScrollText } from 'lucide-react';
import Link from "next/link"
import Image from "next/image"
import { useAuth } from '@/context/AuthContext';
import { Button } from "@base-ui/react";

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const [isMobile, setIsMobile] = useState(false);

    const menuItems = [
        {
            label: "Main Page",
            href: "/",
            icon: <Globe />,
            roles: ["admin", "student", "instructor"],
        },
        {
            label: "Dashboard",
            href: user?.role ? `/dashboard/${user.role.toLowerCase()}` : "/",
            icon: <House />,
            roles: ["admin", "student", "instructor"],
        },
        {
            label: "My Tracks",
            href: `/dashboard/myCourses`,
            icon: <GraduationCap />,
            roles: ["student", "instructor"],
        },
        {
            label: "Browse Tracks",
            href: `/dashboard/searchPage`,
            icon: <BookSearch />,
            roles: ["admin", "student", "instructor"],
        },
        {
            label: "Wishlist",
            href: `/dashboard/wishlist`,
            icon: <ListTodo />,
            roles: ["student", "instructor"],
        },
        {
            label: "Notifications",
            href: `/dashboard/notifications`,
            icon: <BellRing />,
            roles: ["admin", "student", "instructor"],
        },
        {
            label: "Profile",
            href: `/dashboard/profile`,
            icon: <UserRoundPen />,
            roles: ["admin", "student", "instructor"],
        },
        {
            label: "Certificates",
            href: "/dashboard/student/certificates",
            icon: <BrickWallShield />,
            roles: ["student"],
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <Settings />,
            roles: ["admin", "student", "instructor"],
        },
        {
            label: "Send Announcements",
            href: "/dashboard/instructor/send-notification",
            icon: <Send />,
            roles: ["instructor"],
        },
        {
            label: "Students",
            href: "/dashboard/instructor/students",
            icon: <Users />,
            roles: ["instructor"],
        },
        {
            label: "Q&A",
            href: "/dashboard/instructor/qa",
            icon: <LayoutDashboard />,
            roles: ["instructor"],
        },
        {
            label: "Users",
            href: "/dashboard/admin/users",
            icon: <Users />,
            roles: ["admin"],
        },
        {
            label: "Tracks",
            href: "/dashboard/admin/tracks",
            icon: <Library />,
            roles: ["admin"],
        },
        {
            label: "Coupons",
            href: "/dashboard/admin/coupons",
            icon: <CreditCard />,
            roles: ["admin"],
        },
        {
            label: "Transactions",
            href: "/dashboard/admin/transactions",
            icon: <CreditCard />,
            roles: ["admin"],
        },
        {
            label: "Analytics",
            href: "/dashboard/admin/analytics",
            icon: <BarChart3 />,
            roles: ["admin"],
        },
        {
            label: "System Logs",
            href: "/dashboard/admin/logs",
            icon: <ScrollText />,
            roles: ["admin"],
        },
        {
            label: "Send Notifications",
            href: "/dashboard/admin/notifications",
            icon: <Send />,
            roles: ["admin"],
        },
    ];

    const filteredItems = menuItems.filter(item =>
        user?.role ? item.roles.includes(user.role.toLowerCase()) : false
    );

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
        if (isMobile && open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open, isMobile]);

    // close when click ESC  
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);


    return (
        <div className={` ${!isMobile && "flex min-h-screen min-w-14 bg-background flex-col items-center justify-center border-r-2 border-gray-700 pl-4"}${!open ? "w-14  flex flex-col items-center " : "sm:w-64 md:w-72 w-64 md:block"} ${isMobile && open && "fixed"}`}>
            <button
                onClick={() => setOpen(!open)}
                className={`fixed top-4 transition-transform duration-300 ${open && isMobile && "translate-x-50 translate-y-0.5"} 
                ${open ? "md:left-60 top-6" : "md:static pt-6 py-2 left-4"} ${isMobile && "-translate-y-4"} z-50 focus:outline-none focus:ring-0 cursor-pointer hover:text-brand-accent hover:scale-110`}
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
                className={`bg-background text-foreground/80 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col
                fixed top-0 left-0 ${open ? "translate-x-0 " : "w-14 -translate-x-full"} md:static md:translate-x-0  max-w-xs  ${isMobile && "-translate-y-9 top-8"} 
                `}>
                {open && (
                    <div className="flex flex-col items-start gap-1 p-5 border-b border-gray-700 shrink-0">
                        <Image src="/logo.jpg" alt="PG Academy" width={140} height={35} className="object-contain rounded-sm" priority />
                        <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider pl-1">{user?.role}</span>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <nav className="flex flex-col gap-3 p-4">

                        {filteredItems.map((item, i) => (
                        <Link key={i} 
                        href={item.href} 
                        className="flex items-center hover:text-brand-accent transition-colors pt-2  rounded ">
                            <span className={`${!open && "transition-all duration-300 hover:scale-110 shrink-0"}`}>{item.icon}</span>
                            {open && <span className="ml-2 whitespace-nowrap">{item.label}</span>}
                        </Link>
                        ))}

                        <div className=" pt-4 text-red-600 transition-all duration-300 hover:text-brand-accent">
                            <Button onClick={logout} className="flex items-center  ">
                                <span className={`${!open && "hover:scale-110 transition-all duration-300 shrink-0"}`}><LogOut /></span>
                                {open && <span className="ml-2 whitespace-nowrap">Logout</span>}
                            </Button>
                        </div>

                    </nav>
                </div>
            </aside>
        </div>
    );
}