"use client";

import { useState, useEffect } from "react";
import { ChevronRight, RotateCcw, Lightbulb } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;
const CYCLES = [2, 3, 4, 5, 6];

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}|${ampm}`;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

function TimeSelect({ hour, onHourChange, minute, onMinuteChange }: {
  hour: number; onHourChange: (v: number) => void;
  minute: number; onMinuteChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <select value={hour} onChange={(e) => onHourChange(+e.target.value)}
        className="glass-card rounded-xl px-4 py-3 text-3xl font-[family-name:var(--font-heading)] font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none text-center cursor-pointer"
        style={{ minWidth: 90 }}>
        {hours.map((h) => <option key={h} value={h} className="bg-[#131316]">{String(h).padStart(2, "0")}</option>)}
      </select>
      <span className="text-3xl font-bold text-muted-foreground">:</span>
      <select value={minute} onChange={(e) => onMinuteChange(+e.target.value)}
        className="glass-card rounded-xl px-4 py-3 text-3xl font-[family-name:var(--font-heading)] font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none text-center cursor-pointer"
        style={{ minWidth: 90 }}>
        {minuteOptions.map((m) => <option key={m} value={m} className="bg-[#131316]">{String(m).padStart(2, "0")}</option>)}
      </select>
    </div>
  );
}

function RecommendedCard({ time, label, type }: { time: Date; label: string; type: "wake" | "sleep" }) {
  const [main, ampm] = formatTime(time).split("|");
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden active-glow border-primary/20 bg-gradient-to-br from-[#131316] to-[#0c0c0e] mb-4">
      <div className="absolute top-0 right-0 bg-[var(--tertiary)] text-[#221b00] text-[10px] font-bold px-3 py-1 rounded-bl-2xl uppercase tracking-tight font-[family-name:var(--font-heading)]">
        {type === "wake" ? "권장" : "권장"}
      </div>
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-primary font-[family-name:var(--font-heading)] font-bold text-4xl tabular-nums">{main}</span>
            <span className="text-primary/60 font-[family-name:var(--font-heading)] font-bold text-xl">{ampm}</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <RotateCcw className="h-3 w-3 text-muted-foreground" />
            <p className="text-muted-foreground text-xs font-medium">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StandardCard({ time, label }: { time: Date; label: string }) {
  const [main, ampm] = formatTime(time).split("|");
  return (
    <div className="glass-card rounded-2xl p-5 hover:bg-[#1a1a1f]/60 transition-colors cursor-default">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-foreground font-[family-name:var(--font-heading)] font-bold text-2xl tabular-nums">{main}</span>
            <span className="text-muted-foreground font-[family-name:var(--font-heading)] font-bold text-sm">{ampm}</span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">{label}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
      </div>
    </div>
  );
}

const MORNING_TIPS = {
  ko: "기상 후 30분 이내 햇빛을 쬐면 생체 시계가 리셋되어 오늘 밤 더 잘 잘 수 있어요.",
  en: "Exposure to natural sunlight within 30 minutes of waking helps reset your circadian clock for better sleep tonight.",
  zh: "起床后30分钟内晒太阳，有助于重置生物钟，让今晚睡得更好。",
  ja: "起床後30分以内に日光を浴びると体内時計がリセットされ、今夜の睡眠の質が上がります。",
};

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

  const makeResults = (baseFn: (c: number) => Date) =>
    CYCLES.map((c) => {
      const info = t.cycles[c as keyof typeof t.cycles];
      return { cycles: c, time: baseFn(c), label: info.label, quality: info.quality, recommended: c === 5 };
    });

  const sleepNowResults = now
    ? makeResults((c) => addMinutes(now, FALL_ASLEEP_MINUTES + c * CYCLE_MINUTES))
    : [];

  const sleepAtTarget = new Date();
  sleepAtTarget.setHours(sleepHour, sleepMinute, 0, 0);
  if (now && sleepAtTarget <= now) sleepAtTarget.setDate(sleepAtTarget.getDate() + 1);
  const sleepAtResults = makeResults((c) => addMinutes(sleepAtTarget, FALL_ASLEEP_MINUTES + c * CYCLE_MINUTES));

  const wakeTarget = new Date();
  wakeTarget.setHours(wakeHour, wakeMinute, 0, 0);
  if (now && wakeTarget <= now) wakeTarget.setDate(wakeTarget.getDate() + 1);
  const wakeAtResults = makeResults((c) => addMinutes(wakeTarget, -(FALL_ASLEEP_MINUTES + c * CYCLE_MINUTES))).reverse();

  const results = mode === "sleep-now" ? sleepNowResults : mode === "sleep-at" ? sleepAtResults : wakeAtResults;
  const recommended = results.find((r) => r.recommended);
  const others = results.filter((r) => !r.recommended);
  const resultType = mode === "wake-at" ? "sleep" : "wake";

  const MODES = [
    { key: "sleep-now", label: t.calculator.modeNow },
    { key: "sleep-at", label: t.calculator.modeAt },
    { key: "wake-at", label: t.calculator.modeWake },
  ];

  const tip = MORNING_TIPS[lang as keyof typeof MORNING_TIPS] ?? MORNING_TIPS.en;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-36 px-5 max-w-lg mx-auto space-y-6">
        {/* 히어로 */}
        <section>
          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-primary mb-2 font-[family-name:var(--font-body)]">
            Cycle Optimizer
          </span>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-3xl text-foreground leading-tight mb-2">
            {t.calculator.title.replace("\n", " ")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[85%]">
            {t.calculator.subtitle}
          </p>
        </section>

        {/* 탭 */}
        <div className="glass-card rounded-full p-1.5 flex overflow-hidden">
          {MODES.map(({ key, label }) => (
            <button key={key} onClick={() => setMode(key as typeof mode)}
              className={`flex-1 py-2.5 px-2 rounded-full text-xs font-semibold font-[family-name:var(--font-body)] transition-all ${
                mode === key
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* 시간 선택 (sleep-at / wake-at) */}
        {(mode === "sleep-at" || mode === "wake-at") && (
          <TimeSelect
            hour={mode === "sleep-at" ? sleepHour : wakeHour}
            onHourChange={mode === "sleep-at" ? setSleepHour : setWakeHour}
            minute={mode === "sleep-at" ? sleepMinute : wakeMinute}
            onMinuteChange={mode === "sleep-at" ? setSleepMinute : setWakeMinute}
          />
        )}

        {/* 안내 문구 */}
        {mode === "sleep-now" && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#131316] px-4 py-2 rounded-full border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium" suppressHydrationWarning>
                {now ? `${formatTime(now).replace("|", " ")} — ${t.calculator.sleepNowDesc}` : ""}
              </p>
            </div>
            <p className="text-muted-foreground text-xs italic mt-2">
              {lang === "ko" ? "잠드는 데 약 15분 소요 기준" :
               lang === "ja" ? "入眠まで約15分かかる前提" :
               lang === "zh" ? "以约15分钟入睡时间为准" :
               "Accounting for ~15 min to fall asleep."}
            </p>
          </div>
        )}

        {/* 결과 */}
        <div className="space-y-3">
          {recommended && (
            <RecommendedCard time={recommended.time} label={recommended.label} type={resultType} />
          )}
          <div className="space-y-3">
            {others.map((r) => (
              <StandardCard key={r.cycles} time={r.time} label={r.label} />
            ))}
          </div>
        </div>

        {/* 팁 */}
        <div className="p-5 rounded-2xl border border-border/30 bg-[#131316]/40">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--tertiary)]/10 flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-[var(--tertiary)]" />
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm mb-1">
                {lang === "ko" ? "오늘의 팁" : lang === "ja" ? "今日のヒント" : lang === "zh" ? "今日贴士" : "Morning Tip"}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
