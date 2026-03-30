"use client";

import { useLang } from "@/lib/i18n/LanguageContext";
import { Lang } from "@/lib/i18n/translations";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

export default function Header({ right }: { right?: React.ReactNode }) {
  const { lang, setLang, t } = useLang();

  return (
    <header className="flex items-center justify-between px-5 pt-8 pb-4">
      <span className="text-lg font-black tracking-tight">{t.appName}</span>
      <div className="flex items-center gap-3">
        {right}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="bg-transparent text-xs text-muted-foreground focus:outline-none cursor-pointer hover:text-foreground transition-colors"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code} className="bg-background">
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
