"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Moon } from "lucide-react";
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

function TimePicker({ hour, onHourChange, minute, onMinuteChange }: {
  hour: number; onHourChange: (v: number) => void;
  minute: number; onMinuteChange: (v: number) => void;
}) {
  const ampm = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return (
    <div className="text-center">
      <div className="inline-flex items-end justify-center gap-1 mb-3">
        <div className="relative inline-block">
          <span className="text-6xl font-extrabold tracking-tighter text-foreground text-glow pointer-events-none select-none">
            {String(h12).padStart(2, "0")}
          </span>
          <select
            value={hour}
            onChange={(e) => onHourChange(+e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          >
            {hours.map((h) => <option key={h} value={h} className="bg-[#131319]">{String(h).padStart(2, "0")}</option>)}
          </select>
        </div>
        <span className="text-6xl font-extrabold text-foreground text-glow mb-0.5">:</span>
        <div className="relative inline-block">
          <span className="text-6xl font-extrabold tracking-tighter text-foreground text-glow pointer-events-none select-none">
            {String(minute).padStart(2, "0")}
          </span>
          <select
            value={minute}
            onChange={(e) => onMinuteChange(+e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          >
            {minuteOptions.map((m) => <option key={m} value={m} className="bg-[#131319]">{String(m).padStart(2, "0")}</option>)}
          </select>
        </div>
        <span className="text-xl font-bold text-muted-foreground pb-2 ml-1">{ampm}</span>
      </div>
      <div className="h-0.5 w-20 bg-primary/20 mx-auto rounded-full">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(minute / 55) * 100}%` }} />
      </div>
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
  const [wakeMinute, setWakeMinute] = useState(30);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const makeResults = (baseFn: (c: number) => Date) =>
    CYCLES.map((c) => {
      const info = t.cycles[c as keyof typeof t.cycles];
      return { cycles: c, time: baseFn(c), label: info.label, recommended: c === 5 };
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

  const resultTitle = resultType === "wake"
    ? (lang === "ko" ? "추천 기상 시간" : lang === "ja" ? "おすすめ起床時間" : lang === "zh" ? "推荐起床时间" : "Recommended Wake Time")
    : (lang === "ko" ? "추천 취침 시간" : lang === "ja" ? "おすすめ就寝時間" : lang === "zh" ? "推荐就寝时间" : "Recommended Bedtime");

  const bestLabel = lang === "ko" ? "가장 추천" : lang === "ja" ? "最もおすすめ" : lang === "zh" ? "最推荐" : "Best Choice";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-xl mx-auto px-5 pt-24 pb-36">

        {/* Hero */}
        <section className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 font-[family-name:var(--font-heading)]">
            {t.calculator.title.replace("\n", " ")}
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed text-sm">
            {t.calculator.subtitle}
          </p>
        </section>

        {/* Sleep Now Button */}
        <section className="mb-6">
          <div className="relative group">
            {mode === "sleep-now" && (
              <div className="absolute -inset-1 primary-gradient rounded-[2rem] blur opacity-25 group-hover:opacity-35 transition duration-700" />
            )}
            <button
              onClick={() => setMode("sleep-now")}
              className={`relative w-full py-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-xl transition-all duration-300 active:scale-95 ${
                mode === "sleep-now"
                  ? "primary-gradient text-[#4f3e00]"
                  : "bg-[#131319] text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className={`h-9 w-9 ${mode === "sleep-now" ? "fill-[#4f3e00]" : ""}`} />
              <span className="text-2xl font-extrabold tracking-tight uppercase font-[family-name:var(--font-heading)]">
                {t.calculator.modeNow}
              </span>
              <p className={`text-sm font-medium ${mode === "sleep-now" ? "opacity-70" : "opacity-40"}`}>
                {t.calculator.sleepNowDesc}
              </p>
            </button>
          </div>
        </section>

        {/* Wake At / Sleep At Toggle */}
        <section className="mb-8">
          <div className="bg-[#131319] p-1.5 rounded-full flex gap-1">
            <button
              onClick={() => setMode("wake-at")}
              className={`flex-1 py-3 px-4 rounded-full font-bold transition-all text-sm ${
                mode === "wake-at"
                  ? "bg-[#1f1f28] text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.calculator.modeWake}
            </button>
            <button
              onClick={() => setMode("sleep-at")}
              className={`flex-1 py-3 px-4 rounded-full font-bold transition-all text-sm ${
                mode === "sleep-at"
                  ? "bg-[#1f1f28] text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.calculator.modeAt}
            </button>
          </div>
        </section>

        {/* Time Picker */}
        {mode === "wake-at" && (
          <section className="mb-12">
            <TimePicker hour={wakeHour} onHourChange={setWakeHour} minute={wakeMinute} onMinuteChange={setWakeMinute} />
          </section>
        )}
        {mode === "sleep-at" && (
          <section className="mb-12">
            <TimePicker hour={sleepHour} onHourChange={setSleepHour} minute={sleepMinute} onMinuteChange={setSleepMinute} />
          </section>
        )}

        {/* Sleep Now current time display */}
        {mode === "sleep-now" && now && (
          <section className="mb-10 text-center" suppressHydrationWarning>
            <div className="inline-flex items-end gap-2">
              <span className="text-5xl font-extrabold tracking-tighter text-foreground text-glow">
                {formatTime(now).split("|")[0]}
              </span>
              <span className="text-xl font-bold text-muted-foreground pb-1">
                {formatTime(now).split("|")[1]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {lang === "ko" ? "잠드는 데 약 15분 소요 기준"
               : lang === "ja" ? "入眠まで約15分かかる前提"
               : lang === "zh" ? "以约15分钟入睡时间为准"
               : "~15 min to fall asleep"}
            </p>
          </section>
        )}

        {/* Results */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1 mb-4">
            {resultTitle}
          </h3>

          {recommended && (() => {
            const [main, ampm] = formatTime(recommended.time).split("|");
            return (
              <div className="bg-[#191920] p-6 rounded-[24px] border-l-4 border-primary/60 relative overflow-hidden">
                <div className="absolute top-3 right-5 text-5xl opacity-[0.04] select-none pointer-events-none">★</div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{bestLabel}</span>
                <h4 className="text-3xl font-extrabold text-foreground mb-1 font-[family-name:var(--font-heading)]">
                  {main} <span className="text-xl text-muted-foreground font-bold">{ampm}</span>
                </h4>
                <p className="text-sm text-muted-foreground">{recommended.label}</p>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-3">
            {others.slice(0, 2).map((r) => {
              const [main, ampm] = formatTime(r.time).split("|");
              return (
                <div key={r.cycles} className="bg-[#131319] p-5 rounded-[24px] hover:bg-[#191920] transition-colors duration-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {r.cycles}{lang === "ko" ? "사이클" : " cycles"}
                  </span>
                  <h4 className="text-xl font-extrabold text-foreground mb-1 font-[family-name:var(--font-heading)]">
                    {main}<span className="text-sm text-muted-foreground ml-1">{ampm}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.label}</p>
                </div>
              );
            })}
          </div>

          {others.slice(2).map((r) => {
            const [main, ampm] = formatTime(r.time).split("|");
            return (
              <div key={r.cycles} className="bg-[#131319] p-5 rounded-[24px] hover:bg-[#191920] transition-colors duration-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    {r.cycles}{lang === "ko" ? "사이클" : " cycles"}
                  </span>
                  <h4 className="text-xl font-extrabold text-foreground mb-1 font-[family-name:var(--font-heading)]">
                    {main}<span className="text-sm text-muted-foreground ml-1">{ampm}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">{r.label}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1f1f28] flex items-center justify-center shrink-0">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Sleep Science */}
        <section className="mt-16 rounded-[2rem] overflow-hidden relative h-44 group">
          {/* Moon image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/800px-FullMoon2010.jpg"
            alt="moon"
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-25 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h5 className="text-lg font-bold text-foreground mb-1 font-[family-name:var(--font-heading)]">
              {lang === "ko" ? "수면의 과학" : lang === "ja" ? "睡眠の科学" : lang === "zh" ? "睡眠科学" : "Sleep Science"}
            </h5>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              {lang === "ko" ? "한 사이클은 약 90분입니다. 사이클 중간에 깨면 더 피곤함을 느낄 수 있습니다."
               : lang === "ja" ? "1サイクルは約90分。サイクルの途中で目覚めると、より疲れを感じることがあります。"
               : lang === "zh" ? "一个周期约90分钟。在周期中途醒来可能会感到更加疲惫。"
               : "One cycle is ~90 min. Waking mid-cycle can leave you feeling groggy."}
            </p>
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}
