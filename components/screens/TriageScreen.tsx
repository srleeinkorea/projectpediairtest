// src/components/screens/TriageScreen.tsx
import React, { useState } from "react";
import { ScreenName, PatientData } from "../../types";

interface TriageScreenProps {
  onBack: () => void;
  patientData: PatientData;
  onNavigate: (screen: ScreenName) => void;
}

type RiskLevel = 1 | 2 | 3;

// 응급 레벨 계산
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

const STATUS_CONFIG: Record<
  RiskLevel,
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
  2: {
    title: "진료실(외래)에서 한 번 더 확인이 필요해요",
    desc: "최근 모니터링 결과상 주의가 필요한 변화가 관찰되고 있어요. 지금 바로 응급실로 갈 정도는 아니지만, 의료진이 직접 상태를 확인해 주면 안심이 될 수 있어요.",
    action:
      "가급적 빠른 시간 내에 외래 진료를 보시길 권해요. 혹시, 숨이 더 가빠지거나 입술·손끝이 파래지면, 지체하지 말고 119 혹은 응급실을 이용해 주세요.",
    color: "mint",
  },
  3: {
    title: "응급 상황이 의심돼요",
    desc: "저산소 상태가 계속 확인되고 있어, 의료진의 신속하고 즉각적인 전문 진료가 필요해요.",
    action: "119 또는 가까운 응급실 방문을 권고드려요.",
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
      <span className="text-[12px] font-semibold text-slate-800">{label}</span>
    </div>
  );
};

