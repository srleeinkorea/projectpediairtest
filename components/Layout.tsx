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
     * - 모바일: 전체 화면을 채움
     * - 데스크탑: 중앙에 "폰 프레임"처럼 보이도록 정렬
     */
    <div className="min-h-[100dvh] w-full bg-slate-900 flex items-stretch justify-center">
      {/* 실제 앱 프레임 */}
      <div
        className="
          relative w-full max-w-md
          bg-slate-50
          h-[100dvh]
          sm:h-[90vh]
          sm:my-4
          sm:rounded-3xl
          shadow-2xl
          overflow-hidden
          flex flex-col
        "
        style={{
          // iOS 등 노치 영역(Safe Area) 대응
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
