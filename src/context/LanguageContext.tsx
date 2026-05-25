"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { en, ar } from "@/lib/translations";

export type Locale = "en" | "ar";

interface LanguageContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Record<string, string>> = { en, ar };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Read saved locale on mount
  useEffect(() => {
    const saved = localStorage.getItem("pg-academy-locale") as Locale | null;
    if (saved === "en" || saved === "ar") {
      setLocaleState(saved);
    }
  }, []);

  // Update HTML dir and lang attributes
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("pg-academy-locale", newLocale);
  }, []);

  const dir = locale === "ar" ? "rtl" : "ltr";

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let text = translations[locale]?.[key] || translations.en[key] || key;

      // Replace template variables like {name}, {year}
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }

      return text;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
