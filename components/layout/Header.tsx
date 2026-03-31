"use client";

import { useLang } from "@/lib/i18n/LanguageContext";
import { Lang } from "@/lib/i18n/translations";
import { Moon } from "lucide-react";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

export default function Header({ right }: { right?: React.ReactNode }) {
  const { lang, setLang, t } = useLang();

  return (
    <header className="fixed top-0 w-full z-50 glass-header flex items-center justify-between px-5 py-4 max-w-xl mx-auto left-0 right-0">
      <div className="flex items-center gap-2">
        <Moon className="h-5 w-5 text-primary fill-primary" />
        <h1 className="text-sm font-bold tracking-widest uppercase text-muted-foreground font-[family-name:var(--font-heading)]">
          {t.appName}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {right}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="bg-transparent text-xs text-muted-foreground focus:outline-none cursor-pointer hover:text-foreground transition-colors"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code} className="bg-[#131319]">
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
