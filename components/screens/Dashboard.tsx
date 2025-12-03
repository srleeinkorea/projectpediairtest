
import React, { useState, useEffect } from 'react';
import { ScreenName, PatientData } from '../../types';

interface DashboardProps {
  onNavigate: (screen: ScreenName) => void;
  patientData: PatientData;
  onToggleStatus: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, patientData, onToggleStatus }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? '오후' : '오전';
      const displayHours = hours % 12 || 12;
      setCurrentTime(`${period} ${displayHours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simple Triage Logic
  const getRiskLevel = (data: PatientData) => {
    if (data.spo2 < 90 || data.rr > 40 || data.p_peak_measured > data.p_peak_threshold) return 'red';
    if (data.spo2 < 95 || data.rr > 30) return 'yellow';
    return 'blue';
  };

  const riskLevel = getRiskLevel(patientData);

  // Refined Status Colors (Softer, Premium)
  const statusConfig = {
    red: {
      bg: 'bg-white',
      shadow: 'shadow-rose-100 shadow-xl',
      text: 'text-rose-600',
      indicatorBg: 'bg-rose-50',
      label: '즉시 대응 필요',
      desc: '위험 징후가 감지되었습니다',
    },
    yellow: {
      bg: 'bg-white',
      shadow: 'shadow-amber-100 shadow-xl',
      text: 'text-amber-600',
      indicatorBg: 'bg-amber-50',
      label: '주의 관찰 필요',
      desc: '수치가 다소 불안정합니다',
    },
    blue: {
      bg: 'bg-white',
      shadow: 'shadow-emerald-100 shadow-xl',
      text: 'text-emerald-600',
      indicatorBg: 'bg-emerald-50',
      label: '상태 안정적',
      desc: '모든 수치가 정상 범위입니다',
    }
  };

  const currentStatus = statusConfig[riskLevel];
  const isEmergency = riskLevel === 'red';

  return (
    <div className="h-full bg-slate-50 font-sans flex flex-col overflow-hidden text-slate-800">
      {/* Header - Refined */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0 h-16 z-30">
        <button onClick={onToggleStatus} className="flex flex-col items-start group">
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5 group-hover:text-indigo-500 transition-colors">
            Pediatric AI for Respiratory Care
          </span>
          <span className="text-lg font-bold text-slate-800 tracking-tight flex items-center">
            PEDI-AIR <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1"></span>
          </span>
        </button>
        <div className="text-xs font-medium text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
          {currentTime}
        </div>
      </header>

      {/* Main Content - Full Screen Layout */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-5 flex flex-col">
        
        {/* 1. Real-time risk/status (Traffic Light) */}
        <section className="shrink-0">
          <button 
            onClick={() => onNavigate('triage')}
            className={`w-full relative overflow-hidden rounded-3xl p-6 flex flex-row items-center justify-between transition-all active:scale-[0.99] group ${currentStatus.bg} ${currentStatus.shadow}`}
          >
             {/* Left: Text Info */}
             <div className="text-left z-10">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold mb-3 ${currentStatus.indicatorBg} ${currentStatus.text}`}>
                    {isEmergency ? 'EMERGENCY' : riskLevel === 'yellow' ? 'WARNING' : 'STABLE'}
                </div>
                <h2 className={`text-2xl font-bold text-slate-800 tracking-tight mb-1`}>{currentStatus.label}</h2>
                <p className="text-sm text-slate-500 font-medium">{currentStatus.desc}</p>
             </div>

             {/* Right: Visual Traffic Light (Subtle) */}
             <div className="flex items-center space-x-2 bg-slate-50/80 p-2 rounded-2xl backdrop-blur-sm">
               <CuteFaceMini active={riskLevel === 'blue'} color="emerald" face="happy" />
               <CuteFaceMini active={riskLevel === 'yellow'} color="amber" face="neutral" />
               <CuteFaceMini active={riskLevel === 'red'} color="rose" face="sad" pulse={isEmergency} />
            </div>
          </button>
        </section>

        {/* 2. Immediate Action CTA (Only in Red state) */}
        {isEmergency && (
          <section className="shrink-0 animate-fade-in-up">
            <div className="bg-rose-500 rounded-3xl shadow-lg shadow-rose-200 overflow-hidden relative text-white">
              <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold flex items-center">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></span>
                        긴급 조치 가이드
                    </h3>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">기도 폐쇄 의심</span>
                </div>
              
                <div className="space-y-2.5 mb-5">
                    <CheckItem text="환아 고개 젖혀 기도 확보" light />
                    <CheckItem text="즉시 석션(Suction) 시행" light />
                    <CheckItem text="튜브 연결 및 꼬임 확인" light />
                </div>

                <button 
                  onClick={() => onNavigate('ventilator')}
                  className="w-full bg-white text-rose-600 py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
                >
                  상세 대응 매뉴얼 보기
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 3. Machine status / vital summary */}
        <section className={`flex-1 flex flex-col justify-center min-h-0`}>
           <SectionHeader title="주요 수치 (Vital Signs)" />
           <div className="grid grid-cols-2 gap-4 h-full">
                <VitalCard 
                    type="pressure"
                    label="P-Peak" 
                    value={patientData.p_peak_measured} 
                    unit="cmH₂O" 
                    isDanger={patientData.p_peak_measured > patientData.p_peak_threshold}
                    desc={patientData.p_peak_measured > patientData.p_peak_threshold ? "기도 저항 높음" : "정상 범위"}
                    onClick={() => onNavigate('ventilator')}
                />
                <VitalCard 
                    type="spo2"
                    label="SpO2" 
                    value={patientData.spo2} 
                    unit="%" 
                    isDanger={patientData.spo2 < 90} 
                    desc={patientData.spo2 < 90 ? "저산소증 위험" : "정상 범위"}
                    onClick={() => onNavigate('ventilator')}
                />
           </div>
        </section>

        {/* 5. Auxiliary features (AI Chat / Records) */}
        <section className="shrink-0">
           <SectionHeader title="스마트 케어" />
           <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => onNavigate('emr')}
                    className="bg-indigo-600 rounded-[24px] p-5 shadow-lg shadow-indigo-200 text-left relative overflow-hidden group active:scale-[0.98] transition-all h-32"
                >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -mr-5 -mt-5"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg tracking-tight">AI 상담</h3>
                            <p className="text-indigo-100 text-xs font-medium opacity-90">증상 질문하기</p>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={() => onNavigate('pro')}
                    className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 text-left border border-slate-50 group active:scale-[0.98] transition-all h-32"
                >
                    <div className="flex flex-col justify-between h-full">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5V3h4v2M3 12h18M9 16h6" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-slate-800 font-bold text-lg tracking-tight">상태 기록</h3>
                            <p className="text-slate-400 text-xs font-medium">체온, 배변 등</p>
                        </div>
                    </div>
                </button>
           </div>
        </section>

      </div>
    </div>
  );
};

