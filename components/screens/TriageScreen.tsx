import React from "react";
import { ScreenName, PatientData } from "../../types";

/**
 * Props expected by the TriageScreen component. Consumers must
 * supply navigation callbacks as well as the current patient data.
 */
interface TriageScreenProps {
  onBack: () => void;
  patientData: PatientData;
  onNavigate: (screen: ScreenName) => void;
}

/**
 * Risk levels used internally to determine visual state. A value
 * of `1` means the patient is in a stable condition, `2` means
 * moderate risk and `3` indicates an emergency requiring immediate
 * attention. Only levels 1 and 3 are presented to the user.
 */
type RiskLevel = 1 | 2 | 3;

/**
 * Configuration for the display based on the patient risk. The keys
 * correspond to the card level shown in the UI. Keep this mapping
 * in sync with any additional levels you support.
 */
const STATUS_CONFIG: Record<
  1 | 3,
  {
    badge: string;
    title: string;
    desc: string;
    action: string;
    color: "mint" | "rose";
  }
> = {
  1: {
    badge: "RISK LEVEL 1",
    title: "상태 안정적",
    desc: "현재 수치는 정상 범위입니다.",
    action: "현재 관리 방법을 계속하세요.",
    color: "mint",
  },
  3: {
    badge: "RISK LEVEL 3",
    title: "즉시 대응이 필요해요",
    desc: "저산소 상태가 지속되고 있어요.",
    action: "119 또는 소아응급실로 이동하세요.",
    color: "rose",
  },
} as const;

/**
 * Utility for computing all Tailwind classes that vary based on the
 * status colour. Centralising this logic makes the render method
 * easier to read and reduces duplication across the component.
 */
const getStylesForColor = (color: "mint" | "rose") => {
  return {
    badgeBg: color === "mint" ? "bg-emerald-50" : "bg-rose-50",
    badgeText: color === "mint" ? "text-emerald-700" : "text-rose-700",
    titleText: color === "mint" ? "text-emerald-700" : "text-rose-700",
    actionBg: color === "mint" ? "bg-emerald-50/70" : "bg-rose-50/70",
    emojiHalo:
      color === "mint"
        ? "from-emerald-100/80 to-emerald-50/0"
        : "from-rose-100/80 to-rose-50/0",
  };
};

/**
 * Functional component responsible for rendering the triage
 * information for a given patient. It assesses the supplied
 * patientData to determine the appropriate risk level, selects
 * corresponding UI copy and colours, and conditionally renders
 * emergency actions.
 */
