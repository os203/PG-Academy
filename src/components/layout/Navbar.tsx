"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/tracks", label: t("nav.tracks") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#09090b]/40 backdrop-blur-md border-b border-[#bd9759]/10 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <Image
                src="/logo.jpg"
                alt="PG Academy"
                width={120}
                height={32}
                className="object-contain rounded-sm"
                priority
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-semibold text-zinc-300 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />

              {isAuthenticated ? (
                <>
                  <Link
                    href={user?.role ? `/dashboard/${user.role.toLowerCase()}` : "/dashboard"}
                    className="gold-btn px-5 py-2.5 rounded-lg text-sm"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-[#bd9759]" } }} />
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/sign-up"
                    className="gold-btn px-5 py-2.5 rounded-lg text-sm"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageSwitcher variant="compact" />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-300 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-dark border-t border-[#bd9759]/10 animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                {isAuthenticated ? (
                  <Link
                    href={user?.role ? `/dashboard/${user.role.toLowerCase()}` : "/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block gold-btn px-4 py-3 rounded-lg text-sm text-center"
                  >
                    {t("nav.dashboard")}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-center"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block gold-btn px-4 py-3 rounded-lg text-sm text-center"
                    >
                      {t("nav.register")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Removed spacer div so hero section can reach the top */}
    </>
  );
}
