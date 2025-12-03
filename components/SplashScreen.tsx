
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Shorten connecting phase
    const timer1 = setTimeout(() => setStage(2), 1500); // Jump straight to logo reveal
    // Finish
    const timer2 = setTimeout(onFinish, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-slate-900 z-[9999] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Grid & Particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 right-0 h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Central Visual */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          {/* Pulse Rings */}
          <div className={`absolute inset-0 border-2 border-indigo-500 rounded-full ${stage >= 0 ? 'animate-ping opacity-20' : 'opacity-0'}`}></div>
          <div className={`absolute inset-2 border border-sky-400 rounded-full ${stage >= 0 ? 'animate-ping delay-150 opacity-20' : 'opacity-0'}`}></div>
          
          {/* Mechanical Scanner Ring */}
          <div className={`absolute inset-0 border-t-2 border-l-2 border-indigo-400 rounded-full animate-spin duration-[3s] opacity-60`}></div>
          <div className={`absolute inset-4 border-b-2 border-r-2 border-sky-400 rounded-full animate-spin duration-[2s] direction-reverse opacity-60`}></div>

          {/* Center Icon (Lungs/Brain Hybrid) */}
          <div className={`transition-all duration-700 transform ${stage >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
             <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 text-white" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
             </svg>
          </div>
          
          {/* Scanning Bar (Only during connecting) */}
          {stage < 2 && (
            <div className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
          )}
        </div>

        {/* Text Animation */}
        <div className="h-16 flex flex-col items-center">
            {stage < 2 && (
                <p className="text-indigo-300 font-mono text-xs tracking-widest animate-pulse">CONNECTING VITAL SENSORS...</p>
            )}
            {/* Removed AI ANALYZING text */}
            {stage === 2 && (
                <div className="text-center animate-fade-in-up">
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
                        V.Doc <span className="text-sky-400 font-normal">PEDI-AIR</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] tracking-widest uppercase">Pediatric AI for Respiratory Care</p>
                </div>
            )}
        </div>
      </div>

      {/* Loading Bar at Bottom */}
      <div className="absolute bottom-10 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-[3000ms] ease-out ${stage >= 0 ? 'w-full' : 'w-0'}`}></div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          90% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
