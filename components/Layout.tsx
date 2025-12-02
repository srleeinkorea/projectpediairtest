
import React from "react";
import { ScreenName } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen, // 지금은 안 쓰지만 타입 유지
  onNavigate,
}) => {
  return (
    // 전체 배경 + 가운데 정렬만 담당
    <div className="min-h-screen bg-sky-50 flex justify-center px-3 sm:px-4 py-3 sm:py-4">
      {/* 각 Screen 컴포넌트가 자체적으로 max-w-md / 카드 레이아웃을 가지고 있음 */}
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

export default Layout;
