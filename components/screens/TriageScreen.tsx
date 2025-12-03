import React from "react";
import { ScreenName, PatientData } from "../../types";

interface TriageScreenProps {
  onBack: () => void;
  patientData: PatientData;
  onNavigate: (screen: ScreenName) => void;
}

type RiskLevel = 1 | 2 | 3;

const STATUS_CONFIG: Record<
  1 | 3,
  {
    title: string;
    desc: string;
    action: string;
    color: "mint" | "rose";
  }
> = {
  1: {
    title: "안정적인 경과를 보이고 있어요",
    desc: "현재 측정된 수치는 전반적으로 안전 범위 안에 있어요. 아이의 숨소리와 표정도 함께 살펴봐 주세요.",
    action: "지금처럼 잘 관리해주세요.",
    color: "mint",
  },
  3: {
    title: "응급 상황이 의심돼요",
    desc: "저산소 상태가 계속 확인되고 있어, 의료진의 신속하고 즉각적인 전문 진료가 필요해요.",
    action: "망설이지 말고 119 또는 가까운 소아응급실로 즉시 이동해 주세요.",
    color: "rose",
  },
} as const;

const getStylesForColor = (color: "mint" | "rose") => ({
  titleText: "text-slate-900",
  descText: "text-slate-700",
  actionBg: "bg-slate-50",
  actionBorder: color === "mint" ? "border-emerald-200" : "border-rose-200",
});

