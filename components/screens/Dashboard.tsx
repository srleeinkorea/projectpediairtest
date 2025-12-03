import React, { useState, useEffect } from "react";
import { ScreenName, PatientData } from "../../types";

interface DashboardProps {
  onNavigate: (screen: ScreenName) => void;
  patientData: PatientData;
  onToggleStatus: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  patientData,
  onToggleStatus,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "오후" : "오전";
      const displayHours = hours % 12 || 12;
      setCurrentTime(`${period} ${displayHours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 간단 트리아지 로직
  const getRiskLevel = (data: PatientData) => {
    if (
      data.spo2 < 90 ||
      data.rr > 40 ||
      data.p_peak_measured > data.p_peak_threshold
    )
      return "red";
    if (data.spo2 < 95 || data.rr > 30) return "yellow";
    return "blue";
  };

  const riskLevel = getRiskLevel(patientData);

  const statusConfig = {
    red: {
      gradient: "from-rose-50 to-rose-100",
      glow: "from-rose-300/40 to-pink-300/40",
      color: "rose" as const,
      text: "text-rose-700",
      indicatorBg: "bg-rose-50",
      label: "즉시 대응 필요",
      desc: "위험 징후가 감지되었습니다.",
    },
    yellow: {
      gradient: "from-amber-50 to-amber-100",
      glow: "from-amber-300/40 to-orange-300/40",
      color: "amber" as const,
      text: "text-amber-700",
      indicatorBg: "bg-amber-50",
      label: "주의 관찰 필요",
      desc: "수치가 다소 불안정합니다.",
    },
    blue: {
      gradient: "from-emerald-50 to-emerald-100",
      glow: "from-emerald-300/40 to-teal-300/40",
      color: "emerald" as const,
      text: "text-emerald-700",
      indicatorBg: "bg-emerald-50",
      label: "상태 안정적",
      desc: "현재 수치는 전반적으로 안정적인 상태입니다.",
    },
  } as const;

  const currentStatus = statusConfig[riskLevel];
  const isEmergency = riskLevel === "red";

  return (
    <div className="h-full bg-slate-50 font-sans flex flex-col overflow-hidden text-slate-800">
      {/* HEADER */}
      <header className="px-6 py-3 flex items-center justify-between shrink-0 h-16 bg-white border-b border-slate-100">
        <button
          onClick={onToggleStatus}
          className="flex flex-col items-start group"
        >
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5 group-hover:text-indigo-500 transition-colors">
            Pediatric AI for Respiratory Care
          </span>
          <span className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center">
            PEDI-AIR
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1" />
          </span>
        </button>
        <div className="text-xs font-medium text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
          {currentTime}
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-5 flex flex-col">
        {/* 1. 실시간 위험도 카드 */}
        <section className="shrink-0">
          <button
            onClick={() => onNavigate("triage")}
            className={`
              w-full relative overflow-hidden rounded-3xl p-5 flex flex-row items-center justify-between
              transition-all active:scale-[0.99] group bg-gradient-to-br ${currentStatus.gradient}
            `}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentStatus.glow} opacity-40 pointer-events-none`}
            />
            <BreathLines color={breathColors[currentStatus.color]} />

            {/* LEFT: 텍스트 */}
            <div className="text-left relative z-10 max-w-[70%]">
              <div
                className={`
                  inline-flex items-center px-2.5 py-1 rounded-lg text-[11px]
                  font-bold mb-2 ${currentStatus.indicatorBg} ${currentStatus.text}
                `}
              >
                {isEmergency
                  ? "EMERGENCY"
                  : riskLevel === "yellow"
                  ? "WARNING"
                  : "STABLE"}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1 leading-snug">
                {currentStatus.label}
              </h2>
              <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                {currentStatus.desc}
              </p>
            </div>

            {/* RIGHT: 신호등 얼굴 */}
            <div className="flex items-center space-x-1.5 bg-white/70 backdrop-blur-md px-2 py-2 rounded-2xl relative z-10">
              <CuteFaceMini
                active={riskLevel === "blue"}
                color="emerald"
                face="happy"
              />
              <CuteFaceMini
                active={riskLevel === "yellow"}
                color="amber"
                face="neutral"
              />
              <CuteFaceMini
                active={riskLevel === "red"}
                color="rose"
                face="sad"
                pulse={isEmergency}
              />
            </div>
          </button>
        </section>

