"use client";

import { Moon, Clock, BarChart2, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const items = [
    { href: "/", icon: Moon, label: t.nav.calculator },
    { href: "/log", icon: Clock, label: t.nav.log },
    { href: "/stats", icon: BarChart2, label: t.nav.stats },
    { href: "/tips", icon: BookOpen, label: t.nav.tips },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pt-3 pb-8 bg-[#131319]/80 backdrop-blur-xl rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] max-w-xl mx-auto">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1"
          >
            {active ? (
              <div className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center gold-glow">
                <Icon className="h-5 w-5 text-[#4f3e00] fill-[#4f3e00]" strokeWidth={2.5} />
              </div>
            ) : (
              <>
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] font-medium tracking-wide text-muted-foreground font-[family-name:var(--font-body)]">
                  {label}
                </span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
