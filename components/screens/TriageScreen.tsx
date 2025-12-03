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
    title: "지금은 비교적 안정적이에요",
    desc: "현재 측정된 수치는 전반적으로 안전 범위 안에 있어요.",
    action: "지금처럼 집에서 처방받은 방법대로 관리해 주세요.",
    color: "mint",
  },
  3: {
    title: "응급 단계예요, 바로 병원으로 가야 합니다",
    desc: "저산소 상태가 계속 확인되고 있어, 의료진의 신속하고 즉각적인 전문 진료가 요구됩니다.",
    action: "119 또는 가까운 소아응급실로 즉시 이동해 주세요.",
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
    <div className="flex items-center gap-2">
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
  onNavigate,
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
      return 2;
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
      ? "border-emerald-100 shadow-[0_16px_36px_rgba(16,185,129,0.10)]"
      : "border-rose-100 shadow-[0_16px_36px_rgba(244,63,94,0.14)]";

  return (
    <div className="h-full bg-slate-50 flex flex-col font-sans max-w-md mx-auto">
      {/* HEADER */}
      <header className="px-4 py-2 bg-white border-b border-slate-100 flex items-center">
  <button
    type="button"
    onClick={onBack}
    className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 active:scale-95 transition min-w-[36px] min-h-[36px]"
    aria-label="뒤로가기"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M12.7 5.3a1 1 0 010 1.4L9.4 10l3.3 3.3a1 1 0 01-1.4 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.4 0z" />
    </svg>
  </button>
  <h1 className="ml-1.5 text-[12px] font-medium text-slate-700 tracking-tight">
    오늘 우리 아이 상태
  </h1>
</header>


      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* STATUS CARD */}
        <section
          className={`bg-white rounded-3xl px-5 pt-5 pb-5 space-y-5 border ${cardAccentClass}`}
        >
          {/* 1. 24시간 신호 리포트 + 숫자 */}
          <div className="space-y-3">
            <SectionHeader
              label="24시 건강 신호 리포트"
              accent={status.color}
            />

            <div className="flex flex-col items-center justify-center pt-1 gap-2.5">
              {/* 얼굴 게이지 */}
              <div className="flex items-center w-full max-w-[260px] justify-between">
                <GaugeFace active={cardLevel === 1} icon="😊" variant="mint" />
                <div className="flex-1 h-px mx-2 bg-slate-100" />
                <GaugeFace
                  active={rawLevel === 2}
                  icon="😐"
                  variant="neutral"
                />
                <div className="flex-1 h-px mx-2 bg-slate-100" />
                <GaugeFace active={cardLevel === 3} icon="😫" variant="rose" />
              </div>

              {/* 숫자 요약: 화면 가로 전체 3등분 */}
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
                  label="피크압"
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

          {/* 3. 액션 카드 (타이틀 없이 바로) */}
          <div className="mt-1">
            <div
              className={`
                rounded-2xl px-3.5 py-3.5 flex items-center gap-3.5
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
          </div>
        </section>

        {/* EMERGENCY SECTION: 119 + 지도 */}
        {/* EMERGENCY SECTION: 119 + 지도 */}
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
      autoFocus
      onClick={() => {
        window.location.href = "tel:119";
      }}
      className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 text-white text-[15px] font-semibold shadow-[0_16px_34px_rgba(248,113,113,0.4)] active:scale-[0.97] transition min-h-[46px]"
      aria-label="119 긴급 전화 걸기"
    >
      <span className="text-[18px]">🚨</span>
      <span>119로 바로 전화하기</span>
    </button>

    {/* 소아응급실 지도 카드 – 텍스트 최소화, 지도 크게 */}
    <button
      type="button"
      onClick={() => {
        // 예: onNavigate("map") 또는 window.open(지도URL)
      }}
      className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-sm active:scale-[0.98] transition text-left space-y-2.5"
      aria-label="가까운 소아응급실 지도 열기"
    >
      {/* 상단 한 줄 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-slate-900">
          가까운 소아응급실 지도
        </span>
        <span className="text-[11px] text-slate-400">열기</span>
      </div>

      {/* 지도 느낌 나는 일러스트 영역 (더 크게) */}
      <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mt-1.5">
        {/* 간단한 격자/도로 느낌 */}
        <div className="absolute inset-0 opacity-80">
          <div className="absolute left-0 right-0 top-1/3 h-6 bg-white/80 border-y border-slate-200" />
          <div className="absolute left-0 right-0 top-2/3 h-6 bg-white/80 border-y border-slate-200" />
          <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-white/80 border-x border-slate-200" />
          <div className="absolute top-0 bottom-0 left-2/3 w-6 bg-white/80 border-x border-slate-200" />
        </div>

        {/* 병원 마커 */}
        <div className="absolute left-[68%] top-[38%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-[11px] text-white shadow-md">
            🏥
          </div>
          <div className="mt-1 text-[11px] text-rose-700 bg-white/95 rounded-full px-2 py-0.5 shadow-sm">
            소아응급실
          </div>
        </div>

        {/* 현재 위치 마커 */}
        <div className="absolute left-[30%] top-[70%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center shadow">
            ●
          </div>
          <div className="mt-1 text-[11px] text-slate-700 bg-white/95 rounded-full px-2 py-0.5 shadow-sm">
            현재 위치
          </div>
        </div>

        {/* 점선 경로 */}
        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <path
            d="M30 70 C 40 60, 55 55, 68 38"
            fill="none"
            stroke="#fb7185"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
    </button>
  </section>
)}

      </div>
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
    },
    warn: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
    },
    bad: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-100",
    },
  }[status];

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        rounded-xl px-2.5 py-2 border
        ${style.bg} ${style.border}
        h-[60px]
      `}
    >
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[12px] font-semibold ${style.text}`}>
        {value}
      </span>
    </div>
  );
};

export default TriageScreen;