interface SectionHeaderProps {
  label: string;
  accent: "mint" | "rose";
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label, accent }) => {
  const barColor = accent === "mint" ? "bg-emerald-400" : "bg-rose-400";

  return (
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-[3px] h-4 rounded-full ${barColor}`} />
      <span className="text-[12px] font-semibold text-slate-800">
        {label}
      </span>
    </div>
  );
};

const TriageScreen: React.FC<TriageScreenProps> = ({
  onBack,
  patientData,
  onNavigate, // 시그니처 유지
}) => {
  const getRiskLevel = (data: PatientData): RiskLevel => {
    if (
      data.spo2 < 90 ||
      data.rr > 40 ||
      data.p_peak_measured > data.p_peak_threshold
    ) {
      return 3;
    }
    if (data.rr > 30 || data.spo2 < 94) {
      return 1;
    }
    return 1;
  };

  const rawLevel = getRiskLevel(patientData);
  const cardLevel: 1 | 3 = rawLevel === 3 ? 3 : 1;

  const status = STATUS_CONFIG[cardLevel];
  const styles = getStylesForColor(status.color);
  const isEmergency = cardLevel === 3;

  const cardAccentClass =
    status.color === "mint"
      ? "border-emerald-100 shadow-[0_16px_32px_rgba(16,185,129,0.10)]"
      : "border-rose-100 shadow-[0_16px_32px_rgba(244,63,94,0.16)]";

  return (
    <div className="h-full bg-slate-50 flex flex-col font-sans max-w-md mx-auto">
      {/* HEADER */}
      <header className="px-3 py-2 flex items-center justify-center bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm relative z-30 shrink-0">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="absolute left-3 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-[0.96] transition"
          aria-label="이전 화면으로 이동"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-700"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* 브랜드 로고 */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-xl shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
              aria-hidden="true"
            >
              <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
              <path d="M15 12h.01"></path>
              <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
              <path d="M9 12h.01"></path>
            </svg>
          </div>
          <div className="flex flex-col leading-tight items-start">
            <span className="text-[17px] font-extrabold tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              V.Doc PEDI-AIR
            </span>
            <span className="text-[9px] text-slate-500">
              Pediatric AI for Respiratory-care
            </span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* STATUS CARD */}
        <section
          className={`bg-white rounded-3xl px-5 pt-5 pb-5 space-y-5 border ${cardAccentClass}`}
        >
          {/* 1. 24시간 신호 리포트 + 숫자 */}
          <div className="space-y-3">
            <SectionHeader
              label="지난 24시간 건강 신호 요약"
              accent={status.color}
            />

            <div className="flex flex-col items-center justify-center pt-1 gap-3">
              {/* 얼굴 게이지 */}
              <div className="flex flex-col items-center w-full max-w-[280px] gap-1.5">
                <div className="flex items-center w-full justify-between">
                  <GaugeFace
                    active={cardLevel === 1}
                    icon="😊"
                    variant="mint"
                  />
                  <div className="flex-1 h-px mx-2 bg-slate-100" />
                  <GaugeFace
                    active={rawLevel === 2}
                    icon="😐"
                    variant="neutral"
                  />
                  <div className="flex-1 h-px mx-2 bg-slate-100" />
                  <GaugeFace
                    active={cardLevel === 3}
                    icon="😫"
                    variant="rose"
                  />
                </div>
                {/* 게이지 라벨 */}
                <div className="flex w-full justify-between text-[10px] text-slate-500">
                  <span className="w-1/3 text-left pl-1">안정</span>
                  <span className="w-1/3 text-center">주의</span>
                  <span className="w-1/3 text-right pr-1">위험</span>
                </div>
              </div>

              {/* 숫자 요약: 3등분 */}
              <div className="grid w-full grid-cols-3 gap-2 mt-1.5">
                <VitalMini
                  label="SpO₂"
                  value={`${patientData.spo2}%`}
                  status={
                    patientData.spo2 < 90
                      ? "bad"
                      : patientData.spo2 < 94
                      ? "warn"
                      : "good"
                  }
                />
                <VitalMini
                  label="호흡수"
                  value={`${patientData.rr}회/분`}
                  status={
                    patientData.rr > 40
                      ? "bad"
                      : patientData.rr > 30
                      ? "warn"
                      : "good"
                  }
                />
                <VitalMini
                  label="PIP"
                  value={`${patientData.p_peak_measured}`}
                  status={
                    patientData.p_peak_measured > patientData.p_peak_threshold
                      ? "bad"
                      : "good"
                  }
                />
              </div>
            </div>
          </div>

          {/* 2. 상태 해석 */}
          <div className="space-y-2.5">
            <SectionHeader label="상태 해석" accent={status.color} />
            <div>
              <p
                className={`
                  mt-1 text-[15px] font-black leading-snug
                  ${styles.titleText}
                `}
              >
                {status.title}
              </p>
              <p
                className={`
                  mt-2 text-[13px] leading-relaxed
                  ${styles.descText}
                `}
              >
                {status.desc}
              </p>
            </div>
          </div>

          {/* 3. 보호자에게 권장되는 다음 행동 */}
          <div className="mt-1">
          
            <div
              className={`
                mt-1 rounded-2xl px-3.5 py-3.5 flex items-center gap-3.5
                ${styles.actionBg} border ${styles.actionBorder}
              `}
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-sm flex items-center justify-center text-xl">
                {cardLevel === 1 ? "🏡" : "🚑"}
              </div>
              <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                {status.action}
              </p>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 leading-snug"> 
            </p>
          </div>
        </section>

        {/* EMERGENCY SECTION: 119 + 응급실 리스트 */}
        {isEmergency && (
          <section
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="space-y-4"
          >
            {/* 119 바로 연결 버튼 */}
            <button
              type="button"
              onClick={() => {
                window.location.href = "tel:119";
              }}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 text-white text-[15px] font-semibold shadow-[0_18px_36px_rgba(248,113,113,0.45)] active:scale-[0.97] transition min-h-[48px] border border-rose-400/60"
              aria-label="119 긴급 전화 걸기"
            >
              <span className="text-[18px] animate-pulse">🚨</span>
              <span>119로 바로 전화하기</span>
            </button>

            {/* 가까운 응급실 가용 병상 리스트 */}
            <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              {/* 상단 헤더 + 범례 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-slate-900">
                    가까운 소아응급실 안내
                  </span>

                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      "https://mediboard.nemc.or.kr/emergency_room_in_hand",
                      "_blank"
                    );
                  }}
                  className="text-[11px] text-sky-600 font-medium underline-offset-2 hover:underline"
                >
                  전체보기
                </button>
              </div>

              {/* 범례 (원활 / 보통 / 혼잡) */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  원활
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  보통
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  혼잡
                </span>
              </div>

              {/* 병원 리스트 */}
              <div className="space-y-2.5">
                {/* 병원 1 – 강남성심 (전체 원활) */}
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50/90 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                >
                  {/* 좌측 정보 영역 */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[13px] font-semibold text-slate-900 truncate">
                        강남성심병원
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-500 truncate">
                      서울특별시 영등포구 신길로 1 …
                    </span>

                    {/* 일반 / 소아 상태칩 */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        응급실일반
                        <span className="font-semibold">원활 · 18 / 22</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        응급실소아
                        <span className="font-semibold">원활 · 2 / 2</span>
                      </span>
                    </div>

                    
                  </div>

                  {/* 우측 도넛 게이지 */}
                  <DonutGauge label="원활" used={18} total={22} tone="good" />
                </button>

                {/* 병원 2 – 신촌세브란스 (보통/혼잡 섞임) */}
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50/90 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[13px] font-semibold text-slate-900 truncate">
                        신촌세브란스병원
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-500 truncate">
                      서울특별시 서대문구 연세로 …
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                        응급실일반
                        <span className="font-semibold">혼잡 · 19 /39</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        응급실소아
                        <span className="font-semibold">보통 · 2 / 8</span>
                      </span>
                    </div>

                    
                  </div>

                  <DonutGauge label="보통" used={15} total={21} tone="mid" />
                </button>
                {/* 병원 3 – 건국대 (혼잡 + 소아 정보 없음) */}
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50/90 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-[13px] font-semibold text-slate-900 truncate">
                        건국대병원
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-500 truncate">
                      서울특별시 광진구 능동로 …
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                        응급실일반
                        <span className="font-semibold">혼잡 · 23 / 24</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                        응급실소아
                        <span className="font-semibold">정보 없음</span>
                      </span>
                    </div>

                   
                  </div>

                  <DonutGauge label="혼잡" used={23} total={24} tone="bad" />
                </button>
              </div>

              <p className="mt-1 text-[10px] text-slate-400 leading-snug">
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

interface GaugeFaceProps {
  active: boolean;
  icon: string;
  variant: "mint" | "rose" | "neutral";
}

const GaugeFace: React.FC<GaugeFaceProps> = ({ active, icon, variant }) => {
  const config = {
    mint: {
      gradient: "from-emerald-400 to-teal-500",
      glow: "from-emerald-300/40 to-teal-300/40",
    },
    rose: {
      gradient: "from-rose-500 to-pink-500",
      glow: "from-rose-400/40 to-pink-300/40",
    },
    neutral: {
      gradient: "from-sky-400 to-cyan-500",
      glow: "from-sky-300/40 to-cyan-300/40",
    },
  }[variant];

  return (
    <div className="relative flex items-center justify-center">
      {active && (
        <div
          className={`absolute -inset-0.5 bg-gradient-to-br ${config.glow} rounded-full blur-md opacity-45`}
        />
      )}
      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-200 ${
          active
            ? `w-8 h-8 bg-gradient-to-br ${config.gradient} text-white shadow-sm ring-2 ring-white scale-105`
            : `w-7 h-7 bg-slate-100 text-slate-300`
        } ${active ? "animate-pulse" : ""}`}
      >
        <span className={active ? "text-[12px]" : "text-[11px] opacity-70"}>
          {icon}
        </span>
      </div>
    </div>
  );
};

