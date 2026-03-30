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
  password: z.string().min(8),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, { message: "mismatch", path: ["passwordConfirm"] });
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    const { error } = await createClient().auth.signUp({
      email: data.email, password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setLoading(false);
    if (error) { toast.error(error.message.includes("already") ? t.auth.alreadyRegistered : error.message); return; }
    toast.success(t.auth.signupSuccess);
    router.push("/auth/verify-email");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-36 px-5 max-w-lg mx-auto flex flex-col justify-center min-h-screen">
        <div className="space-y-8">
          <div>
            <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-primary mb-2 font-[family-name:var(--font-body)]">
              Get started
            </span>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-3xl text-foreground leading-tight mb-2">
              {t.auth.register}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.auth.registerSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { label: t.auth.email, type: "email", key: "email", placeholder: t.auth.emailPlaceholder },
              { label: t.auth.password, type: "password", key: "password", placeholder: t.auth.password8 },
              { label: t.auth.passwordConfirm, type: "password", key: "passwordConfirm", placeholder: t.auth.passwordConfirmPlaceholder },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder}
                  {...register(field.key as keyof Form)}
                  className="w-full glass-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 bg-transparent" />
                {errors[field.key as keyof Form] && (
                  <p className="text-xs text-destructive">
                    {field.key === "passwordConfirm" ? t.auth.passwordMismatch
                      : field.key === "password" ? t.auth.password8Error
                      : t.auth.emailRequired}
                  </p>
                )}
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2 shadow-lg shadow-primary/20">
              {loading ? t.auth.registerLoading : t.auth.register}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.hasAccount}{" "}
            <Link href="/auth/login" className="text-foreground font-semibold hover:text-primary transition-colors">
              {t.auth.login}
            </Link>
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
