"use client";

import { useLanguage, Locale } from "@/context/LanguageContext";
import { Languages } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
  ];

  const current = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-zinc-300 hover:text-white flex items-center justify-center"
        title="Change language"
      >
        <Languages className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute inset-e-0 top-full mt-2 w-44 rounded-xl border border-[#bd9759]/20 bg-zinc-900 shadow-xl shadow-black/40 z-100 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer ${
                locale === lang.code
                  ? "bg-[#bd9759]/15 text-[#e0a84d] font-semibold"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
              {locale === lang.code && (
                <span className="ms-auto text-[#bd9759]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
