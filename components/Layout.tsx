import React from 'react';
import { ScreenName } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, onNavigate }) => {
  return (
    // Use 100dvh for better mobile browser support
    <div className="max-w-xl mx-auto bg-slate-50 h-[100dvh] w-full relative shadow-2xl overflow-hidden flex flex-col">
      {/* Main content area - overflow hidden so children manage their own scroll */}
      <main className="flex-1 relative overflow-hidden w-full flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;