const TriageScreen: React.FC<TriageScreenProps> = ({
  onBack,
  patientData,
  onNavigate, // 시그니처만 유지
}) => {
  const rawLevel = getRiskLevel(patientData);
  const cardLevel: RiskLevel = rawLevel; // 이제 1/2/3 모두 카드에 반영

  const status = STATUS_CONFIG[cardLevel];
  const styles = getStylesForColor(status.color);
  const isEmergency = cardLevel === 3;

  const cardAccentClass =
    status.color === "mint"
      ? "border-emerald-100 shadow-[0_16px_32px_rgba(16,185,129,0.10)]"
      : "border-rose-100 shadow-[0_16px_32px_rgba(244,63,94,0.16)]";

  // 📞 병원 전화 연결용 하단 시트 상태
  const [phoneSheet, setPhoneSheet] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  const handleCallConfirm = () => {
    if (!phoneSheet) return;
    window.location.href = `tel:${phoneSheet.phone}`;
    setPhoneSheet(null);
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col font-sans max-w-md mx-auto relative">
      {/* HEADER – EMR과 동일 스타일, 클릭 시 뒤로가기 */}
      <header
        className="
          px-4 sm:px-5
          py-2.5 sm:py-3
          flex items-center justify-center
          bg-white/90 backdrop-blur-xl
          border-b border-white/40
          z-30 shrink-0 shadow-sm
        "
      >
        <button
          type="button"
          onClick={onBack}
          className="group hover:opacity-95 active:scale-[0.99] transition-all duration-200"
          aria-label="이전 화면으로 이동"
        >
          <div className="flex items-center gap-2.5 transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-95">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
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
            <div className="flex flex-col leading-tight">
              <span className="text-[17px] font-extrabold tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                V.Doc PEDI-AIR
              </span>
              <span className="text-[8px] text-slate-500">
                PEDIatric AI for Respiratory-care
              </span>
            </div>
          </div>
        </button>
      </header>

      {/* BODY */}
      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* 1. 24시간 요약 + 숫자 카드 */}
        <section
          className={`bg-white rounded-3xl px-5 pt-5 pb-5 space-y-5 border ${cardAccentClass}`}
        >
          {/* 지난 24시간 건강 신호 요약 */}
          <div className="space-y-3">
            <SectionHeader
              label="지난 24시간 건강 신호 요약"
              accent={status.color}
            />
            <div className="flex flex-col items-center justify-center pt-1 gap-3">
              {/* 얼굴 게이지 */}
              <div className="flex flex-col items-center w-full max-w-[280px] gap-1.5">
                <div className="flex items-center w-full justify-between">
                  <GaugeFace active={rawLevel === 1} icon="😊" variant="mint" />
                  <div className="flex-1 h-px mx-2 bg-slate-100" />
                  <GaugeFace
                    active={rawLevel === 2}
                    icon="😐"
                    variant="neutral"
                  />
                  <div className="flex-1 h-px mx-2 bg-slate-100" />
                  <GaugeFace active={rawLevel === 3} icon="😫" variant="rose" />
                </div>
                <div className="flex w-full justify-between text-[10px] text-slate-500">
                  <span className="w-1/3 text-left pl-1">안정</span>
                  <span className="w-1/3 text-center">주의</span>
                  <span className="w-1/3 text-right pr-1">위험</span>
                </div>
              </div>

              {/* 간단 Vital 미니 카드 */}
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

          {/* 상태 해석 */}
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

          {/* 보호자에게 권장되는 다음 행동 */}
          <div className="mt-1">
            <div
              className={`
                mt-1 rounded-2xl px-3.5 py-3.5 flex items-center gap-3.5
                ${styles.actionBg} border ${styles.actionBorder}
              `}
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-sm flex items-center justify-center text-xl">
                {cardLevel === 1 ? "🏡" : cardLevel === 2 ? "🏥" : "🚑"}
              </div>
              <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                {status.action}
              </p>
            </div>
          </div>
        </section>

        {/* 2. 응급 상황일 때만 119 + 응급실 리스트 */}
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

            {/* 가까운 소아응급실 리스트 */}
            <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
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

              {/* 병원 카드들 */}
              <div className="space-y-2.5">
                {/* 병원 1 – 강남성심 */}
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50/90 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                  onClick={() =>
                    setPhoneSheet({
                      name: "강남성심병원",
                      phone: "02-829-5000",
                    })
                  }
                >
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
                  <DonutGauge label="원활" used={18} total={22} tone="good" />
                </button>

                {/* 병원 2 – 신촌세브란스 */}
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50/90 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                  onClick={() =>
                    setPhoneSheet({
                      name: "신촌세브란스병원",
                      phone: "02-2228-5800",
                    })
                  }
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
                        <span className="font-semibold">혼잡 · 19 / 39</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        응급실소아
                        <span className="font-semibold">보통 · 2 / 8</span>
                      </span>
                    </div>
                  </div>
                  <DonutGauge label="보통" used={15} total={21} tone="mid" />
                </button>

                {/* 병원 3 – 건국대 */}
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50/90 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                  onClick={() =>
                    setPhoneSheet({
                      name: "건국대병원",
                      phone: "02-2030-5114",
                    })
                  }
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
                병상 정보는 중앙응급의료센터 기준이며 수 분 단위로 변경될 수
                있어요. 도착 전 병원에 전화로 한 번 더 확인해 주세요.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* 📞 전화 연결 확인 시트 (하단 모달) */}
      {phoneSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-4 pb-5 shadow-xl">
            <div className="mb-3">
              <p className="text-[14px] font-semibold text-slate-900">
                {phoneSheet.name} 응급실로 전화하시겠어요?
              </p>
              <p className="mt-1 text-[12px] text-slate-500 leading-snug">
                통화 후에도 아이 상태가 급격히 나빠지면{" "}
                <span className="font-semibold">119 신고</span>도 함께 고려해
                주세요.
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setPhoneSheet(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCallConfirm}
                className="flex-1 h-10 rounded-xl bg-sky-600 text-white text-[13px] font-semibold hover:bg-sky-700 active:scale-[0.98] transition"
              >
                전화 연결 ({phoneSheet.phone})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== 하위 컴포넌트들 =====

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
      // 🔧 주의 = 노란색 계열
      gradient: "from-amber-300 to-yellow-400",
      glow: "from-amber-200/60 to-yellow-200/60",
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
      <span className={`text-[12px] font-semibold ${style.text}`}>{value}</span>
      <span className="mt-0.5 text-[9px] text-slate-500">{style.helper}</span>
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
