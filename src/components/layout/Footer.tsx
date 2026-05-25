"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/50 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="PG Academy"
              width={100}
              height={28}
              className="object-contain rounded-sm opacity-70"
            />
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/about" className="hover:text-zinc-300 transition-colors">
              {t("nav.about")}
            </Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">
              {t("nav.contact")}
            </Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors hidden sm:inline">
              {t("footer.privacyPolicy")}
            </Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors hidden sm:inline">
              {t("footer.termsOfService")}
            </Link>
          </div>

          <p className="text-xs text-zinc-600">
            {t("footer.copyright", { year: year.toString() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
