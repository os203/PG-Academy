"use client";

import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();

    // Admin section has its own layout with AdminSidebar — skip the generic layout
    const isAdminSection = pathname.startsWith("/dashboard/admin");

    if (isAdminSection) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <div className="sticky top-0 z-30">
                    <DashboardNavbar />
                </div>
                <div className="flex-1 overflow-y-auto bg-background">
                    {children}
                </div>
            </div>
        </div>
    );
}
