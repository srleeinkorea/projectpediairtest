// src/components/Layout.tsx
import React from "react";
import { ScreenName } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeScreen?: ScreenName;
  onNavigate?: (screen: ScreenName) => void;
  onChangeChild?: () => void;
  childName?: string;
}

/**
 * 레이아웃 컨셉
 * - 모바일: 전체 화면 앱
 * - 데스크톱: 스마트폰 목업(폰 프레임 + 옆 버튼)
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      className="
          w-full
          min-h-[100dvh]
          flex
          justify-center
          items-center          /* 항상 가운데 정렬 */
          bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200
          sm:px-4
        "
    >
      {/* 중앙 정렬 래퍼 */}
      <div
        className="
  relative flex justify-center items-center w-full max-w-[480px]
  sm:scale-[0.92] md:scale-[0.88] lg:scale-[0.84]
  sm:origin-center
"
      >
        {/* 바닥에 살짝 떨어진 폰 그림자 (웹 전용) */}
        <div className="hidden sm:block absolute -bottom-6 inset-x-10 h-10 bg-slate-900/25 blur-2xl rounded-full pointer-events-none" />

        {/* 👉 스마트폰 프레임 + 화면 컨테이너 */}
        <div
          className="
              relative
              w-full
max-w-[360px] sm:max-w-[330px] lg:max-w-[320px]
              h-[calc(100dvh-3rem)]   /* 화면 상하에 여유 두고 맞추기 */
              sm:h-auto
              sm:aspect-[9/19.5]
              flex
              items-stretch
              justify-center
            "
        >
          {/* 왼쪽 볼륨 버튼들 (웹에서만) */}
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
            {/* 실제 화면 영역 */}
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
              {/* 상단 카메라/스피커 바 (웹에서만) */}
              <div className="hidden sm:flex absolute top-1 left-1/2 -translate-x-1/2 h-4 w-24 rounded-full bg-slate-900/90" />

              {/* 실제 화면 컨텐츠 */}
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
