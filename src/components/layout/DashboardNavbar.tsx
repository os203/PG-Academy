"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from "../ui/ThemeToggle";

export default function DashboardNavbar() {
    const router = useRouter();
    const { user } = useAuth();
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadUnreadNotifications() {
            try {
                const res = await fetch('/api/notifications?unreadOnly=true&limit=1');
                if (!mounted) return;
                if (res.ok) {
                    const data = await res.json();
                    setHasUnreadNotifications(Array.isArray(data) && data.length > 0);
                }
            } catch (error) {
                console.error('Failed to fetch unread notifications', error);
            }
        }

        void loadUnreadNotifications();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="sticky top-0 glass bg-linear-to-br from-brand-accent to-brand-primary shadow-lg shadow-brand-accent/20 flex items-center justify-between bg-background p-4 w-full h-18">
            <div className="flex items-center gap-4 ml-10 md:ml-4">
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/searchPage')}
                    className="text-foreground hover:text-brand-accent transition-all duration-300 hover:scale-110"
                    aria-label="Browse tracks"
                >
                    <Search className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/notifications')}
                    className="text-foreground hover:text-brand-accent transition-all duration-300 hover:scale-110"
                    aria-label="View notifications"
                >
                    <BellRing className="w-6 h-6" />
                    {hasUnreadNotifications && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card" />
                    )}
                </button>
            </div>
            <div className="flex items-center gap-4 justify-end w-full">
                <ThemeToggle />
                <div className="flex flex-col">
                    <span className="text-l leading-3 font-medium">{user?.name} </span>
                    <span className="text-[9px] text-muted-foreground text-right pt-2">{user?.email} </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden cursor-pointer">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                    )}
                </div>
            </div>


        </div>
    )
}
