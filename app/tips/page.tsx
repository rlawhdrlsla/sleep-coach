import { Moon, Sun, Clock, BookOpen } from "lucide-react";

const TIPS = [
  {
    emoji: "☀️",
    title: "아침 햇빛 쬐기",
    desc: "기상 후 30분 이내에 햇빛을 쬐면 생체 리듬이 맞춰지고 밤에 더 쉽게 잠들 수 있습니다.",
    tag: "기상",
  },
  {
    emoji: "📵",
    title: "취침 1시간 전 스마트폰 금지",
    desc: "블루라이트는 수면 호르몬(멜라토닌) 분비를 억제합니다. 취침 전엔 독서나 스트레칭을 추천합니다.",
    tag: "취침 준비",
  },
  {
    emoji: "🌡️",
    title: "침실 온도 18~20°C 유지",
    desc: "체온이 살짝 내려갈 때 깊은 수면에 들기 쉽습니다. 너무 덥거나 추우면 수면의 질이 낮아집니다.",
    tag: "환경",
  },
  {
    emoji: "⏰",
    title: "매일 같은 시간에 일어나기",
    desc: "주말에도 평일과 비슷한 시간에 일어나면 생체 시계가 안정됩니다. 늦잠은 다음날 더 피곤하게 만듭니다.",
    tag: "루틴",
  },
  {
    emoji: "☕",
    title: "오후 2시 이후 카페인 금지",
    desc: "카페인의 반감기는 약 6시간입니다. 오후 2시에 마신 커피가 밤 8시에도 절반이 남아있습니다.",
    tag: "식습관",
  },
  {
    emoji: "🏃",
    title: "운동은 취침 3시간 전까지",
    desc: "운동은 수면의 질을 높이지만, 취침 직전 격렬한 운동은 오히려 각성 상태를 만들 수 있습니다.",
    tag: "운동",
  },
  {
    emoji: "😴",
    title: "낮잠은 20분 이하로",
    desc: "20분 낮잠은 피로 회복에 효과적이지만, 그 이상이면 깊은 수면에 들어 오히려 더 피곤해질 수 있습니다.",
    tag: "낮잠",
  },
  {
    emoji: "🧘",
    title: "취침 전 이완 루틴 만들기",
    desc: "따뜻한 샤워, 가벼운 스트레칭, 명상 등 일관된 취침 루틴은 뇌에 잠잘 시간이라는 신호를 보냅니다.",
    tag: "취침 준비",
  },
  {
    emoji: "🍷",
    title: "알코올은 수면의 적",
    desc: "술은 처음엔 잠들게 하지만, 깊은 수면 단계를 방해해 자고 나도 피곤한 느낌을 줍니다.",
    tag: "식습관",
  },
];

const NAV_ITEMS = [
  { href: "/", icon: Moon, label: "계산기" },
  { href: "/log", icon: Clock, label: "기록" },
  { href: "/stats", icon: Sun, label: "통계" },
  { href: "/tips", icon: BookOpen, label: "수면 팁" },
];

export default function TipsPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <span className="text-lg font-black tracking-tight">Sleep Coach</span>
      </header>

      <main className="flex-1 px-5 pb-6 space-y-6">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">수면 팁</h1>
          <p className="text-muted-foreground mt-2 text-sm">더 잘 자기 위한 과학적으로 검증된 방법들</p>
        </div>

        <div className="space-y-0">
          {TIPS.map((tip, i) => (
            <div key={tip.title} className="py-5 border-b border-border last:border-0">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{tip.emoji}</span>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{tip.title}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {tip.tag}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
                <span className="text-muted-foreground/30 font-black text-sm tabular-nums mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="border-t border-border flex sticky bottom-0 bg-background">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === "/tips";
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
