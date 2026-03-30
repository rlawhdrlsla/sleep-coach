import Link from "next/link";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-5">
      <header className="pt-8 pb-4">
        <Link href="/" className="text-lg font-black tracking-tight">Sleep Coach</Link>
      </header>
      <main className="flex-1 flex flex-col justify-center pb-16 space-y-4">
        <div className="text-4xl">📬</div>
        <h1 className="text-3xl font-black leading-tight tracking-tight">이메일을 확인해주세요</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          가입하신 이메일로 인증 링크를 발송했습니다.<br />
          이메일 인증 후 바로 이용할 수 있습니다.
        </p>
        <Link
          href="/auth/login"
          className="inline-block text-center border border-border rounded-xl py-3 text-sm font-semibold hover:bg-secondary transition-colors mt-4"
        >
          로그인 화면으로
        </Link>
      </main>
    </div>
  );
}