const TriageScreen: React.FC<TriageScreenProps> = ({
  onBack,
  patientData,
  onNavigate,
}) => {
  /**
   * Determine the patient's risk level based on measured values. A
   * more severe measurement outweighs a mild one. The thresholds
   * below were chosen to align with clinical guidance for oxygen
   * saturation (SpO2) and respiratory rate (RR).
   */
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

  // Compute the raw risk level using patient data and then map it to a
  // card level. Levels 1 and 2 are presented as the same card; level
  // 3 triggers emergency messaging.
  const rawLevel = getRiskLevel(patientData);
  const cardLevel: 1 | 3 = rawLevel === 3 ? 3 : 1;
  const status = STATUS_CONFIG[cardLevel];
  const styles = getStylesForColor(status.color);
  const isEmergency = cardLevel === 3;

  return (
    <div className="h-full bg-gradient-to-b from-sky-50 to-slate-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-5 py-3 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center">
        <button
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
          오늘의 상태 한눈에 보기
        </h1>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status card: shows the risk badge, gauge, description and suggested action */}
        <section className="bg-white rounded-[26px] shadow-sm border border-slate-100 px-6 pt-5 pb-6">
          {/* Risk Level Badge */}
          <div className="flex justify-center mb-4">
            <span
              className={`px-3 py-1 text-[11px] font-semibold rounded-full ${styles.badgeBg} ${styles.badgeText} tracking-wide`}
            >
              {status.badge}
            </span>
          </div>

          {/* Gauge: three faces representing stable, neutral and emergency states */}
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center w-full max-w-[260px] justify-between">
              <GaugeFace active={cardLevel === 1} icon="😊" variant="mint" />
              <div className="flex-1 h-px mx-2 bg-slate-100" />
              {/* Level 2 face is always inactive for this demo */}
              <GaugeFace active={false} icon="😐" variant="neutral" />
              <div className="flex-1 h-px mx-2 bg-slate-100" />
              <GaugeFace active={cardLevel === 3} icon="😫" variant="rose" />
            </div>
          </div>

          {/* Title & description */}
          <div className="text-center mb-5">
            <h2
              className={`text-lg font-extrabold ${styles.titleText} tracking-tight`}
            >
              {status.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-snug">
              {status.desc}
            </p>
          </div>

          {/* Suggested action card */}
          <div
            className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${styles.actionBg}`}
          >
            <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">
              {cardLevel === 1 ? "🏡" : "🚑"}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500">
                지금 이렇게 해주세요
              </span>
              <span className="text-sm font-semibold text-slate-900 leading-tight">
                {status.action}
              </span>
            </div>
          </div>
        </section>

        {/* Emergency section: appears only when the risk level is 3 */}
        {isEmergency && (
          <section
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="space-y-3"
          >
            <button
              autoFocus
              onClick={() => {
                window.location.href = "tel:119";
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-white text-sm font-semibold shadow-md active:scale-[0.97] transition min-h-[44px]"
              aria-label="119 긴급 전화 걸기"
              style={{ minWidth: "44px", minHeight: "44px" }}
            >
              <span className="text-lg">🚨</span>
              <span>119로 바로 전화하기</span>
            </button>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-rose-500">
                    응급실 이동 권장
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    가까운 소아응급실 위치 보기
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">데모 화면</span>
              </div>

              <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${styles.emojiHalo}`}
                />
                {/* Hospital marker */}
                <div className="absolute left-[62%] top-[38%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-xs text-white shadow-md">
                    🏥
                  </div>
                  <div className="mt-1 text-[10px] text-rose-700 bg-white/90 rounded-full px-2 py-0.5 shadow-sm">
                    소아응급실
                  </div>
                </div>
                {/* Current location marker */}
                <div className="absolute left-[30%] top-[72%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center shadow">
                    ●
                  </div>
                  <div className="mt-1 text-[10px] text-slate-700 bg-white/90 rounded-full px-2 py-0.5 shadow-sm">
                    현재 위치(예시)
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  alert(
                    "데모 모드입니다. 실제 서비스에서는 지도 앱으로 연결됩니다."
                  )
                }
                className="w-full text-center text-xs font-semibold text-slate-800 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] transition min-h-[44px]"
              >
                지도 앱에서 길 안내 보기
              </button>
            </div>
          </section>
        )}

        {/* AI chatbot button */}
        <button
          onClick={() => onNavigate("emr")}
          className="w-full bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-semibold shadow-md active:scale-[0.97] transition min-h-[44px]"
        >
          AI에게 증상 물어보기
        </button>
      </div>
    </div>
  );
};

interface GaugeFaceProps {
  active: boolean;
  icon: string;
  variant: "mint" | "rose" | "neutral";
}

/**
 * Renders one of the faces in the triage gauge. Active faces use a gradient
 * fill and a soft glow to blend naturally with the overall app aesthetic.
 */
const GaugeFace: React.FC<GaugeFaceProps> = ({ active, icon, variant }) => {
  // Define gradient and glow colours for each variant. Neutral uses a blue tone
  // even when inactive to unify with the app colour palette.
  const config = {
    mint: {
      gradient: "from-emerald-400 to-teal-500",
      glow: "from-emerald-400/40 to-teal-400/40",
    },
    rose: {
      gradient: "from-rose-400 to-pink-500",
      glow: "from-rose-400/40 to-pink-400/40",
    },
    neutral: {
      gradient: "from-sky-400 to-cyan-500",
      glow: "from-sky-400/40 to-cyan-400/40",
    },
  }[variant];

  return (
    <div className="relative flex items-center justify-center">
      {active && (
        <div
          className={`absolute -inset-0.5 bg-gradient-to-br ${config.glow} rounded-full blur-md opacity-50`}
        />
      )}
      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-200 ${
          active
            ? `w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br ${config.gradient} text-white shadow-sm ring-2 ring-white scale-105`
            : `w-8 h-8 md:w-9 md:h-9 bg-slate-100 text-slate-300`
        }`}
      >
        <span className={active ? "text-[14px]" : "text-[11px] opacity-70"}>
          {icon}
        </span>
      </div>
    </div>
  );
};

export default TriageScreen; 