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

const getStylesForColor = (color: "mint" | "rose") => {
  return {
    chipText: color === "mint" ? "text-emerald-700" : "text-rose-700",
    titleText: "text-slate-900",
    descText: "text-slate-700",
    actionBg: "bg-slate-50",
    actionBorder:
      color === "mint" ? "border-emerald-200" : "border-rose-200",
  };
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

  // 향후: 지난 24시간 최고 단계는 서버/스토리지에서 받아와야 하지만,
  // 지금은 데모로 "현재 단계와 동일"하게 표시
  const highest24hLevel: 1 | 3 = cardLevel;

  const status = STATUS_CONFIG[cardLevel];
  const styles = getStylesForColor(status.color);
  const isEmergency = cardLevel === 3;

  return (
    <div className="h-full bg-slate-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-5 py-3 bg-white border-b border-slate-200 flex items-center">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-900 active:scale-95 transition min-w-[44px] min-h-[44px]"
          aria-label="뒤로가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M12.7 5.3a1 1 0 010 1.4L9.4 10l3.3 3.3a1 1 0 01-1.4 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.4 0z" />
          </svg>
        </button>
        <h1 className="ml-2 text-sm font-semibold text-slate-900 tracking-tight">
          오늘 우리 아이 상태
        </h1>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* STATUS CARD */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 px-5 pt-5 pb-5 space-y-4">
          {/* 1. 24시간 신호등 리포트 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
               건강 신호 리포트
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                  지금: {cardLevel === 1 ? "안정" : "응급"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                  24시간 최고: {highest24hLevel === 1 ? "안정" : "응급"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center w-full max-w-[260px] justify-between">
                <GaugeFace active={cardLevel === 1} icon="😊" variant="mint" />
                <div className="flex-1 h-px mx-2 bg-slate-100" />
                <GaugeFace active={false} icon="😐" variant="neutral" />
                <div className="flex-1 h-px mx-2 bg-slate-100" />
                <GaugeFace active={cardLevel === 3} icon="😫" variant="rose" />
              </div>
            </div>
          </div>

          {/* 2. 상태 해석 */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">
              상태 해석
            </span>
            <div>
              <p
                className={`
                  text-[15px] font-black leading-snug
                  ${styles.titleText}
                `}
              >
                {status.title}
              </p>
              <p
                className={`
                  mt-1 text-[13px] leading-relaxed
                  ${styles.descText}
                `}
              >
                {status.desc}
              </p>
            </div>
          </div>

          {/* 3. 지금 필요한 조치 */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">
              지금 필요한 조치
            </span>
            <div
              className={`
                rounded-2xl px-4 py-3 flex items-center gap-3
                ${styles.actionBg} border ${styles.actionBorder}
              `}
            >
              <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">
                {cardLevel === 1 ? "🏡" : "🚑"}
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {status.action}
              </p>
            </div>
          </div>
        </section>

        {/* EMERGENCY SECTION: 119 + 지도 */}
        {isEmergency && (
          <section
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="space-y-3"
          >
            {/* 119 바로 연결 버튼 */}
            <button
              type="button"
              autoFocus
              onClick={() => {
                window.location.href = "tel:119";
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 text-white text-sm font-semibold shadow-md active:scale-[0.97] transition min-h-[44px]"
              aria-label="119 긴급 전화 걸기"
            >
              <span className="text-lg">🚨</span>
              <span>119로 바로 전화하기</span>
            </button>

            {/* 소아응급실 지도 카드 */}
            <button
              type="button"
              onClick={() => {
                // 실제 서비스에서는 여기서 지도 화면 또는 외부 지도 앱으로 네비게이션
                // 예: onNavigate("map") 또는 window.open(지도URL)
              }}
              className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-sm active:scale-[0.98] transition text-left space-y-3"
              aria-label="가까운 소아응급실 지도 열기"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-base">
                    🗺️
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500">
                      소아응급실 위치
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      가까운 응급실 지도 열기
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">지도</span>
              </div>

              {/* 지도 느낌 나는 일러스트 영역 */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mt-1">
                {/* 도로/블록 패턴 */}
                <div className="absolute inset-0 opacity-80">
                  <div className="absolute left-0 right-0 top-1/3 h-6 bg-white/80 border-y border-slate-200" />
                  <div className="absolute left-0 right-0 top-2/3 h-6 bg-white/80 border-y border-slate-200" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-white/80 border-x border-slate-200" />
                  <div className="absolute top-0 bottom-0 left-2/3 w-6 bg-white/80 border-x border-slate-200" />
                </div>

                {/* 병원 마커 */}
                <div className="absolute left-[68%] top-[38%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-xs text-white shadow-md">
                    🏥
                  </div>
                  <div className="mt-1 text-[10px] text-rose-700 bg-white/95 rounded-full px-2 py-0.5 shadow-sm">
                    소아응급실
                  </div>
                </div>

                {/* 현재 위치 마커 */}
                <div className="absolute left-[30%] top-[70%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center shadow">
                    ●
                  </div>
                  <div className="mt-1 text-[10px] text-slate-700 bg-white/95 rounded-full px-2 py-0.5 shadow-sm">
                    현재 위치
                  </div>
                </div>

                {/* 경로 라인 */}
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
      gradient: "from-emerald-500 to-teal-600",
      glow: "from-emerald-400/40 to-teal-400/40",
    },
    rose: {
      gradient: "from-rose-500 to-pink-600",
      glow: "from-rose-400/40 to-pink-400/40",
    },
    neutral: {
      gradient: "from-sky-500 to-cyan-600",
      glow: "from-sky-400/40 to-cyan-400/40",
    },
  }[variant];

  return (
    <div className="relative flex items-center justify-center">
      {active && (
        <div
          className={`absolute -inset-0.5 bg-gradient-to-br ${config.glow} rounded-full blur-md opacity-40`}
        />
      )}
      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-200 ${
          active
            ? `w-9 h-9 bg-gradient-to-br ${config.gradient} text-white shadow-sm ring-2 ring-white scale-105`
            : `w-8 h-8 bg-slate-100 text-slate-300`
        }`}
      >
        <span className={active ? "text-[13px]" : "text-[11px] opacity-70"}>
          {icon}
        </span>
      </div>
    </div>
  );
};

export default TriageScreen;
