"use client";

import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex min-h-screen">
            <div className="sticky top-0 z-50 h-screen">
                <Sidebar />
            </div>

            <div className="flex flex-col flex-1">

                <div className="sticky top-0 z-30">
                    <DashboardNavbar />
                </div>

                <div className="flex-1 bg-background p-8 py-12">
                    {children}
                </div>

            </div>
        </div>
    );
}
