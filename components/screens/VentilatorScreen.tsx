
import React from 'react';
import { ScreenName, PatientData } from '../../types';

interface VentilatorScreenProps {
  onBack: () => void;
  patientData: PatientData;
}

const VentilatorScreen: React.FC<VentilatorScreenProps> = ({ onBack, patientData }) => {
  return (
    <div className="h-full bg-slate-50 overflow-y-auto scrollbar-hide">
      <header className="px-4 py-3 flex items-center justify-start border-b border-slate-100 bg-white sticky top-0 z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-slate-800 ml-2">호흡기 위험 분석</h1>
      </header>

      <div className="p-6 pb-24 space-y-5">
        
        {/* Analysis Card */}
        <div className={`p-6 rounded-3xl bg-white shadow-sm border-l-4 overflow-hidden ${patientData.p_peak_measured > patientData.p_peak_threshold ? 'border-rose-500' : 'border-emerald-500'}`}>
           <div className="flex items-start space-x-4">
             <div className={`p-2.5 rounded-xl flex-shrink-0 ${patientData.p_peak_measured > patientData.p_peak_threshold ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <div>
               <h3 className="font-bold text-slate-800 text-lg mb-1">{patientData.p_peak_measured > patientData.p_peak_threshold ? '주의: 압력 상승 감지' : '상태 양호'}</h3>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">
                 {patientData.p_peak_measured > patientData.p_peak_threshold 
                   ? `현재 압력이 임계치(${patientData.p_peak_threshold} cmH₂O)를 초과했습니다.`
                   : '모든 수치가 안정적입니다.'}
               </p>
             </div>
           </div>
        </div>

        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">실시간 데이터 모니터링</h2>
        
        <div className="grid grid-cols-2 gap-4">
           {/* P-Peak */}
           <GaugeCard 
             title="P-Peak" 
             value={patientData.p_peak_measured} 
             unit="cmH₂O"
             status={patientData.p_peak_measured > patientData.p_peak_threshold ? 'danger' : 'normal'}
             detail="최고 압력"
           />
           {/* P-Drive */}
           <GaugeCard 
             title="P-drive" 
             value={patientData.p_drive_measured} 
             unit="cmH₂O"
             status={patientData.p_drive_measured > 15 ? 'warning' : 'normal'}
             detail="구동 압력"
           />
           {/* V.Tidal */}
           <GaugeCard 
             title="V.Tidal" 
             value={patientData.vtidal_measured} 
             unit="mL"
             status={patientData.vtidal_measured > patientData.vtidal_target * 1.2 ? 'warning' : 'normal'}
             detail="호흡량"
           />
           {/* RR */}
           <GaugeCard 
             title="RR (호흡수)" 
             value={patientData.rr} 
             unit="bpm"
             status={patientData.rr > 40 ? 'danger' : 'normal'}
             detail="분당 호흡"
           />
        </div>

        {patientData.p_peak_measured > patientData.p_peak_threshold && (
            <button className="w-full bg-rose-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-rose-200 active:scale-95 transition-transform text-sm">
                호흡기 튜브 점검 가이드
            </button>
        )}

      </div>
    </div>
  );
};

const GaugeCard: React.FC<{ title: string; value: number; unit: string; status: 'danger' | 'warning' | 'normal'; detail: string }> = ({ title, value, unit, status, detail }) => {
  const statusStyles = {
    danger: "text-rose-600 bg-white shadow-sm shadow-rose-100 ring-1 ring-rose-50",
    warning: "text-amber-600 bg-white shadow-sm shadow-amber-100 ring-1 ring-amber-50",
    normal: "text-slate-800 bg-white shadow-sm shadow-slate-100"
  };

  return (
    <div className={`p-5 rounded-3xl flex flex-col justify-between h-32 ${statusStyles[status]}`}>
      <div className="flex justify-between items-start">
          <p className="text-[11px] font-bold uppercase text-slate-400">{title}</p>
          {status === 'danger' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
      </div>
      <div>
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        <span className="text-xs font-semibold ml-1 opacity-60">{unit}</span>
      </div>
      <div className="text-[11px] font-medium text-slate-400">
        {detail}
      </div>
    </div>
  );
};

export default VentilatorScreen;