// --- Styled Components ---

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-xs font-bold text-slate-400 mb-3 ml-1 uppercase tracking-wider">{title}</h3>
);

const CuteFaceMini: React.FC<{ active: boolean; color: string; face: 'happy' | 'neutral' | 'sad'; pulse?: boolean }> = ({ active, color, face, pulse }) => {
    const colorMap: any = {
        emerald: 'bg-emerald-400',
        amber: 'bg-amber-400',
        rose: 'bg-rose-500'
    };
    
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            active 
                ? `${colorMap[color]} shadow-md scale-110 ${pulse ? 'animate-bounce' : ''}` 
                : 'bg-slate-200 opacity-30 grayscale'
        }`}>
             <span className="text-sm filter drop-shadow-sm leading-none pb-0.5">
                {face === 'happy' && '😊'}
                {face === 'neutral' && '😐'}
                {face === 'sad' && '😫'}
            </span>
        </div>
    );
};

const CheckItem: React.FC<{ text: string; light?: boolean }> = ({ text, light }) => (
  <div className={`flex items-center space-x-3 p-3 rounded-xl ${light ? 'bg-white/10' : 'bg-rose-50'}`}>
    <div className={`rounded-full flex items-center justify-center flex-shrink-0 w-5 h-5 ${light ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </div>
    <span className={`text-sm font-bold leading-tight ${light ? 'text-white' : 'text-slate-800'}`}>{text}</span>
  </div>
);

const VitalCard: React.FC<{ type: 'pressure' | 'spo2'; label: string; value: number; unit: string; isDanger: boolean; desc: string; onClick?: () => void }> = ({ type, label, value, unit, isDanger, desc, onClick }) => {
    // Icons
    const PressureIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.88H7.01L7 20a5 5 0 0 0 10 0l-.01-.62h-.03a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 14.5 2 2.5 2.5 0 0 1 12 4.5v.17a2.5 2.5 0 0 1-2.5-2.67z"/>
            <path d="M12 2v20"/>
        </svg>
    );
    const SpO2Icon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
    );

    const Icon = type === 'pressure' ? PressureIcon : SpO2Icon;
    const accentColor = isDanger ? 'rose' : (type === 'pressure' ? 'sky' : 'emerald');
    const colorClasses: any = {
        rose: { iconBg: 'bg-rose-50 text-rose-500', text: 'text-rose-500', border: 'border-rose-100', badge: 'bg-rose-50 text-rose-600' },
        sky: { iconBg: 'bg-sky-50 text-sky-500', text: 'text-slate-800', border: 'border-slate-50', badge: 'bg-slate-100 text-slate-500' },
        emerald: { iconBg: 'bg-emerald-50 text-emerald-500', text: 'text-slate-800', border: 'border-slate-50', badge: 'bg-slate-100 text-slate-500' }
    };
    const theme = colorClasses[accentColor];

    return (
        <button onClick={onClick} className={`bg-white p-5 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border ${theme.border} relative overflow-hidden group hover:shadow-md transition-all text-left flex flex-col justify-between h-full`}>
            {/* Background Watermark Icon */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform duration-500 ${isDanger ? 'text-rose-500' : 'text-slate-800'}`}>
                <Icon />
            </div>

            {/* Header */}
            <div className="flex items-center space-x-2.5 mb-2 relative z-10">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center p-1.5 ${theme.iconBg}`}>
                    <Icon />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
                {isDanger && <span className="absolute right-0 top-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
            </div>

            {/* Value */}
            <div className="relative z-10 mt-1">
                <span className={`text-4xl font-bold tracking-tighter ${isDanger ? 'text-rose-500' : 'text-slate-800'}`}>{value}</span>
                <span className="text-sm font-semibold text-slate-400 ml-1.5 opacity-60">{unit}</span>
            </div>

            {/* Footer Status Badge */}
            <div className={`relative z-10 mt-3 self-start px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.badge}`}>
                {desc}
            </div>
        </button>
    );
};

export default Dashboard;
