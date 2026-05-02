"use client";

import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex flex-col flex-1">

                <div className="sticky top-0 z-30">
                    <DashboardNavbar />
                </div>
                <div className="flex-1 overflow-y-auto bg-foreground">
                    {children}
                </div>

            </div>
            </div>

            )
}
