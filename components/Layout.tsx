import React from "react";
import { ScreenName } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen,
  onNavigate,
}) => {
  return (
    /**
     * 바깥 래퍼
     * - 모바일: 화면 전체를 채움
     * - 데스크탑: 가운데에 "폰 1대" 사이즈로만 보이게
     */
    <div className="w-full min-h-[100dvh] bg-slate-900 flex items-center justify-center">
      {/* 실제 앱이 보이는 폰 프레임 */}
      <div
        className="
          relative
          w-full
          max-w-[420px]           /* 브라우저에서 항상 이 정도 폭으로 제한 → 모바일 폭처럼 보이게 */
          h-[100dvh]              /* 모바일일 때는 전체 높이 */
          md:h-[844px]            /* 데스크탑에선 아이폰 수준 높이로 고정 */
          md:rounded-[32px]       /* 데스크탑에서만 둥근 모서리 → 디바이스 느낌 */
          bg-slate-50
          shadow-[0_24px_60px_rgba(15,23,42,0.5)]
          overflow-hidden
          flex flex-col
          border border-slate-200/80
        "
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* 메인 콘텐츠 영역 - 각 화면 컴포넌트에서 자체 스크롤 관리 */}
        <main className="flex-1 relative overflow-hidden w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
