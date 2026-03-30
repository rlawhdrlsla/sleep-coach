"use client";

import { useState, useEffect } from "react";
import { BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

interface SleepLog { sleep_at: string; wake_at: string; cycles: number; quality: number | null; }

export default function StatsPage() {
  const { t, lang } = useLang();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient().from("sleep_logs").select("sleep_at,wake_at,cycles,quality")
      .order("sleep_at", { ascending: false }).limit(30)
      .then(({ data }) => { setLogs(data ?? []); setLoading(false); });
  }, []);

  const durations = logs.map((l) => (new Date(l.wake_at).getTime() - new Date(l.sleep_at).getTime()) / 3600000);
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const avgCycles = logs.length ? logs.reduce((a, b) => a + b.cycles, 0) / logs.length : 0;
  const qualityLogs = logs.filter((l) => l.quality);
  const avgQuality = qualityLogs.length ? qualityLogs.reduce((a, b) => a + (b.quality ?? 0), 0) / qualityLogs.length : 0;

  const fmtDuration = (h: number) => {
    const hh = Math.floor(h); const m = Math.round((h - hh) * 60);
    return m === 0 ? `${hh}h` : `${hh}h ${m}m`;
  };

  const locale = lang === "ko" ? "ko-KR" : lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : "en-US";
  const hour12 = lang === "ko" || lang === "en";
  const recent7 = logs.slice(0, 7).reverse();
  const maxDuration = Math.max(...recent7.map((l) => (new Date(l.wake_at).getTime() - new Date(l.sleep_at).getTime()) / 3600000), 8);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-36 px-5 max-w-lg mx-auto space-y-6">
        <section>
          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-primary mb-2 font-[family-name:var(--font-body)]">
            Analytics
          </span>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-3xl text-foreground leading-tight mb-2">
            {t.stats.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[85%]">
            {t.stats.subtitle}
          </p>
        </section>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">{t.stats.loading}</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <BarChart2 className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-muted-foreground text-sm">{t.stats.empty}</p>
            <a href="/log" className="inline-block text-primary text-sm font-semibold mt-2 hover:opacity-80 transition-opacity">
              {t.stats.emptyLink} →
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t.stats.avgSleep, value: fmtDuration(avgDuration) },
                { label: t.stats.avgCycles, value: `${avgCycles.toFixed(1)}` },
                { label: t.stats.totalLogs, value: `${logs.length}` },
                { label: t.stats.avgQuality, value: avgQuality ? `${avgQuality.toFixed(1)} / 5` : "-" },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-2xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">{item.label}</p>
                  <p className="font-[family-name:var(--font-heading)] font-bold text-2xl text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {recent7.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <p className="font-[family-name:var(--font-heading)] font-bold text-sm mb-5">
                  {t.stats.recentChart.replace("일", String(recent7.length))}
                </p>
                <div className="flex items-end gap-2 h-32">
                  {recent7.map((log, i) => {
                    const h = (new Date(log.wake_at).getTime() - new Date(log.sleep_at).getTime()) / 3600000;
                    const pct = (h / maxDuration) * 100;
                    const good = h >= 6 && h <= 9;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground tabular-nums">{h.toFixed(1)}h</span>
                        <div
                          className={`w-full rounded-t-md transition-all ${good ? "bg-primary" : "bg-primary/30"}`}
                          style={{ height: `${pct}%`, minHeight: 4 }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {t.stats.days[new Date(log.sleep_at).getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="inline-block w-2 h-2 rounded-sm bg-primary" />
                  <span className="text-xs text-muted-foreground">{t.stats.recommended}</span>
                </div>
              </div>
            )}

            {logs.length >= 3 && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border/30">
                  <p className="font-[family-name:var(--font-heading)] font-bold text-sm">{t.stats.pattern}</p>
                </div>
                <div>
                  {[
                    { label: t.stats.earliest, value: new Date(logs.reduce((a, b) => new Date(a.sleep_at).getHours() < new Date(b.sleep_at).getHours() ? a : b).sleep_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12 }) },
                    { label: t.stats.latest, value: new Date(logs.reduce((a, b) => new Date(a.sleep_at).getHours() > new Date(b.sleep_at).getHours() ? a : b).sleep_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12 }) },
                    { label: t.stats.longest, value: fmtDuration(Math.max(...durations)) },
                  ].map((item, i, arr) => (
                    <div key={item.label} className={`flex justify-between items-center px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border/20" : ""}`}>
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="font-[family-name:var(--font-heading)] font-bold text-sm tabular-nums text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
