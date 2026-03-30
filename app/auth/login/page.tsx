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
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <Link href="/" className="text-lg font-black tracking-tight">{t.appName}</Link>
      </header>

      <main className="flex-1 flex flex-col justify-center px-5 space-y-8 pb-8">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">{t.auth.login}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t.auth.loginSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">{t.auth.email}</label>
            <input type="email" placeholder={t.auth.emailPlaceholder} {...register("email")}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">{t.auth.password}</label>
            <input type="password" placeholder={t.auth.passwordPlaceholder} {...register("password")}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
          </div>
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">{t.auth.forgotPassword}</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? t.auth.loginLoading : t.auth.login}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t.auth.noAccount}{" "}
          <Link href="/auth/register" className="text-foreground font-semibold hover:text-primary transition-colors">{t.auth.register}</Link>
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
