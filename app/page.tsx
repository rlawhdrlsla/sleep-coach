"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;
const CYCLES = [2, 3, 4, 5, 6];

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatTime(date: Date, lang: string): string {
  return date.toLocaleTimeString(
    lang === "ko" ? "ko-KR" : lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: lang === "ko" || lang === "en" }
  );
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

function TimeSelect({
  hour, onHourChange, minute, onMinuteChange,
}: {
  hour: number; onHourChange: (v: number) => void;
  minute: number; onMinuteChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <select value={hour} onChange={(e) => onHourChange(parseInt(e.target.value))}
        className="bg-secondary border border-border rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-center" style={{ minWidth: 80 }}>
        {hours.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
      </select>
      <span className="text-3xl font-bold text-muted-foreground">:</span>
      <select value={minute} onChange={(e) => onMinuteChange(parseInt(e.target.value))}
        className="bg-secondary border border-border rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-center" style={{ minWidth: 80 }}>
        {minuteOptions.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
      </select>
    </div>
  );
}

export default function HomePage() {
  const { t, lang } = useLang();
  const [mode, setMode] = useState<"sleep-now" | "sleep-at" | "wake-at">("sleep-now");
  const [now, setNow] = useState<Date | null>(null);
  const [sleepHour, setSleepHour] = useState(23);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinute, setWakeMinute] = useState(0);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cycleInfo = t.cycles;

  const sleepNowResults = now ? CYCLES.map((cycles) => ({
    cycles,
    time: addMinutes(now, FALL_ASLEEP_MINUTES + cycles * CYCLE_MINUTES),
  })) : [];

  const sleepAtTarget = new Date();
  sleepAtTarget.setHours(sleepHour, sleepMinute, 0, 0);
  if (now && sleepAtTarget <= now) sleepAtTarget.setDate(sleepAtTarget.getDate() + 1);
  const sleepAtResults = CYCLES.map((c) => ({
    cycles: c,
    time: addMinutes(sleepAtTarget, FALL_ASLEEP_MINUTES + c * CYCLE_MINUTES),
  }));

  const wakeTarget = new Date();
  wakeTarget.setHours(wakeHour, wakeMinute, 0, 0);
  if (now && wakeTarget <= now) wakeTarget.setDate(wakeTarget.getDate() + 1);
  const wakeAtResults = CYCLES.map((c) => ({
    cycles: c,
    time: addMinutes(wakeTarget, -(FALL_ASLEEP_MINUTES + c * CYCLE_MINUTES)),
  })).reverse();

  const ResultRow = ({ cycles, time, type }: { cycles: number; time: Date; type: "sleep" | "wake" }) => {
    const info = cycleInfo[cycles as keyof typeof cycleInfo];
    const isHighlight = cycles === 5;
    return (
      <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
        <div className="flex items-center gap-4">
          <span className={`text-3xl font-black tabular-nums tracking-tight ${isHighlight ? "text-primary" : "text-foreground"}`}>
            {formatTime(time, lang)}
          </span>
          {isHighlight && (
            <span className="text-xs font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
              {info.quality}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground font-medium">{info.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {type === "wake" ? t.calculator.wake : t.calculator.sleep}
          </p>
        </div>
      </div>
    );
  };

  const MODES = [
    { key: "sleep-now", label: t.calculator.modeNow },
    { key: "sleep-at", label: t.calculator.modeAt },
    { key: "wake-at", label: t.calculator.modeWake },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <Header />
      <main className="flex-1 px-5 pb-6 space-y-8">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight whitespace-pre-line">
            {t.calculator.title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">{t.calculator.subtitle}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MODES.map(({ key, label }) => (
            <button key={key} onClick={() => setMode(key as typeof mode)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
                mode === key ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {mode === "sleep-now" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4" suppressHydrationWarning>
              {now ? formatTime(now, lang) : ""} {t.calculator.sleepNowDesc}
            </p>
            <div>
              {sleepNowResults.map(({ cycles, time }) => (
                <ResultRow key={cycles} cycles={cycles} time={time} type="wake" />
              ))}
            </div>
          </div>
        )}

        {mode === "sleep-at" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">{t.calculator.sleepAtDesc}</p>
            <TimeSelect hour={sleepHour} onHourChange={setSleepHour} minute={sleepMinute} onMinuteChange={setSleepMinute} />
            <p className="text-sm text-muted-foreground mt-3 mb-4">{t.calculator.sleepAtSub}</p>
            <div>
              {sleepAtResults.map(({ cycles, time }) => (
                <ResultRow key={cycles} cycles={cycles} time={time} type="wake" />
              ))}
            </div>
          </div>
        )}

        {mode === "wake-at" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">{t.calculator.wakeAtDesc}</p>
            <TimeSelect hour={wakeHour} onHourChange={setWakeHour} minute={wakeMinute} onMinuteChange={setWakeMinute} />
            <p className="text-sm text-muted-foreground mt-3 mb-4">{t.calculator.wakeAtSub}</p>
            <div>
              {wakeAtResults.map(({ cycles, time }) => (
                <ResultRow key={cycles} cycles={cycles} time={time} type="sleep" />
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs font-medium mb-1">💡 {t.calculator.tipTitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t.calculator.tip}</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
