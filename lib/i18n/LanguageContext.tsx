"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SupportedLanguage, LANGUAGES, TRANSLATIONS, LanguageMeta } from "./translations";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof TRANSLATIONS["id"] | string) => string;
  currentMeta: LanguageMeta;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = "clyra_user_language_v1";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguage;
      if (saved && ["id", "en", "zh", "ar"].includes(saved)) {
        setLanguageState(saved);
        updateDocumentDir(saved);
      } else {
        // Auto-detect browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("zh")) {
          setLanguageState("zh");
          updateDocumentDir("zh");
        } else if (browserLang.startsWith("ar")) {
          setLanguageState("ar");
          updateDocumentDir("ar");
        } else if (browserLang.startsWith("en")) {
          setLanguageState("en");
          updateDocumentDir("en");
        }
      }
    } catch {}
  }, []);

  const updateDocumentDir = (lang: SupportedLanguage) => {
    if (typeof document !== "undefined") {
      const meta = LANGUAGES.find((l) => l.code === lang);
      document.documentElement.dir = meta?.dir || "ltr";
      document.documentElement.lang = lang;
    }
  };

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    updateDocumentDir(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    } catch {}
  };

  const t = useCallback(
    (key: string): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.id;
      const val = (dict as any)[key];
      if (val) return val;
      // Fallback to Indonesian if key missing in translation
      return (TRANSLATIONS.id as any)[key] || key;
    },
    [language]
  );

  const currentMeta = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentMeta }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "id" as SupportedLanguage,
      setLanguage: () => {},
      t: (k: string) => k,
      currentMeta: LANGUAGES[0],
    };
  }
  return context;
}
