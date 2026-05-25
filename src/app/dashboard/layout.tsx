"use client";


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

                <div className="flex-1 bg-[#09090b] p-6 md:p-8 py-8 md:py-12">
                    {children}
                </div>

            </div>
        </div>
    );
}
