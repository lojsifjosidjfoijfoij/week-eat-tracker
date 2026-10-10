import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { detectLanguage, fmt, LANGUAGES, translations, type Language, type Strings } from "@/lib/i18n";
import { safeLocal } from "@/lib/storage";

const STORAGE_KEY = "mealweek-language";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Strings;
  f: (text: string, vars: Record<string, string | number>) => string;
  days: string[];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = safeLocal.get(STORAGE_KEY);
    return stored && (LANGUAGES as string[]).includes(stored) ? (stored as Language) : detectLanguage();
  });

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    const t = translations[language];
    return {
      language,
      setLanguage: (lang) => {
        setLanguageState(lang);
        safeLocal.set(STORAGE_KEY, lang);
      },
      t,
      f: fmt,
      days: [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
