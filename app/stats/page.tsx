"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Clock, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SleepLog {
  sleep_at: string;
  wake_at: string;
  cycles: number;
  quality: number | null;
}

const NAV_ITEMS = [
  { href: "/", icon: Moon, label: "계산기" },
  { href: "/log", icon: Clock, label: "기록" },
  { href: "/stats", icon: Sun, label: "통계" },
  { href: "/tips", icon: BookOpen, label: "수면 팁" },
];

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function StatsPage() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("sleep_logs")
      .select("sleep_at, wake_at, cycles, quality")
      .order("sleep_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setLogs(data ?? []);
        setLoading(false);
      });
  }, []);

  const durations = logs.map((l) =>
    (new Date(l.wake_at).getTime() - new Date(l.sleep_at).getTime()) / 3600000
  );
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const avgCycles = logs.length ? logs.reduce((a, b) => a + b.cycles, 0) / logs.length : 0;
  const qualityLogs = logs.filter((l) => l.quality);
  const avgQuality = qualityLogs.length ? qualityLogs.reduce((a, b) => a + (b.quality ?? 0), 0) / qualityLogs.length : 0;

  const formatAvgDuration = () => {
    const h = Math.floor(avgDuration);
    const m = Math.round((avgDuration - h) * 60);
    return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
  };

  const recent7 = logs.slice(0, 7).reverse();
  const maxDuration = Math.max(...recent7.map((l) =>
    (new Date(l.wake_at).getTime() - new Date(l.sleep_at).getTime()) / 3600000
  ), 8);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <span className="text-lg font-black tracking-tight">Sleep Coach</span>
      </header>

      <main className="flex-1 px-5 pb-6 space-y-6">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">수면 통계</h1>
          <p className="text-muted-foreground mt-2 text-sm">나의 수면 패턴을 한눈에</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">불러오는 중...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-4xl">📊</p>
            <p className="text-muted-foreground text-sm">기록이 쌓이면 통계가 보여요</p>
            <a href="/log" className="inline-block text-primary text-sm font-semibold mt-2">
              기록 시작하기 →
            </a>
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "평균 수면", value: logs.length ? formatAvgDuration() : "-" },
                { label: "평균 주기", value: logs.length ? `${avgCycles.toFixed(1)}주기` : "-" },
                { label: "총 기록", value: `${logs.length}일` },
                { label: "평균 품질", value: avgQuality ? `${avgQuality.toFixed(1)} / 5` : "-" },
              ].map((item) => (
                <div key={item.label} className="bg-secondary rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-black mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            {/* 최근 7일 차트 */}
            {recent7.length > 0 && (
              <div>
                <p className="text-sm font-bold mb-4">최근 {recent7.length}일 수면 시간</p>
                <div className="flex items-end gap-2 h-28">
                  {recent7.map((log, i) => {
                    const h = (new Date(log.wake_at).getTime() - new Date(log.sleep_at).getTime()) / 3600000;
                    const pct = (h / maxDuration) * 100;
                    const isGood = h >= 6 && h <= 9;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {h.toFixed(1)}h
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all ${isGood ? "bg-primary" : "bg-primary/40"}`}
                          style={{ height: `${pct}%`, minHeight: 4 }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {DAYS[new Date(log.sleep_at).getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="inline-block w-2 h-2 rounded-sm bg-primary mr-1" />
                  6~9시간 권장 수면
                </p>
              </div>
            )}

            {/* 취침 패턴 */}
            {logs.length >= 3 && (
              <div className="border-t border-border pt-6">
                <p className="text-sm font-bold mb-3">취침 패턴</p>
                <div className="space-y-2">
                  {[
                    {
                      label: "가장 이른 취침",
                      value: new Date(
                        logs.reduce((a, b) =>
                          new Date(a.sleep_at).getHours() < new Date(b.sleep_at).getHours() ? a : b
                        ).sleep_at
                      ).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true }),
                    },
                    {
                      label: "가장 늦은 취침",
                      value: new Date(
                        logs.reduce((a, b) =>
                          new Date(a.sleep_at).getHours() > new Date(b.sleep_at).getHours() ? a : b
                        ).sleep_at
                      ).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true }),
                    },
                    {
                      label: "최장 수면",
                      value: (() => {
                        const max = Math.max(...durations);
                        const h = Math.floor(max);
                        const m = Math.round((max - h) * 60);
                        return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
                      })(),
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
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

      <nav className="border-t border-border flex sticky bottom-0 bg-background">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <a key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              href === "/stats" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
