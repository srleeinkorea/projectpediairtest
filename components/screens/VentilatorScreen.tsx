import React from "react";
import { ScreenName, PatientData } from "../../types";

interface VentilatorScreenProps {
  onBack: () => void;
  patientData: PatientData;
}

type GaugeStatus = "danger" | "warning" | "normal";

const VentilatorScreen: React.FC<VentilatorScreenProps> = ({
  onBack,
  patientData,
}) => {
  const peakRatio =
    patientData.p_peak_threshold > 0
      ? patientData.p_peak_measured / patientData.p_peak_threshold
      : 0;

  const peakStatus: GaugeStatus =
    peakRatio >= 1.1 ? "danger" : peakRatio >= 0.9 ? "warning" : "normal";

  const driveStatus: GaugeStatus =
    patientData.p_drive_measured >= 18
      ? "danger"
      : patientData.p_drive_measured >= 15
        ? "warning"
        : "normal";

  const rrStatus: GaugeStatus =
    patientData.rr >= 40
      ? "danger"
      : patientData.rr >= 30
        ? "warning"
        : "normal";

  const vtRatio =
    patientData.vtidal_target > 0
      ? patientData.vtidal_measured / patientData.vtidal_target
      : 1;

  const vtStatus: GaugeStatus =
    vtRatio >= 1.2 || vtRatio <= 0.8 ? "warning" : "normal";

  const hasDanger =
    peakStatus === "danger" ||
    driveStatus === "danger" ||
    rrStatus === "danger";
  const hasWarning =
    !hasDanger &&
    (peakStatus === "warning" ||
      driveStatus === "warning" ||
      rrStatus === "warning" ||
      vtStatus === "warning");

  const overallStatus: GaugeStatus = hasDanger
    ? "danger"
    : hasWarning
      ? "warning"
      : "normal";

  const overallConfig = {
    danger: {
      title: "응급 패턴 의심 – 즉시 평가 필요",
      desc: "압력/호흡수 이상이 동반되어 있어 기도 폐색 또는 폐 순응도 저하에 대한 긴급 평가가 필요합니다.",
      badge: "고위험",
      badgeClass:
        "bg-rose-50 text-rose-700 border-rose-100 shadow-[0_0_0_1px_rgba(248,113,113,0.2)]",
      border: "border-rose-500",
    },
    warning: {
      title: "주의 패턴 – 세팅 및 기도 상태 재평가",
      desc: "일부 지표가 경계 범위에 있어, 분비물·튜브 위치·세팅값을 함께 검토하는 것이 좋습니다.",
      badge: "주의",
      badgeClass:
        "bg-amber-50 text-amber-700 border-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]",
      border: "border-amber-400",
    },
    normal: {
      title: "현재 기계-환자 상호작용 양호",
      desc: "주요 압력·호흡수·일회 호흡량이 모두 목표 범위 안에 있습니다. 현재 세팅 유지하며 경과 관찰하면 됩니다.",
      badge: "안정",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]",
      border: "border-emerald-500",
    },
  }[overallStatus];

  // 패턴 해석 (기도 저항 vs 폐 순응도)
  const mechanism = (() => {
    if (peakStatus !== "normal" && driveStatus === "normal") {
      return {
        title: "기도 저항 증가 패턴",
        subtitle: "튜브/기도 쪽 문제 가능성이 더 높은 형태입니다.",
        bullets: [
          "P-Peak는 상승했지만 P-drive는 상대적으로 정상 범위입니다.",
          "분비물 증가, 튜브 꺾임·눌림, 커프 압력 문제 등을 우선 확인하는 것이 좋습니다.",
        ],
        tone: "airway" as const,
      };
    }
    if (driveStatus !== "normal") {
      return {
        title: "폐 순응도 감소 패턴",
        subtitle: "폐 자체의 경직·부종 등 폐 실질 문제 가능성이 있습니다.",
        bullets: [
          "P-drive가 상승되어 있으며, 호흡기 세팅 변경에도 압력 감소가 어렵다면 영상/혈가스 평가를 고려해야 할 수 있습니다.",
          "체위 변경, PEEP 조정, 수액/부종 상태 등을 함께 평가합니다.",
        ],
        tone: "lung" as const,
      };
    }
    return {
      title: "경계 범위 – 추세 관찰 필요",
      subtitle: "현재는 명확한 한 방향의 패턴이라기보다는 경계선 수치입니다.",
      bullets: [
        "최근 몇 시간 동안의 P-Peak / Vt / RR 변화 추세를 함께 봐야 합니다.",
        "임상 증상(흉부 함몰, 비익 호흡, 산소 요구량 변화)과 함께 종합적으로 판단합니다.",
      ],
      tone: "neutral" as const,
    };
  })();

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      {/* 헤더 */}
      <header className="px-3 py-1.5 flex items-center justify-start bg-white/80 backdrop-blur-xl border-b border-white/30 z-20 shrink-0 shadow-sm">
        <button
          onClick={onBack}
          className="group hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center gap-2"
          aria-label="이전 화면으로 이동"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12.75 4.75L7.5 10l5.25 5.25"
              />
            </svg>
          </div>
          <div className="flex flex-col leading-tight items-start">
            <span className="text-[11px] font-extrabold tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              V.Doc PEDI-AIR
            </span>
            <span className="text-[9px] text-slate-500">
              Ventilator Mechanics Insight
            </span>
          </div>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-5 pb-24 space-y-6 max-w-md mx-auto w-full">
        {/* 전체 요약 카드 */}
        <section
          className={`relative rounded-3xl bg-white shadow-sm border-l-4 ${overallConfig.border} px-5 py-4 overflow-hidden`}
        >
          <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br from-slate-50 to-sky-50" />
          <div className="relative flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 mt-0.5">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${overallConfig.badgeClass}`}
              >
                <span>AI 분석 요약</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                P-Peak / P-drive / RR
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[15px] text-slate-900 leading-snug">
                {overallConfig.title}
              </h3>
              <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                {overallConfig.desc}
              </p>
            </div>
          </div>
        </section>

        {/* 실시간 지표 – 그리드 */}
        <section className="space-y-2">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.16em] ml-1">
            실시간 기계-환자 지표
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <GaugeCard
              title="P-Peak"
              value={patientData.p_peak_measured}
              unit="cmH₂O"
              status={peakStatus}
              detail={`임계치 ${patientData.p_peak_threshold} 기준`}
            />
            <GaugeCard
              title="P-drive"
              value={patientData.p_drive_measured}
              unit="cmH₂O"
              status={driveStatus}
              detail="> 15이면 폐 순응도 감소 의심"
            />
            <GaugeCard
              title="Vt (측정)"
              value={patientData.vtidal_measured}
              unit="mL"
              status={vtStatus}
              detail={`목표 ${patientData.vtidal_target} mL 대비 ${
                (vtRatio * 100).toFixed(0) as string
              }%`}
            />
            <GaugeCard
              title="RR"
              value={patientData.rr}
              unit="회/분"
              status={rrStatus}
              detail="40 이상 시 과호흡/보조호흡 증가"
            />
          </div>
        </section>

        {/* 패턴 해석 – 의료진용 요약 */}
        <section className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.16em]">
                패턴 해석 (임상의용)
              </p>
              <h3 className="mt-1 text-[14px] font-bold text-slate-900 leading-snug">
                {mechanism.title}
              </h3>
              <p className="mt-1 text-[12px] text-slate-600">
                {mechanism.subtitle}
              </p>
            </div>
          </div>

          <ul className="mt-2 space-y-1.5">
            {mechanism.bullets.map((b, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 text-[12px] text-slate-700 leading-relaxed"
              >
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 위험 시 즉시 체크리스트 */}
        {(overallStatus === "danger" || overallStatus === "warning") && (
          <section className="bg-rose-50/80 rounded-3xl px-5 py-4 border border-rose-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-rose-500 flex items-center justify-center text-white text-sm shadow-md">
                !
              </div>
              <div>
                <p className="text-[11px] font-bold text-rose-700 uppercase tracking-[0.16em]">
                  즉시 확인 체크리스트
                </p>
                <p className="text-[12px] text-rose-800 mt-0.5">
                  현장 의료진이 바로 확인하면 좋은 기본 항목들입니다.
                </p>
              </div>
            </div>

            <ul className="mt-1 space-y-1.5 text-[12px] text-rose-900">
              <li>• 튜브 꺾임·눌림·탈출 여부 및 회로 연결 상태 확인</li>
              <li>• 분비물 증가 시 석션 시행 후 P-Peak 재측정</li>
              <li>• 최근 세팅 변경(PEEP, Vt, 모드 변경 등) 전후 수치 비교</li>
              <li>• 청색증, 흉부 함몰, 의식 변화 등 임상 증상 동반 여부</li>
            </ul>

            <button
              type="button"
              className="mt-2 w-full bg-white text-rose-700 border border-rose-200 rounded-2xl py-2.5 text-[12px] font-semibold active:scale-[0.98] transition shadow-sm"
            >
              호흡기 회로·튜브 점검 가이드 열기
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

const GaugeCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  status: GaugeStatus;
  detail: string;
}> = ({ title, value, unit, status, detail }) => {
  const statusStyles: Record<GaugeStatus, string> = {
    danger:
      "text-rose-700 bg-white shadow-sm shadow-rose-100 ring-1 ring-rose-100",
    warning:
      "text-amber-700 bg-white shadow-sm shadow-amber-100 ring-1 ring-amber-100",
    normal:
      "text-slate-800 bg-white shadow-sm shadow-slate-100 border border-slate-50",
  };

  const dotColor =
    status === "danger"
      ? "bg-rose-500"
      : status === "warning"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div
      className={`p-4 rounded-3xl flex flex-col justify-between h-32 ${statusStyles[status]}`}
    >
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-bold uppercase text-slate-400">
          {title}
        </p>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      </div>
      <div>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-[11px] font-semibold ml-1 opacity-60">
          {unit}
        </span>
      </div>
      <div className="text-[11px] font-medium text-slate-400 truncate">
        {detail}
      </div>
    </div>
  );
};

export default VentilatorScreen;
