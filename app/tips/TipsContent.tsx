"use client";

import { useLang } from "@/lib/i18n/LanguageContext";

const TIPS = {
  ko: [
    { emoji: "☀️", title: "아침 햇빛 쬐기", desc: "기상 후 30분 이내에 햇빛을 쬐면 생체 리듬이 맞춰지고 밤에 더 쉽게 잠들 수 있습니다.", tag: "기상" },
    { emoji: "📵", title: "취침 1시간 전 스마트폰 금지", desc: "블루라이트는 멜라토닌 분비를 억제합니다. 취침 전엔 독서나 스트레칭을 추천합니다.", tag: "취침 준비" },
    { emoji: "🌡️", title: "침실 온도 18~20°C 유지", desc: "체온이 살짝 내려갈 때 깊은 수면에 들기 쉽습니다.", tag: "환경" },
    { emoji: "⏰", title: "매일 같은 시간에 일어나기", desc: "주말에도 비슷한 시간에 일어나면 생체 시계가 안정됩니다.", tag: "루틴" },
    { emoji: "☕", title: "오후 2시 이후 카페인 금지", desc: "카페인의 반감기는 약 6시간입니다. 오후 2시 커피가 밤 8시에도 절반이 남습니다.", tag: "식습관" },
    { emoji: "🏃", title: "운동은 취침 3시간 전까지", desc: "취침 직전 격렬한 운동은 각성 상태를 만들 수 있습니다.", tag: "운동" },
    { emoji: "😴", title: "낮잠은 20분 이하로", desc: "20분 낮잠은 피로 회복에 효과적이지만, 그 이상이면 오히려 더 피곤할 수 있습니다.", tag: "낮잠" },
    { emoji: "🧘", title: "취침 전 이완 루틴 만들기", desc: "따뜻한 샤워, 가벼운 스트레칭 등 일관된 루틴이 뇌에 수면 신호를 보냅니다.", tag: "취침 준비" },
    { emoji: "🍷", title: "알코올은 수면의 적", desc: "술은 처음엔 잠들게 하지만 깊은 수면을 방해해 자고 나도 피곤합니다.", tag: "식습관" },
  ],
  en: [
    { emoji: "☀️", title: "Morning Sunlight", desc: "Getting sunlight within 30 min of waking helps sync your circadian rhythm.", tag: "Morning" },
    { emoji: "📵", title: "No Screens 1hr Before Bed", desc: "Blue light suppresses melatonin. Try reading or stretching instead.", tag: "Bedtime" },
    { emoji: "🌡️", title: "Keep Bedroom 18–20°C", desc: "A slightly cooler temperature helps you fall into deeper sleep.", tag: "Environment" },
    { emoji: "⏰", title: "Wake at the Same Time Daily", desc: "Even on weekends, a consistent wake time stabilizes your body clock.", tag: "Routine" },
    { emoji: "☕", title: "No Caffeine After 2PM", desc: "Caffeine's half-life is ~6 hours. That 2pm coffee is still half-active at 8pm.", tag: "Diet" },
    { emoji: "🏃", title: "Exercise 3hrs Before Bed", desc: "Intense exercise right before bed can keep you awake.", tag: "Exercise" },
    { emoji: "😴", title: "Keep Naps Under 20 Min", desc: "A 20-min nap boosts alertness. Longer naps can leave you groggy.", tag: "Nap" },
    { emoji: "🧘", title: "Build a Bedtime Routine", desc: "Consistent pre-sleep rituals signal your brain it's time to sleep.", tag: "Bedtime" },
    { emoji: "🍷", title: "Alcohol Disrupts Sleep", desc: "Alcohol helps you fall asleep but disrupts deep sleep stages.", tag: "Diet" },
  ],
  zh: [
    { emoji: "☀️", title: "晨间晒太阳", desc: "起床后30分钟内晒太阳，有助于调节生物节律。", tag: "早晨" },
    { emoji: "📵", title: "睡前1小时禁用手机", desc: "蓝光会抑制褪黑素分泌，建议改为阅读或拉伸。", tag: "睡前准备" },
    { emoji: "🌡️", title: "卧室温度保持18~20°C", desc: "体温微降时更容易进入深度睡眠。", tag: "环境" },
    { emoji: "⏰", title: "每天同一时间起床", desc: "即使周末也保持相近的起床时间，有助于稳定生物钟。", tag: "作息" },
    { emoji: "☕", title: "下午2点后不喝咖啡", desc: "咖啡因半衰期约6小时，下午2点的咖啡到晚上8点仍有一半残留。", tag: "饮食" },
    { emoji: "🏃", title: "运动在睡前3小时完成", desc: "睡前剧烈运动会让人保持清醒状态。", tag: "运动" },
    { emoji: "😴", title: "午睡控制在20分钟以内", desc: "20分钟的午睡能有效恢复精力，更长时间反而会更疲惫。", tag: "午睡" },
    { emoji: "🧘", title: "建立睡前放松程序", desc: "温水澡、轻度拉伸等固定程序能向大脑发出睡眠信号。", tag: "睡前准备" },
    { emoji: "🍷", title: "酒精是睡眠的敌人", desc: "酒精虽然助眠，但会干扰深度睡眠，导致睡醒后仍感疲惫。", tag: "饮食" },
  ],
  ja: [
    { emoji: "☀️", title: "朝の日光を浴びる", desc: "起床後30分以内に日光を浴びると体内時計が整います。", tag: "起床" },
    { emoji: "📵", title: "就寝1時間前はスマホ禁止", desc: "ブルーライトはメラトニン分泌を抑制します。読書やストレッチがおすすめ。", tag: "就寝準備" },
    { emoji: "🌡️", title: "寝室温度を18~20°Cに", desc: "体温が少し下がるときに深い睡眠に入りやすくなります。", tag: "環境" },
    { emoji: "⏰", title: "毎日同じ時間に起きる", desc: "週末も同じ時間に起きると体内時計が安定します。", tag: "ルーティン" },
    { emoji: "☕", title: "午後2時以降はカフェイン禁止", desc: "カフェインの半減期は約6時間。午後2時のコーヒーが夜8時にも半分残ります。", tag: "食習慣" },
    { emoji: "🏃", title: "運動は就寝3時間前まで", desc: "就寝直前の激しい運動は覚醒状態を作ることがあります。", tag: "運動" },
    { emoji: "😴", title: "昼寝は20分以内に", desc: "20分の昼寝は疲労回復に効果的ですが、それ以上は逆効果になることも。", tag: "昼寝" },
    { emoji: "🧘", title: "就寝前のリラックスルーティン", desc: "温かいシャワーや軽いストレッチなど一貫したルーティンが脳に睡眠シグナルを送ります。", tag: "就寝準備" },
    { emoji: "🍷", title: "アルコールは睡眠の敵", desc: "お酒は最初は眠れますが、深い睡眠を妨げて疲れが取れません。", tag: "食習慣" },
  ],
};

export default function TipsContent() {
  const { t, lang } = useLang();
  const tips = TIPS[lang] ?? TIPS.ko;

  return (
    <main className="flex-1 px-5 pb-6 space-y-6">
      <div>
        <h1 className="text-4xl font-black leading-tight tracking-tight">{t.tips.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t.tips.subtitle}</p>
      </div>
      <div>
        {tips.map((tip, i) => (
          <div key={tip.title} className="py-5 border-b border-border last:border-0">
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-0.5">{tip.emoji}</span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{tip.title}</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{tip.tag}</span>
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
  );
}
