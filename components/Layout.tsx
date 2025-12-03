// src/components/Layout.tsx
import React from "react";
import { ScreenName } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  onChangeChild?: () => void;   // 상단 플러스 버튼용 (아기 변경)
  childName?: string;           // 현재 아기 이름 표시용
}

/**
 * 레이아웃 컨셉
 * - 모바일: 전체 화면 앱
 * - 데스크톱: 스마트폰 목업(폰 프레임 + 옆 버튼)
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen, // 현재는 사용 안 하지만, 타입 유지
  onNavigate,
  onChangeChild,
  childName,
}) => {
  const displayChildName = childName ?? "우리 아이";

  return (
    <div
      className="
        w-full
        min-h-[100dvh]
        flex
        justify-center
        items-stretch
        bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200
        sm:items-center
        sm:px-4
      "
    >
      {/* 중앙 정렬 래퍼 */}
      <div className="relative flex justify-center items-center w-full max-w-[480px] pt-10 sm:pt-12">
        {/* 🔝 상단 글로벌 로고 + 아기 변경 버튼 */}
        <div className="absolute top-2 sm:top-0 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          {/* 홈 로고 버튼 */}
          <button
            type="button"
            onClick={() => onNavigate("emr")} // 홈 역할: EMR 화면으로 이동
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur shadow-sm border border-slate-200 hover:bg-white active:scale-95 transition-all"
            aria-label="홈 화면으로 이동"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-300 to-sky-300 flex items-center justify-center text-[13px]">
              👶
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                V.Doc
              </span>
              <span className="text-[13px] font-bold tracking-tight">
                Pedi<span className="text-emerald-500">Air</span>
              </span>
            </div>
          </button>

          {/* 아기 변경 버튼 (플러스) – App에서 onChangeChild를 내려준 경우에만 표시 */}
          {onChangeChild && (
            <button
              type="button"
              onClick={onChangeChild}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
              aria-label="아기 프로필 변경"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-200 to-emerald-200 flex items-center justify-center text-[11px]">
                🙂
              </div>
              <span className="text-[11px] font-medium text-slate-700">
                {displayChildName}
              </span>
              <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[12px] text-slate-600">
                +
              </span>
            </button>
          )}
        </div>

        {/* 바닥에 살짝 떨어진 폰 그림자 (웹 전용) */}
        <div className="hidden sm:block absolute -bottom-6 inset-x-10 h-10 bg-slate-900/25 blur-2xl rounded-full pointer-events-none" />

        {/* 👉 스마트폰 프레임 + 화면 컨테이너 */}
        <div
          className={`
            relative
            w-full
            max-w-[370px]
            h-[100dvh]
            sm:h-auto
            sm:aspect-[9/19.5]   /* 웹에서 9:19.5 정도 비율의 폰처럼 */
            flex
            items-stretch
            justify-center
          `}
        >
          {/* 왼쪽 볼륨 버튼 2개 (웹에서만 보이게) */}
          <div className="hidden sm:block absolute -left-1 top-[32%] w-[3px] h-16 rounded-r-full bg-slate-500/85 shadow-sm" />
          <div className="hidden sm:block absolute -left-1 top-[52%] w-[3px] h-10 rounded-r-full bg-slate-500/75 shadow-sm" />

          {/* 오른쪽 전원 버튼 */}
          <div className="hidden sm:block absolute -right-1 top-[40%] w-[3px] h-14 rounded-l-full bg-slate-500/85 shadow-sm" />

          {/* 폰 바디(검은 테두리) */}
          <div
            className="
              relative
              w-full
              h-full
              bg-slate-900/95
              rounded-[32px]
              p-[6px]
              sm:p-[8px]
              shadow-[0_26px_80px_rgba(15,23,42,0.55)]
              border border-slate-800/70
            "
          >
            {/* 실제 화면 영역 (기존 카드) */}
            <div
              className="
                relative
                w-full
                h-full
                bg-slate-50
                flex flex-col
                overflow-hidden
                rounded-[24px]
                border border-slate-200/80
              "
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              {/* 상단 카메라/스피커 바 느낌 (웹에서만) */}
              <div className="hidden sm:flex absolute top-1 left-1/2 -translate-x-1/2 h-4 w-24 rounded-full bg-slate-900/90" />

              {/* 실제 화면 컨텐츠: 각 Screen 이 안에서 스크롤 관리 */}
              <main className="flex-1 relative overflow-hidden w-full flex flex-col">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
