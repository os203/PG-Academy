"use client";

import { useState, useEffect } from "react";
import {
  PanelRightClose,
  UserRoundPen,
  PanelLeftClose,
  House,
  BellRing,
  Settings,
  LogOut,
  GraduationCap,
  BrickWallShield,
  BookSearch,
  ListTodo,
  Globe,
  Send,
  LayoutDashboard,
  Users,
  Library,
  CreditCard,
  BarChart3,
  ScrollText,
  Heart,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, dir } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = [
    {
      label: t("nav.mainPage"),
      href: "/",
      icon: <Globe size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: t("nav.dashboard"),
      href: user?.role ? `/dashboard/${user.role.toLowerCase()}` : "/",
      icon: <House size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: t("nav.myTracks"),
      href: `/dashboard/myCourses`,
      icon: <GraduationCap size={20} />,
      roles: ["student", "instructor"],
    },
    {
      label: t("nav.browseTracks"),
      href: `/dashboard/searchPage`,
      icon: <BookSearch size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: t("nav.wishlist"),
      href: `/dashboard/wishlist`,
      icon: <ListTodo size={20} />,
      roles: ["student"],
    },
    {
      label: t("nav.notifications"),
      href: `/dashboard/notifications`,
      icon: <BellRing size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: t("nav.profile"),
      href: `/dashboard/profile`,
      icon: <UserRoundPen size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: t("nav.certificates"),
      href: "/dashboard/student/certificates",
      icon: <BrickWallShield size={20} />,
      roles: ["student"],
    },
    {
      label: t("nav.settings"),
      href: "/dashboard/settings",
      icon: <Settings size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: t("nav.sendAnnouncements"),
      href: "/dashboard/instructor/send-notification",
      icon: <Send size={20} />,
      roles: ["instructor"],
    },
    {
      label: t("nav.students"),
      href: "/dashboard/instructor/students",
      icon: <Users size={20} />,
      roles: ["instructor"],
    },
    {
      label: t("nav.qa"),
      href: "/dashboard/instructor/qa",
      icon: <LayoutDashboard size={20} />,
      roles: ["instructor"],
    },
    {
      label: t("nav.users"),
      href: "/dashboard/admin/users",
      icon: <Users size={20} />,
      roles: ["admin"],
    },
    {
      label: t("nav.tracks"),
      href: "/dashboard/admin/tracks",
      icon: <Library size={20} />,
      roles: ["admin"],
    },
    {
      label: t("nav.coupons"),
      href: "/dashboard/admin/coupons",
      icon: <CreditCard size={20} />,
      roles: ["admin"],
    },
    {
      label: "Enrollments",
      href: "/dashboard/admin/enrollments",
      icon: <ClipboardList size={20} />,
      roles: ["admin"],
    },
    {
      label: t("nav.transactions"),
      href: "/dashboard/admin/transactions",
      icon: <CreditCard size={20} />,
      roles: ["admin"],
    },
    {
      label: t("nav.analytics"),
      href: "/dashboard/admin/analytics",
      icon: <BarChart3 size={20} />,
      roles: ["admin"],
    },
    {
      label: t("nav.systemLogs"),
      href: "/dashboard/admin/logs",
      icon: <ScrollText size={20} />,
      roles: ["admin"],
    },
    {
      label: "Wishlist Insights",
      href: "/dashboard/admin/wishlist-analytics",
      icon: <Heart size={20} />,
      roles: ["admin"],
    },
    {
      label: t("nav.sendNotifications"),
      href: "/dashboard/admin/notifications",
      icon: <Send size={20} />,
      roles: ["admin"],
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role.toLowerCase()) : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const isRtl = dir === "rtl";

  return (
    <div
      className={`${
        !isMobile &&
        "flex min-h-screen min-w-14 bg-[#09090b] flex-col items-center justify-center border-zinc-800"
      } ${!isMobile && (isRtl ? "border-l" : "border-r")} ${
        !open ? "w-14 flex flex-col items-center" : "sm:w-64 md:w-72 w-64 md:block"
      } ${isMobile && open && "fixed"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-4 transition-transform duration-300 ${
          open && isMobile && (isRtl ? "-translate-x-50" : "translate-x-50")
        } ${
          open
            ? isRtl
              ? "md:right-60 top-6"
              : "md:left-60 top-6"
            : `md:static pt-6 py-2 ${isRtl ? "right-4" : "left-4"}`
        } ${isMobile && "-translate-y-4"} z-50 focus:outline-none cursor-pointer hover:text-[#bd9759] hover:scale-110 text-zinc-400`}
      >
        {open ? (
          isRtl ? (
            <PanelRightClose size={22} />
          ) : (
            <PanelLeftClose size={22} />
          )
        ) : isRtl ? (
          <PanelLeftClose size={22} />
        ) : (
          <PanelRightClose size={22} />
        )}
      </button>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`bg-[#09090b] text-zinc-400 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col
        fixed top-0 ${isRtl ? "right-0" : "left-0"} ${
          open
            ? "translate-x-0"
            : isRtl
            ? "w-14 translate-x-full"
            : "w-14 -translate-x-full"
        } md:static md:translate-x-0 max-w-xs ${
          isMobile && "-translate-y-9 top-8"
        }`}
      >
        {open && (
          <div className={`flex flex-col items-start gap-2 p-5 border-b border-zinc-800 shrink-0`}>
            <Image
              src="/logo.jpg"
              alt="PG Academy"
              width={140}
              height={35}
              className="object-contain rounded-sm"
              priority
            />
            <span className="font-medium text-[10px] text-[#bd9759] uppercase tracking-wider ps-1">
              {user?.role}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex flex-col gap-1 p-3">
            {filteredItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-center hover:text-[#e0a84d] hover:bg-[#bd9759]/8 transition-all duration-200 py-2.5 px-2 rounded-lg group"
              >
                <span
                  className={`${
                    !open && "transition-all duration-300 hover:scale-110 shrink-0"
                  } group-hover:text-[#e0a84d]`}
                >
                  {item.icon}
                </span>
                {open && (
                  <span className="ms-3 whitespace-nowrap text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}

            {/* Language switcher in sidebar when open */}
            {open && (
              <div className="pt-3 mt-2 border-t border-zinc-800">
                <LanguageSwitcher />
              </div>
            )}

            <div className="pt-3 mt-2 border-t border-zinc-800">
              <button
                onClick={logout}
                className="flex items-center w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 py-2.5 px-2 rounded-lg cursor-pointer"
              >
                <span
                  className={`${
                    !open && "hover:scale-110 transition-all duration-300 shrink-0"
                  }`}
                >
                  <LogOut size={20} />
                </span>
                {open && (
                  <span className="ms-3 whitespace-nowrap text-sm font-medium">
                    {t("nav.logout")}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>
      </aside>
    </div>
  );
}