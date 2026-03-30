"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageContext";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({ email: data.email, password: data.password });
    setLoading(false);
    if (error) { toast.error(t.auth.loginError); return; }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-36 px-5 max-w-lg mx-auto flex flex-col justify-center min-h-screen">
        <div className="space-y-8">
          <div>
            <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-primary mb-2 font-[family-name:var(--font-body)]">
              Welcome back
            </span>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-3xl text-foreground leading-tight mb-2">
              {t.auth.login}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.auth.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.auth.email}</label>
              <input type="email" placeholder={t.auth.emailPlaceholder} {...register("email")}
                className="w-full glass-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 bg-transparent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.auth.password}</label>
              <input type="password" placeholder={t.auth.passwordPlaceholder} {...register("password")}
                className="w-full glass-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 bg-transparent" />
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t.auth.forgotPassword}
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20">
              {loading ? t.auth.loginLoading : t.auth.login}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link href="/auth/register" className="text-foreground font-semibold hover:text-primary transition-colors">
              {t.auth.register}
            </Link>
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
