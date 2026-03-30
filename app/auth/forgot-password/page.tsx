"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-5">
      <header className="pt-8 pb-4">
        <Link href="/" className="text-lg font-black tracking-tight">Sleep Coach</Link>
      </header>
      <main className="flex-1 flex flex-col justify-center pb-16 space-y-8">
        {sent ? (
          <>
            <div className="text-4xl">📩</div>
            <h1 className="text-3xl font-black leading-tight tracking-tight">이메일을 확인해주세요</h1>
            <p className="text-muted-foreground text-sm">비밀번호 재설정 링크를 발송했습니다.</p>
            <Link href="/auth/login" className="inline-block text-center border border-border rounded-xl py-3 text-sm font-semibold hover:bg-secondary transition-colors">
              로그인으로 돌아가기
            </Link>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-4xl font-black leading-tight tracking-tight">비밀번호 찾기</h1>
              <p className="text-muted-foreground mt-2 text-sm">가입한 이메일로 재설정 링크를 보내드립니다</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "전송 중..." : "재설정 링크 보내기"}
              </button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-foreground font-semibold hover:text-primary transition-colors">
                로그인으로 돌아가기
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
