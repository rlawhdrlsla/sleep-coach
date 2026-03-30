"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <Header />
      <main className="flex-1 px-5 pb-6 space-y-6">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">{t.stats.title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t.stats.subtitle}</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">{t.stats.loading}</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-4xl">📊</p>
            <p className="text-muted-foreground text-sm">{t.stats.empty}</p>
            <a href="/log" className="inline-block text-primary text-sm font-semibold mt-2">{t.stats.emptyLink}</a>
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
                <div key={item.label} className="bg-secondary rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-black mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            {recent7.length > 0 && (
              <div>
                <p className="text-sm font-bold mb-4">{t.stats.recentChart.replace("일", String(recent7.length))}</p>
                <div className="flex items-end gap-2 h-28">
                  {recent7.map((log, i) => {
                    const h = (new Date(log.wake_at).getTime() - new Date(log.sleep_at).getTime()) / 3600000;
                    const pct = (h / maxDuration) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground tabular-nums">{h.toFixed(1)}h</span>
                        <div className={`w-full rounded-t-md ${h >= 6 && h <= 9 ? "bg-primary" : "bg-primary/40"}`}
                          style={{ height: `${pct}%`, minHeight: 4 }} />
                        <span className="text-xs text-muted-foreground">
                          {t.stats.days[new Date(log.sleep_at).getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="inline-block w-2 h-2 rounded-sm bg-primary mr-1" />
                  {t.stats.recommended}
                </p>
              </div>
            )}

            {logs.length >= 3 && (
              <div className="border-t border-border pt-6">
                <p className="text-sm font-bold mb-3">{t.stats.pattern}</p>
                <div className="space-y-0">
                  {[
                    { label: t.stats.earliest, value: new Date(logs.reduce((a, b) => new Date(a.sleep_at).getHours() < new Date(b.sleep_at).getHours() ? a : b).sleep_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12 }) },
                    { label: t.stats.latest, value: new Date(logs.reduce((a, b) => new Date(a.sleep_at).getHours() > new Date(b.sleep_at).getHours() ? a : b).sleep_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12 }) },
                    { label: t.stats.longest, value: fmtDuration(Math.max(...durations)) },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-3 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-bold tabular-nums">{item.value}</span>
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
