import React from "react";
import { ScreenName } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

/**
 * 레이아웃 컨셉
 * - 모바일: 화면 전체를 채우는 자연스러운 앱
 * - 데스크톱: 가운데에 세로 긴 "모바일 기기 1대"처럼 보이는 카드
 *   (연한 배경 + 부드러운 그림자 + 적당한 라운드)
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen,
  onNavigate,
}) => {
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
      {/* 실제 앱 컨테이너 */}
      <div
        className={`
          relative
          w-full
          max-w-[400px]
          h-[100dvh]
          sm:h-[780px]
          bg-slate-50
          flex flex-col
          overflow-hidden
          sm:rounded-[28px]
          sm:shadow-[0_26px_60px_rgba(15,23,42,0.30)]
          sm:border sm:border-slate-200/80
        `}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* 화면별 컨텐츠: 각 Screen이 안에서 스크롤 관리 */}
        <main className="flex-1 relative overflow-hidden w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
