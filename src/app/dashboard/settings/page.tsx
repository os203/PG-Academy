"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  CheckCircle2,
  ExternalLink,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: t("settings.light"), icon: <Sun className="h-5 w-5" /> },
    { value: "dark", label: t("settings.dark"), icon: <Moon className="h-5 w-5" /> },
    { value: "system", label: t("settings.system"), icon: <Monitor className="h-5 w-5" /> },
  ];

  const languageOptions = [
    { value: "en" as const, label: "English", flag: "🇺🇸" },
    { value: "ar" as const, label: "العربية", flag: "🇸🇦" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {t("settings.title")}
        </h1>
        <p className="text-zinc-400 mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Account Security Section — links to Clerk */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <Shield className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("settings.accountSecurity")}
            </h3>
            <p className="text-xs text-zinc-500">
              {t("settings.accountSecurityDesc")}
            </p>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-4">
          {t("settings.accountSecurityInfo")}
        </p>

        <a
          href="/dashboard/profile"
          className="gold-outline-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          {t("settings.manageAccount")}
        </a>
      </div>

      {/* Theme Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-lg bg-[#bd9759]/10 border border-[#bd9759]/20">
            <Sun className="h-5 w-5 text-[#bd9759]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t("settings.theme")}</h3>
            <p className="text-xs text-zinc-500">{t("settings.themeDesc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              suppressHydrationWarning
              onClick={() => setTheme(option.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
                theme === option.value
                  ? "border-[#bd9759] bg-[#bd9759]/10 text-[#e0a84d]"
                  : "border-zinc-800 bg-zinc-800/30 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              }`}
            >
              {option.icon}
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t("settings.language")}</h3>
            <p className="text-xs text-zinc-500">{t("settings.languageDesc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLocale(option.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                locale === option.value
                  ? "border-[#bd9759] bg-[#bd9759]/10"
                  : "border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800/60"
              }`}
            >
              <span className="text-2xl">{option.flag}</span>
              <span
                className={`text-sm font-medium ${
                  locale === option.value ? "text-[#e0a84d]" : "text-zinc-300"
                }`}
              >
                {option.label}
              </span>
              {locale === option.value && (
                <CheckCircle2 className="h-4 w-4 text-[#bd9759] ms-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
