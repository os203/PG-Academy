"use client";

import DashboardNavbar from "@/components/layout/DashboardNavebar";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [open, setOpen] = useState(false);

    return (
        <div className="h-full flex">
            <Sidebar />
            <div className="flex-1">
                <DashboardNavbar />
                <div className="flex-1 bg-green-500">
                    {children}
                </div>
            </div>

        </div>
    )
}
