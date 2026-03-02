import React from "react";
import { PatientData, ProData } from "../../types";

interface ReportScreenProps {
  patientData: PatientData;
  childName?: string;
  proData: ProData;
  onBack: () => void;
}

const line = (label: string, value?: string) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <div className="text-sm font-semibold text-slate-700">{label}</div>
    <div className="text-sm text-slate-900 text-right whitespace-pre-wrap">
      {value && value.trim().length > 0 ? value : "-"}
    </div>
  </div>
);

const ReportScreen: React.FC<ReportScreenProps> = ({
  patientData,
  childName,
  proData,
  onBack,
}) => {
  const name = childName || patientData.name;
  const recordedAt = proData.recordedAt
    ? new Date(proData.recordedAt).toLocaleString("ko-KR")
    : "-";

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <header className="px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-white/40 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          ← 돌아가기
        </button>
        <div className="text-sm font-bold text-slate-900">PRO 리포트</div>
        <div className="w-16" />
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-xs font-semibold text-slate-500">대상</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            {name} ({patientData.age}세)
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {patientData.emrDiagnosis}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            기록 시각: {recordedAt}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-sm font-bold text-slate-900 mb-2">
            보호자 입력 요약
          </div>
          <div className="divide-y divide-slate-100">
            {line("체온", proData.temperature)}
            {line("석션 횟수", proData.suctionCount)}
            {line("배변/설사", proData.stool)}
            {line("추가 메모", proData.note)}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-sm font-bold text-slate-900 mb-2">
            현재 모니터링 수치(참고)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                SpO₂
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {patientData.spo2}%
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                호흡수(RR)
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {patientData.rr}
              </div>
            </div>
          </div>

          <div className="text-[12px] text-slate-600 mt-3 leading-relaxed">
            이 리포트는 보호자 입력과 현재 표시된 모니터링 수치를 보기 좋게 묶은
            데모 화면입니다. 임상 의사결정(진단/치료)을 대체하지 않습니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
