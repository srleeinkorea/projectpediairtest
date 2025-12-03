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
    <div className="min-h-screen bg-sky-50 flex justify-center px-3 py-3">
      {/* 실제 폰 크기 느낌: 최소 360, 최대 414px 정도 */}
      <div className="w-full max-w-[414px] min-w-[360px]">
        {children}
      </div>
    </div>
  );
};

export default Layout;
