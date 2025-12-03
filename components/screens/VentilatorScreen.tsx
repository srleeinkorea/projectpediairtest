
import React, { useState } from 'react';
import { ScreenName, PatientData } from '../../types';

interface VentilatorScreenProps {
  onBack: () => void;
  patientData: PatientData;
}

// 전문 용어 설명 데이터베이스
const METRIC_INFO = {
  ppeak: {
    label: "최고 흡기 압력 (P-Peak)",
    simple: "폐에 공기를 넣을 때 걸리는 가장 강한 압력이에요.",
    analogy: "빨대(기도)가 좁아지거나 풍선(폐)이 빵빵하면 압력이 높아져요.",
    pro: "PIP (Peak Inspiratory Pressure). 기도 저항(Airway Resistance)과 폐 유순도(Compliance)를 반영합니다. 급격한 상승은 기침, 분비물, 튜브 꼬임을 시사합니다.",
    action: "설정된 알람 범위(Limit)를 넘지 않는지 확인해주세요."
  },
  vtidal: {
    label: "일회 환기량 (V.Tidal)",
    simple: "한 번 숨 쉴 때 아이가 마시는 공기의 양이에요.",
    analogy: "풍선(폐)에 들어가는 공기의 크기라고 생각하면 돼요.",
    pro: "Tidal Volume (Vte). 환자의 실제 환기 효율을 나타냅니다. 설정값(Target) 대비 ±10-15% 범위를 유지하는 것이 이상적입니다. 급격한 저하는 Leak(새는 공기)를 의심해야 합니다.",
    action: "너무 적으면 숨이 차고, 너무 많으면 폐에 무리가 갈 수 있어요."
  },
  rr: {
    label: "호흡수 (RR)",
    simple: "1분 동안 숨을 쉬는 횟수예요.",
    analogy: "아이가 얼마나 바쁘게 숨을 쉬는지 보여줘요.",
    pro: "Respiratory Rate. 기계 설정 횟수(Set rate)와 환자의 자발 호흡(Patient trigger)이 합쳐진 총 횟수입니다. 빈호흡(Tachypnea)은 호흡 곤란의 초기 징후일 수 있습니다.",
    action: "아이가 편안해 보이는지, 가슴이 너무 빠르게 뛰지 않는지 봐주세요."
  },
  pdrive: {
    label: "구동 압력 (P-Drive)",
    simple: "폐를 부풀리기 위해 실제로 가해지는 힘의 크기예요.",
    analogy: "풍선을 불기 위해 힘을 얼마나 줬는지를 의미해요.",
    pro: "Driving Pressure = P-Plateau - PEEP (혹은 P-Peak - PEEP in PCV). 폐 손상(VILI) 예방을 위한 핵심 지표입니다. 수치가 낮을수록 폐 보호에 유리합니다.",
    action: "이 수치가 급격히 오르면 폐가 뻣뻣해졌다는 신호일 수 있어요."
  }
};

