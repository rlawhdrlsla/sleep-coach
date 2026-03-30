"use client";

import { Moon, Clock, Sun, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const items = [
    { href: "/", icon: Moon, label: t.nav.calculator },
    { href: "/log", icon: Clock, label: t.nav.log },
    { href: "/stats", icon: Sun, label: t.nav.stats },
    { href: "/tips", icon: BookOpen, label: t.nav.tips },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-6 pt-3 glass-nav rounded-t-3xl max-w-lg mx-auto">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <a
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-200 active:scale-90 ${
              active
                ? "bg-accent text-[var(--tertiary)]"
                : "text-foreground/40 hover:text-primary"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-wide uppercase font-[family-name:var(--font-body)]">
              {label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
