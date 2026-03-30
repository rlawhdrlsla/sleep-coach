"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Clock, AlarmClock, Bed, BookOpen } from "lucide-react";

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;
const CYCLES = [2, 3, 4, 5, 6];

const CYCLE_INFO: Record<number, { label: string; quality: string; highlight: boolean }> = {
  2: { label: "2주기 · 3시간", quality: "최소", highlight: false },
  3: { label: "3주기 · 4시간 30분", quality: "짧음", highlight: false },
  4: { label: "4주기 · 6시간", quality: "적당", highlight: false },
  5: { label: "5주기 · 7시간 30분", quality: "권장", highlight: true },
  6: { label: "6주기 · 9시간", quality: "충분", highlight: false },
};

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true });
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
      <select
        value={hour}
        onChange={(e) => onHourChange(parseInt(e.target.value))}
        className="bg-secondary border border-border rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-center"
        style={{ minWidth: 80 }}
      >
        {hours.map((h) => (
          <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
        ))}
      </select>
      <span className="text-3xl font-bold text-muted-foreground">:</span>
      <select
        value={minute}
        onChange={(e) => onMinuteChange(parseInt(e.target.value))}
        className="bg-secondary border border-border rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-center"
        style={{ minWidth: 80 }}
      >
        {minuteOptions.map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
        ))}
      </select>
    </div>
  );
}

function ResultRow({
  cycles, time, type,
}: {
  cycles: number; time: Date; type: "sleep" | "wake";
}) {
  const info = CYCLE_INFO[cycles];
  return (
    <div
      className={`flex items-center justify-between py-4 border-b border-border last:border-0 ${
        info.highlight ? "group" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`text-3xl font-black tabular-nums tracking-tight ${
            info.highlight ? "text-primary" : "text-foreground"
          }`}
        >
          {formatTime(time)}
        </span>
        {info.highlight && (
          <span className="text-xs font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
            권장
          </span>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm text-foreground font-medium">{info.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {type === "wake" ? "기상" : "취침"}
        </p>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/", icon: Moon, label: "계산기" },
  { href: "/log", icon: Clock, label: "기록" },
  { href: "/stats", icon: Sun, label: "통계" },
  { href: "/tips", icon: BookOpen, label: "수면 팁" },
];

export default function HomePage() {
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

  const sleepNowResults = now
    ? CYCLES.map((cycles) => ({
        cycles,
        time: addMinutes(now, FALL_ASLEEP_MINUTES + cycles * CYCLE_MINUTES),
      }))
    : [];

  const sleepAtTarget = new Date();
  sleepAtTarget.setHours(sleepHour, sleepMinute, 0, 0);
  if (now && sleepAtTarget <= now) sleepAtTarget.setDate(sleepAtTarget.getDate() + 1);
  const sleepAtResults = CYCLES.map((cycles) => ({
    cycles,
    time: addMinutes(sleepAtTarget, FALL_ASLEEP_MINUTES + cycles * CYCLE_MINUTES),
  }));

  const wakeTarget = new Date();
  wakeTarget.setHours(wakeHour, wakeMinute, 0, 0);
  if (now && wakeTarget <= now) wakeTarget.setDate(wakeTarget.getDate() + 1);
  const wakeAtResults = CYCLES.map((cycles) => ({
    cycles,
    time: addMinutes(wakeTarget, -(FALL_ASLEEP_MINUTES + cycles * CYCLE_MINUTES)),
  })).reverse();

  const MODES = [
    { key: "sleep-now", label: "지금 자면" },
    { key: "sleep-at", label: "이 시간에 자면" },
    { key: "wake-at", label: "일어날 시간을 알면" },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <span className="text-lg font-black tracking-tight">Sleep Coach</span>
        <span className="text-sm text-muted-foreground tabular-nums" suppressHydrationWarning>
          {now?.toLocaleTimeString("ko-KR", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
          }) ?? ""}
        </span>
      </header>

      <main className="flex-1 px-5 pb-6 space-y-8">
        {/* 타이틀 */}
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            수면 사이클<br />계산기
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            90분 사이클에 맞춰 개운하게 일어나세요
          </p>
        </div>

        {/* 모드 선택 */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {MODES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key as typeof mode)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
                mode === key
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 지금 자면 */}
        {mode === "sleep-now" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4" suppressHydrationWarning>
              지금 <strong className="text-foreground">{now ? formatTime(now) : ""}</strong>에 자면 이때 일어나세요
            </p>
            <div>
              {sleepNowResults.map(({ cycles, time }) => (
                <ResultRow key={cycles} cycles={cycles} time={time} type="wake" />
              ))}
            </div>
          </div>
        )}

        {/* 이 시간에 자면 */}
        {mode === "sleep-at" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">취침 시간을 선택하세요</p>
            <TimeSelect
              hour={sleepHour} onHourChange={setSleepHour}
              minute={sleepMinute} onMinuteChange={setSleepMinute}
            />
            <div className="mt-6">
              {sleepAtResults.map(({ cycles, time }) => (
                <ResultRow key={cycles} cycles={cycles} time={time} type="wake" />
              ))}
            </div>
          </div>
        )}

        {/* 일어날 시간을 알면 */}
        {mode === "wake-at" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">기상 시간을 선택하세요</p>
            <TimeSelect
              hour={wakeHour} onHourChange={setWakeHour}
              minute={wakeMinute} onMinuteChange={setWakeMinute}
            />
            <div className="mt-6">
              {wakeAtResults.map(({ cycles, time }) => (
                <ResultRow key={cycles} cycles={cycles} time={time} type="sleep" />
              ))}
            </div>
          </div>
        )}

        {/* 안내 */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            수면은 약 <strong className="text-foreground">90분</strong> 단위로 반복됩니다.
            사이클이 끝나는 타이밍에 일어나면 훨씬 개운합니다.
            잠드는 데 걸리는 평균 시간 <strong className="text-foreground">15분</strong>이 포함된 계산입니다.
          </p>
        </div>
      </main>

      {/* 하단 네비 */}
      <nav className="border-t border-border flex sticky bottom-0 bg-background">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === "/";
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
    </div>
  );
}