const VentilatorScreen: React.FC<VentilatorScreenProps> = ({ onBack, patientData }) => {
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof METRIC_INFO | null>(null);

  const isHighPressure = patientData.p_peak_measured > patientData.p_peak_threshold;
  const isLowVolume = patientData.vtidal_measured < patientData.vtidal_target * 0.8;
  const isFastBreathing = patientData.rr > 40;

  return (
    <div className="h-full bg-slate-50 flex flex-col relative font-sans">
      {/* HEADER */}
      <header className="px-4 py-3 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center shrink-0 sticky top-0 z-20">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="ml-2">
            <h1 className="text-base font-bold text-slate-800 leading-none">인공호흡기 모니터링</h1>
            <span className="text-[10px] text-slate-400 font-medium">Ventilator Care Status</span>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
        
        {/* 1. 종합 상태 요약 (부모님용) */}
        <section>
            <div className={`p-5 rounded-[24px] shadow-lg border relative overflow-hidden transition-all ${isHighPressure ? 'bg-white border-rose-100 shadow-rose-100' : 'bg-white border-emerald-100 shadow-emerald-100'}`}>
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isHighPressure ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                
                <div className="flex items-start justify-between pl-3">
                    <div>
                        <h2 className={`text-lg font-extrabold tracking-tight mb-1 ${isHighPressure ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isHighPressure ? '압력이 높아요 (Check)' : '호흡이 편안해요 (Stable)'}
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {isHighPressure 
                                ? '기계가 공기를 넣을 때 힘이 많이 들어요.\n튜브가 꺾였거나 가래가 있는지 봐주세요.' 
                                : '설정된 범위 안에서 안정적으로 숨쉬고 있어요.\n현재 상태를 유지해주세요.'}
                        </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${isHighPressure ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                        {isHighPressure ? '🚨' : '😮‍💨'}
                    </div>
                </div>
            </div>
        </section>

        {/* 2. 전문 데이터 그리드 (전문의/상세용) */}
        <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">실시간 데이터 분석</h3>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">PCV Mode</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
                {/* P-Peak Card */}
                <DetailCard 
                    metricKey="ppeak"
                    title="최고 흡기 압력 (P-Peak)"
                    value={patientData.p_peak_measured}
                    unit="cmH₂O"
                    targetValue={patientData.p_peak_threshold}
                    targetLabel="Limit"
                    status={isHighPressure ? 'danger' : 'normal'}
                    onClickInfo={() => setSelectedMetric('ppeak')}
                />

                {/* V.Tidal Card */}
                <DetailCard 
                    metricKey="vtidal"
                    title="일회 환기량 (V.Tidal)"
                    value={patientData.vtidal_measured}
                    unit="mL"
                    targetValue={patientData.vtidal_target}
                    targetLabel="Target"
                    status={isLowVolume ? 'warning' : 'normal'}
                    onClickInfo={() => setSelectedMetric('vtidal')}
                />

                {/* RR Card */}
                <DetailCard 
                    metricKey="rr"
                    title="총 호흡수 (RR)"
                    value={patientData.rr}
                    unit="회/분"
                    targetValue={patientData.rate_setting}
                    targetLabel="Set Rate"
                    subValue={patientData.patient_rate}
                    subLabel="자발"
                    status={isFastBreathing ? 'danger' : 'normal'}
                    onClickInfo={() => setSelectedMetric('rr')}
                />

                 {/* P-Drive Card */}
                 <DetailCard 
                    metricKey="pdrive"
                    title="구동 압력 (P-Drive)"
                    value={patientData.p_drive_measured}
                    unit="cmH₂O"
                    targetValue={null}
                    status={patientData.p_drive_measured > 15 ? 'warning' : 'normal'}
                    onClickInfo={() => setSelectedMetric('pdrive')}
                />
            </div>
        </section>
      </div>

      {/* INFO MODAL (Bottom Sheet Style) */}
      {selectedMetric && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={() => setSelectedMetric(null)}
            ></div>
            
            {/* Content */}
            <div className="bg-white w-full max-w-md m-0 sm:m-4 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl pointer-events-auto animate-slide-up">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wide">용어 설명</span>
                        <h3 className="text-xl font-black text-slate-800 mt-2">{METRIC_INFO[selectedMetric].label}</h3>
                    </div>
                    <button onClick={() => setSelectedMetric(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-5">
                    {/* 1. 쉬운 설명 (부모용) */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-800 mb-1">💡 쉽게 말하면?</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{METRIC_INFO[selectedMetric].simple}</p>
                        <div className="mt-2 text-xs text-indigo-600 font-medium bg-indigo-50/50 p-2 rounded-lg">
                            "{METRIC_INFO[selectedMetric].analogy}"
                        </div>
                    </div>

                    {/* 2. 전문적 설명 (의료용) */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Note (전문의용)</p>
                        <p className="text-xs text-slate-500 leading-relaxed text-justify">
                            {METRIC_INFO[selectedMetric].pro}
                        </p>
                    </div>

                    {/* 3. 체크 포인트 */}
                    <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-xl">
                        <span className="text-lg">👀</span>
                        <div>
                            <p className="text-xs font-bold text-amber-800 mb-0.5">체크 포인트</p>
                            <p className="text-xs text-amber-700 leading-tight">{METRIC_INFO[selectedMetric].action}</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setSelectedMetric(null)}
                    className="w-full mt-6 bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
                >
                    확인했어요
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---

interface DetailCardProps {
    metricKey: string;
    title: string;
    value: number;
    unit: string;
    targetValue: number | null;
    targetLabel?: string;
    subValue?: number;
    subLabel?: string;
    status: 'normal' | 'warning' | 'danger';
    onClickInfo: () => void;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, value, unit, targetValue, targetLabel, subValue, subLabel, status, onClickInfo }) => {
    const theme = {
        normal: { border: 'border-slate-100', text: 'text-slate-800', bg: 'bg-white' },
        warning: { border: 'border-amber-200', text: 'text-amber-600', bg: 'bg-amber-50/30' },
        danger: { border: 'border-rose-200', text: 'text-rose-600', bg: 'bg-rose-50/30' }
    }[status];

    return (
        <div className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} shadow-sm relative group`}>
            {/* Title Row */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{title}</span>
                <button 
                    onClick={(e) => { e.stopPropagation(); onClickInfo(); }}
                    className="text-slate-300 hover:text-indigo-500 transition-colors p-1 -mr-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Value Row */}
            <div className="flex items-end justify-between">
                <div className="flex items-baseline">
                    <span className={`text-3xl font-bold tracking-tighter ${theme.text}`}>{value}</span>
                    <span className="text-xs font-semibold text-slate-400 ml-1">{unit}</span>
                </div>

                {/* Target / Setting Display */}
                <div className="flex flex-col items-end">
                    {targetValue !== null && (
                        <div className="text-right">
                            <span className="text-[9px] font-semibold text-slate-400 block uppercase">{targetLabel || 'Target'}</span>
                            <span className="text-xs font-bold text-slate-600">{targetValue} <span className="text-[9px] font-normal">{unit}</span></span>
                        </div>
                    )}
                    {subValue !== undefined && (
                        <div className="text-right mt-1">
                            <span className="text-[9px] font-semibold text-slate-400 block uppercase">{subLabel}</span>
                            <span className="text-xs font-bold text-slate-600">{subValue} <span className="text-[9px] font-normal">{unit}</span></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VentilatorScreen;
