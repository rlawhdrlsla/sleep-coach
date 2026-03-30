"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

interface SleepLog {
  id: string;
  sleep_at: string;
  wake_at: string;
  cycles: number;
  quality: number | null;
  memo: string | null;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

function formatDuration(sleepAt: string, wakeAt: string) {
  const diff = new Date(wakeAt).getTime() - new Date(sleepAt).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function LogPage() {
  const { t, lang } = useLang();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sleepHour, setSleepHour] = useState(23);
  const [sleepMin, setSleepMin] = useState(0);
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMin, setWakeMin] = useState(0);
  const [quality, setQuality] = useState(3);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data } = await supabase.from("sleep_logs").select("*").order("sleep_at", { ascending: false }).limit(30);
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
    const { error } = await supabase.from("sleep_logs").insert({
      sleep_at: sleepDate.toISOString(),
      wake_at: wakeDate.toISOString(),
      cycles: Math.max(1, Math.round(diffMin / 90)),
      quality,
      memo: memo || null,
    });
    setSaving(false);
    if (error) { toast.error(t.log.saveError); return; }
    toast.success(t.log.saved);
    setShowForm(false);
    setMemo("");
    fetchLogs();
  }

  async function deleteLog(id: string) {
    const { error } = await supabase.from("sleep_logs").delete().eq("id", id);
    if (error) { toast.error(t.log.deleteError); return; }
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  const locale = lang === "ko" ? "ko-KR" : lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : "en-US";
  const hour12 = lang === "ko" || lang === "en";

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <Header right={
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Plus className="h-4 w-4" />{t.log.add}
        </button>
      } />

      <main className="flex-1 px-5 pb-6 space-y-6">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">{t.log.title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t.log.subtitle}</p>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-5 space-y-5">
            <p className="font-bold">{t.log.today}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t.log.bedtime, hour: sleepHour, setHour: setSleepHour, min: sleepMin, setMin: setSleepMin },
                { label: t.log.wakeTime, hour: wakeHour, setHour: setWakeHour, min: wakeMin, setMin: setWakeMin },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">{item.label}</p>
                  <div className="flex gap-1">
                    <select value={item.hour} onChange={(e) => item.setHour(+e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg px-2 py-2 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary">
                      {hours.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                    </select>
                    <select value={item.min} onChange={(e) => item.setMin(+e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg px-2 py-2 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary">
                      {minuteOptions.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">{t.log.quality}</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((q) => (
                  <button key={q} onClick={() => setQuality(q)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      quality === q ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}>
                    {t.log.qualities[q]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">{t.log.memo}</p>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)}
                placeholder={t.log.memoPlaceholder} rows={2}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                {t.log.cancel}
              </button>
              <button onClick={saveLog} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? t.log.saving : t.log.save}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">{t.log.loading}</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-4xl">😴</p>
            <p className="text-muted-foreground text-sm">{t.log.empty}</p>
            <p className="text-muted-foreground text-xs">{t.log.emptySub}</p>
          </div>
        ) : (
          <div>
            {logs.map((log) => (
              <div key={log.id} className="py-4 border-b border-border last:border-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{new Date(log.sleep_at).toLocaleDateString(locale, { month: "long", day: "numeric", weekday: "short" })}</span>
                      {log.quality && (
                        <span className={`text-xs font-semibold ${t.log.qualityColors[log.quality]}`}>
                          {t.log.qualities[log.quality]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {[
                        { label: t.log.bedtime, time: log.sleep_at },
                        { label: t.log.wakeTime, time: log.wake_at },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="font-bold tabular-nums">
                            {new Date(item.time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12 })}
                          </p>
                        </div>
                      ))}
                      <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground">{t.stats.avgSleep.split(" ")[1] ?? ""}</p>
                        <p className="font-bold">{formatDuration(log.sleep_at, log.wake_at)}</p>
                      </div>
                    </div>
                    {log.memo && <p className="text-xs text-muted-foreground">{log.memo}</p>}
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
      <BottomNav />
    </div>
  );
}