interface VitalMiniProps {
  label: string;
  value: string;
  status: "good" | "warn" | "bad";
}

const VitalMini: React.FC<VitalMiniProps> = ({ label, value, status }) => {
  const style = {
    good: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100",
      helper: "정상 범위",
    },
    warn: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
      helper: "주의 필요",
    },
    bad: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-100",
      helper: "위험 범위",
    },
  }[status];

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        rounded-xl px-2.5 py-2 border
        ${style.bg} ${style.border}
        h-[64px]
      `}
    >
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[12px] font-semibold ${style.text}`}>
        {value}
      </span>
      <span className="mt-0.5 text-[9px] text-slate-500">
        {style.helper}
      </span>
    </div>
  );
};

interface DonutGaugeProps {
  label: string; // 원활 / 보통 / 혼잡
  used: number; // 사용 중 병상 수
  total: number; // 총 병상 수
  tone: "good" | "mid" | "bad";
}

const DonutGauge: React.FC<DonutGaugeProps> = ({
  label,
  used,
  total,
  tone,
}) => {
  const ratio = total > 0 ? Math.min(Math.max(used / total, 0), 1) : 0;

  const size = 32;
  const strokeWidth = 4;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - ratio);

  const color = {
    good: "#22c55e", // emerald
    mid: "#f97316", // amber
    bad: "#fb7185", // rose
  }[tone];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* 배경 원 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 채워진 도넛 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="text-[9px] font-semibold text-slate-600 leading-none">
        {label}
      </span>
      <span className="text-[9px] text-slate-400 leading-none">
        {used} / {total}
      </span>
    </div>
  );
};

export default TriageScreen;
