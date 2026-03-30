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
    <nav className="border-t border-border flex sticky bottom-0 bg-background">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <a
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
