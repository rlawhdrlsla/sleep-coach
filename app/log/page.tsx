"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Clock, BookOpen, Plus, Trash2, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SleepLog {
  id: string;
  sleep_at: string;
  wake_at: string;
  cycles: number;
  quality: number | null;
  memo: string | null;
}

const NAV_ITEMS = [
  { href: "/", icon: Moon, label: "계산기" },
  { href: "/log", icon: Clock, label: "기록" },
  { href: "/stats", icon: Sun, label: "통계" },
  { href: "/tips", icon: BookOpen, label: "수면 팁" },
];

const QUALITY_LABELS = ["", "최악", "별로", "보통", "좋음", "최고"];
const QUALITY_COLORS = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-green-400", "text-primary"];

function formatKR(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("ko-KR", { month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDuration(sleepAt: string, wakeAt: string) {
  const diff = new Date(wakeAt).getTime() - new Date(sleepAt).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

export default function LogPage() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  const [sleepHour, setSleepHour] = useState(23);
  const [sleepMin, setSleepMin] = useState(0);
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMin, setWakeMin] = useState(0);
  const [quality, setQuality] = useState(3);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data } = await supabase
      .from("sleep_logs")
      .select("*")
      .order("sleep_at", { ascending: false })
      .limit(30);
    setLogs(data ?? []);
    setLoading(false);
  }

  async function saveLog() {
    setSaving(true);
    const today = new Date();
    const sleepDate = new Date(today);
    sleepDate.setHours(sleepHour, sleepMin, 0, 0);
    const wakeDate = new Date(today);
    wakeDate.setHours(wakeHour, wakeMin, 0, 0);
    if (wakeDate <= sleepDate) wakeDate.setDate(wakeDate.getDate() + 1);

    const diffMin = (wakeDate.getTime() - sleepDate.getTime()) / 60000;
    const cycles = Math.round(diffMin / 90);

    const { error } = await supabase.from("sleep_logs").insert({
      sleep_at: sleepDate.toISOString(),
      wake_at: wakeDate.toISOString(),
      cycles: Math.max(1, cycles),
      quality,
      memo: memo || null,
    });

    setSaving(false);
    if (error) { toast.error("저장 실패"); return; }
    toast.success("기록됐습니다");
    setShowForm(false);
    setMemo("");
    fetchLogs();
  }

  async function deleteLog(id: string) {
    const { error } = await supabase.from("sleep_logs").delete().eq("id", id);
    if (error) { toast.error("삭제 실패"); return; }
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <span className="text-lg font-black tracking-tight">Sleep Coach</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <Plus className="h-4 w-4" />
          기록 추가
        </button>
      </header>

      <main className="flex-1 px-5 pb-6 space-y-6">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">수면 기록</h1>
          <p className="text-muted-foreground mt-2 text-sm">나의 수면 패턴을 기록하세요</p>
        </div>

        {/* 기록 입력 폼 */}
        {showForm && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-5 space-y-5">
            <p className="font-bold">오늘 수면 기록</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">취침 시간</p>
                <div className="flex gap-1">
                  <select value={sleepHour} onChange={(e) => setSleepHour(+e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-2 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary">
                    {hours.map((h) => <option key={h} value={h}>{String(h).padStart(2,"0")}</option>)}
                  </select>
                  <select value={sleepMin} onChange={(e) => setSleepMin(+e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-2 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary">
                    {minuteOptions.map((m) => <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">기상 시간</p>
                <div className="flex gap-1">
                  <select value={wakeHour} onChange={(e) => setWakeHour(+e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-2 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary">
                    {hours.map((h) => <option key={h} value={h}>{String(h).padStart(2,"0")}</option>)}
                  </select>
                  <select value={wakeMin} onChange={(e) => setWakeMin(+e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-2 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary">
                    {minuteOptions.map((m) => <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">수면 품질</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((q) => (
                  <button key={q} onClick={() => setQuality(q)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      quality === q
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}>
                    {QUALITY_LABELS[q]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">메모 (선택)</p>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="오늘 수면에 대한 메모..."
                rows={2}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                취소
              </button>
              <button onClick={saveLog} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}

        {/* 기록 목록 */}
        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">불러오는 중...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-4xl">😴</p>
            <p className="text-muted-foreground text-sm">아직 기록이 없어요</p>
            <p className="text-muted-foreground text-xs">첫 수면을 기록해보세요</p>
          </div>
        ) : (
          <div>
            {logs.map((log) => (
              <div key={log.id} className="py-4 border-b border-border last:border-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">{new Date(log.sleep_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}</span>
                      {log.quality && (
                        <span className={`text-xs font-semibold ${QUALITY_COLORS[log.quality]}`}>
                          {QUALITY_LABELS[log.quality]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">취침</p>
                        <p className="font-bold tabular-nums">
                          {new Date(log.sleep_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs">→</span>
                      <div>
                        <p className="text-xs text-muted-foreground">기상</p>
                        <p className="font-bold tabular-nums">
                          {new Date(log.wake_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground">수면</p>
                        <p className="font-bold">{formatDuration(log.sleep_at, log.wake_at)}</p>
                      </div>
                    </div>
                    {log.memo && (
                      <p className="text-xs text-muted-foreground">{log.memo}</p>
                    )}
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="ml-3 text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="border-t border-border flex sticky bottom-0 bg-background">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <a key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              href === "/log" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