        {/* 2. 긴급 조치 (RED일 때만) */}
        {isEmergency && (
          <section className="shrink-0">
            <div className="bg-rose-500 rounded-3xl shadow-lg shadow-rose-200 overflow-hidden relative text-white">
              <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping mr-2" />
                    긴급 조치 가이드
                  </h3>
                  <span className="text-[11px] font-bold bg-white/20 px-2 py-1 rounded-lg">
                    고위험 상태
                  </span>
                </div>

                <div className="space-y-2.5 mb-4">
                  <CheckItem text="환아 고개를 살짝 젖혀 기도를 확보해 주세요." light />
                  <CheckItem text="즉시 석션(Suction)을 시행해 주세요." light />
                  <CheckItem text="튜브 연결부와 꼬임, 이탈 여부를 확인해 주세요." light />
                </div>

                <button
                  onClick={() => onNavigate("ventilator")}
                  className="w-full bg-white text-rose-600 py-3 rounded-xl font-bold text-[13px] shadow-md active:scale-95 transition-all"
                >
                  상세 대응 매뉴얼 보기
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 3. 주요 수치 요약 */}
        <section className="flex-1 flex flex-col justify-center minHeight-[140px]">
          <SectionHeader title="주요 수치 (Vital Signs)" />
          <div className="grid grid-cols-2 gap-4">
            <VitalCard
              type="pressure"
              label="P-Peak"
              value={patientData.p_peak_measured}
              unit="cmH₂O"
              isDanger={
                patientData.p_peak_measured > patientData.p_peak_threshold
              }
              desc={
                patientData.p_peak_measured >
                patientData.p_peak_threshold
                  ? "기도 저항 상승"
                  : "허용 범위 내"
              }
              onClick={() => onNavigate("ventilator")}
            />
            <VitalCard
              type="spo2"
              label="SpO₂"
              value={patientData.spo2}
              unit="%"
              isDanger={patientData.spo2 < 90}
              desc={
                patientData.spo2 < 90 ? "저산소증 위험" : "허용 범위 내"
              }
              onClick={() => onNavigate("ventilator")}
            />
          </div>
        </section>

        {/* 4. 스마트 케어 엔트리 */}
        <section className="shrink-0">
          <SectionHeader title="스마트 케어" />
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate("emr")}
              className="bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-600 rounded-[24px] p-5 shadow-lg shadow-indigo-200/40 text-left relative overflow-hidden group active:scale-[0.98] transition-all h-32"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -mr-5 -mt-5" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">
                    AI 상담
                  </h3>
                  <p className="text-indigo-100 text-xs font-medium opacity-90">
                    증상 질문하기
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate("pro")}
              className="bg-gradient-to-br from-white via-slate-50 to-white rounded-[24px] p-5 shadow-md shadow-slate-200/50 text-left border border-slate-100 group active:scale-[0.98] transition-all h-32"
            >
              <div className="flex flex-col justify-between h-full">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5V3h4v2M3 12h18M9 16h6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg tracking-tight">
                    상태 기록
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    체온, 배변 등 기록하기
                  </p>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- 보조 컴포넌트 ---

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[11px] font-bold text-slate-400 mb-3 ml-1 uppercase tracking-wider">
    {title}
  </h3>
);

