"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations } from "./translations";

type AnyTranslation = typeof translations[Lang];

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: AnyTranslation;
}

const LangContext = createContext<LangContextType>({
  lang: "ko",
  setLang: () => {},
  t: translations.ko,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved && translations[saved]) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
