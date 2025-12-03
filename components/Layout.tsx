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
        sm:px-8
        lg:px-16
      "
    >
      {/* 실제 앱 컨테이너 */}
      <div
        className={`
          relative
          w-full
          max-w-[480px]      /* 🔵 420 → 480 으로 넓힘 */
          h-[100dvh]
          sm:h-[820px]       /* 🔵 살짝 키워서 비율 안정감 있게 */
          bg-slate-50
          flex flex-col
          overflow-hidden
          sm:rounded-[32px]  /* 🔵 라운드 조금 더 크게 */
          sm:shadow-[0_30px_80px_rgba(15,23,42,0.35)]
          sm:border sm:border-slate-200/80
        `}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* 화면별 컨텐츠 */}
        <main className="flex-1 relative overflow-hidden w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