const CuteFaceMini: React.FC<{
  active: boolean;
  color: "emerald" | "amber" | "rose";
  face: "happy" | "neutral" | "sad";
  pulse?: boolean;
}> = ({ active, color, face, pulse }) => {
  const config = {
    emerald: {
      gradient: "from-emerald-400 to-teal-500",
      glow: "from-emerald-400/40 to-teal-400/40",
    },
    amber: {
      gradient: "from-amber-400 to-orange-500",
      glow: "from-amber-400/40 to-orange-400/40",
    },
    rose: {
      gradient: "from-rose-400 to-pink-500",
      glow: "from-rose-400/40 to-pink-400/40",
    },
  }[color];

  return (
    <div className="relative w-8 h-8 flex items-center justify-center transition-all duration-300">
      {active && (
        <div
          className={`absolute -inset-0.5 bg-gradient-to-br ${config.glow} rounded-full blur-sm opacity-50`}
        />
      )}
      <div
        className={`relative w-full h-full rounded-full flex items-center justify-center ${
          active
            ? `bg-gradient-to-br ${config.gradient} text-white shadow-sm scale-110 ${
                pulse && color === "rose" ? "animate-bounce" : ""
              }`
            : "bg-slate-200 text-slate-300 opacity-30"
        }`}
      >
        <span className="text-sm leading-none pb-0.5">
          {face === "happy" && "😊"}
          {face === "neutral" && "😐"}
          {face === "sad" && "😫"}
        </span>
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ text: string; light?: boolean }> = ({
  text,
  light,
}) => (
  <div
    className={`flex items-center space-x-3 p-3 rounded-xl ${
      light ? "bg-white/10" : "bg-rose-50"
    }`}
  >
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 w-5 h-5 ${
        light ? "bg-white text-rose-600" : "bg-rose-100 text-rose-600"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3.5 w-3.5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <span
      className={`text-[13px] font-semibold leading-snug ${
        light ? "text-white" : "text-slate-900"
      }`}
    >
      {text}
    </span>
  </div>
);

const VitalCard: React.FC<{
  type: "pressure" | "spo2";
  label: string;
  value: number;
  unit: string;
  isDanger: boolean;
  desc: string;
  onClick?: () => void;
}> = ({ type, label, value, unit, isDanger, desc, onClick }) => {
  const PressureIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.88H7.01L7 20a5 5 0 0 0 10 0l-.01-.62h-.03a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 14.5 2 2.5 2.5 0 0 1 12 4.5v.17a2.5 2.5 0 0 1-2.5-2.67z" />
      <path d="M12 2v20" />
    </svg>
  );
  const SpO2Icon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  const Icon = type === "pressure" ? PressureIcon : SpO2Icon;
  const accentColor = isDanger ? "rose" : type === "pressure" ? "sky" : "emerald";

  const colorClasses: any = {
    rose: {
      iconBg: "bg-rose-50 text-rose-500",
      border: "border-rose-100",
      badge: "bg-rose-50 text-rose-600",
    },
    sky: {
      iconBg: "bg-sky-50 text-sky-500",
      border: "border-slate-100",
      badge: "bg-slate-100 text-slate-500",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-500",
      border: "border-slate-100",
      badge: "bg-slate-100 text-slate-500",
    },
  };
  const theme = colorClasses[accentColor];

  return (
    <button
      onClick={onClick}
      className={`
        bg-white p-5 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
        border ${theme.border} relative overflow-hidden group
        hover:shadow-md transition-all text-left flex flex-col justify-between h-full
      `}
    >
      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.04] transform rotate-12 group-hover:scale-110 transition-transform duration-500 ${
          isDanger ? "text-rose-500" : "text-slate-800"
        }`}
      >
        <Icon />
      </div>

      <div className="flex items-center space-x-2.5 mb-2 relative z-10">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center p-1.5 ${theme.iconBg}`}
        >
          <Icon />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        {isDanger && (
          <span className="absolute right-0 top-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </div>

      <div className="relative z-10 mt-1">
        <span
          className={`text-3xl font-bold tracking-tight ${
            isDanger ? "text-rose-500" : "text-slate-900"
          }`}
        >
          {value}
        </span>
        <span className="text-sm font-semibold text-slate-400 ml-1.5 opacity-70">
          {unit}
        </span>
      </div>

      <div
        className={`relative z-10 mt-3 self-start px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.badge}`}
      >
        {desc}
      </div>
    </button>
  );
};

const breathColors: Record<"rose" | "amber" | "emerald", string> = {
  rose: "#f43f5e",
  amber: "#f59e0b",
  emerald: "#10b981",
};

const BreathLines: React.FC<{ color: string }> = ({ color }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 120 60"
    preserveAspectRatio="none"
  >
    <path
      d="M0 40 C 30 10 90 10 120 40"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeOpacity={0.15}
    />
    <path
      d="M0 50 C 30 20 90 20 120 50"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeOpacity={0.15}
    />
  </svg>
);

export default Dashboard;
