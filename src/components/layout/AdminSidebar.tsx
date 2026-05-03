"use client";

import { usePathname } from "next/navigation";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Library,
  CreditCard,
  Settings,
  ShieldAlert,
  BarChart3,
  ScrollText, LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@base-ui/react";

const adminNavigation = [
  {
    title: "Overview",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users Management",
    url: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Course Catalog",
    url: "/dashboard/admin/courses",
    icon: Library,
  },
  {
    title: "Transactions",
    url: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    url: "/dashboard/admin/analytics",
    icon: BarChart3,
  },
];

const systemNavigation = [
  {
    title: "System Logs",
    url: "/dashboard/admin/logs",
    icon: ScrollText,
  },
  {
    title: "Platform Settings",
    url: "/dashboard/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ShieldAlert size={14} className="text-red-500" />
            Admin Controls
          </div>

          {adminNavigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => window.location.href = item.url}
                isActive={pathname === item.url}
                className={pathname === item.url ? "bg-brand-primary/10 text-brand-primary font-medium flex items-center gap-3 py-2" : "text-muted-foreground flex items-center gap-3 py-2"}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-3" />

        <SidebarMenu>
          <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Settings size={14} className="text-muted-foreground" />
            System
          </div>

          {systemNavigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => window.location.href = item.url}
                isActive={pathname === item.url}
                className={pathname === item.url ? "bg-brand-primary/10 text-brand-primary font-medium flex items-center gap-3 py-2" : "text-muted-foreground flex items-center gap-3 py-2"}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
      <div className="flex items-center pt-4 text-red-600 transition-all duration-300 hover:text-brand-accent">
        <span className={`${!open && "hover:-translate-y-0.5"}`}><LogOut /></span>
        <Button onClick={() => logout()} className="  ">
          {<span className="ml-2">Logout</span>}
        </Button>
      </div>
    </Sidebar>
  );
}
