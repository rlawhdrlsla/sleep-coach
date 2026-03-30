"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2, RefreshCw, Users, Moon, Activity, LogIn, ArrowLeft } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  log_count: number;
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "-";
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "오늘";
  if (d === 1) return "어제";
  if (d < 30) return `${d}일 전`;
  if (d < 365) return `${Math.floor(d / 30)}개월 전`;
  return `${Math.floor(d / 365)}년 전`;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        fetchUsers();
      }
      fetchUsers();
    });
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.status === 401) { router.push("/"); return; }
    const data = await res.json();
    setUsers(data.users ?? []);
    setAuthorized(true);
    setLoading(false);
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`${email} 계정을 삭제하시겠습니까?\n모든 수면 기록도 함께 삭제됩니다.`)) return;
    setDeleting(id);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    setDeleting(null);
    if (!res.ok) { toast.error("삭제 실패"); return; }
    toast.success("삭제됐습니다");
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const filtered = users.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label: "전체 사용자", value: users.length, icon: Users },
    { label: "이메일 인증", value: users.filter((u) => u.email_confirmed_at).length, icon: Activity },
    { label: "오늘 로그인", value: users.filter((u) => u.last_sign_in_at && timeAgo(u.last_sign_in_at) === "오늘").length, icon: LogIn },
    { label: "총 수면 기록", value: users.reduce((a, b) => a + b.log_count, 0), icon: Moon },
  ];

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 glass-header flex items-center justify-between px-5 py-4 max-w-3xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </a>
          <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-lg text-primary tracking-tight">
            Admin
          </h1>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />새로고침
        </button>
      </header>

      <main className="pt-24 pb-12 px-5 max-w-3xl mx-auto space-y-6">
        <section>
          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-primary mb-2 font-[family-name:var(--font-body)]">
            Dashboard
          </span>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-3xl text-foreground leading-tight mb-1">
            Sleep Coach
          </h2>
          <p className="text-muted-foreground text-sm">관리자 패널 · {users.length}명의 사용자</p>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-4">
              <Icon className="h-4 w-4 text-primary/60 mb-2" />
              <p className="font-[family-name:var(--font-heading)] font-bold text-2xl">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이메일 검색..."
          className="w-full glass-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 bg-transparent"
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-[family-name:var(--font-heading)] font-bold text-sm">사용자 목록</p>
            <p className="text-xs text-muted-foreground">{filtered.length}명</p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">검색 결과 없음</div>
            ) : (
              filtered.map((user, i) => (
                <div key={user.id}
                  className={`flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors ${i < filtered.length - 1 ? "border-b border-border/20" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{user.email}</span>
                      {!user.email_confirmed_at && (
                        <span className="text-[10px] bg-orange-400/10 text-orange-400 px-1.5 py-0.5 rounded-full shrink-0 font-semibold uppercase tracking-wide">
                          미인증
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>가입 {timeAgo(user.created_at)}</span>
                      <span>·</span>
                      <span>로그인 {timeAgo(user.last_sign_in_at)}</span>
                      <span>·</span>
                      <span className="text-primary font-semibold">기록 {user.log_count}개</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    disabled={deleting === user.id}
                    className="ml-3 p-2 text-muted-foreground/30 hover:text-destructive transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">최근 가입 순 · 최대 1000명 표시</p>
      </main>
    </div>
  );
}
