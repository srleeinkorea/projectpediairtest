import React, { useState } from "react";

interface HomeScreenProps {
  userName?: string;
  onSubmitQuestion: (text: string) => void; // 질문 입력/추천칩 선택 시 호출
  onOpenMenu?: () => void;
  onOpenNotification?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  userName = "김류아",
  onSubmitQuestion,
  onOpenMenu,
  onOpenNotification,
}) => {
  const [text, setText] = useState("");
  const maxLength = 300;

  // Pedi-AIR 컨셉에 맞춘 추천 질문
  const suggestions = [
    "가래가 많아졌고 호흡이 너무 가빠 보여요.",
    "석션 후에도 산소포화도 수치가 잘 안 올라요.",
    "잘 때 숨소리가 커지고 가슴이 많이 들썩여요.",
    "호흡기 알람이 자주 울리는데 어떤 걸 먼저 확인해야 할까요?",
    "요즘 아이가 자주 힘들어하고 숨쉬기 불편해해요.",
  ];

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmitQuestion(trimmed);
  };

  const handleSuggestionClick = (q: string) => {
    onSubmitQuestion(q);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#F5F7FF] via-[#EEF1FF] to-[#E3E6FF] flex justify-center">
      {/* 가운데 모바일 화면 느낌 */}
      <div className="w-full max-w-md px-5 pt-4 pb-8 flex flex-col">
        {/* 상단 바 */}
        <header className="flex items-center justify-between mb-6">
          {/* 메뉴 + 로고영역 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMenu}
              className="p-2 -ml-1 rounded-full hover:bg-black/5 active:scale-95 transition"
              aria-label="메뉴 열기"
            >
              <div className="space-y-1">
                <span className="block w-4 h-[2px] bg-slate-700 rounded-full" />
                <span className="block w-4 h-[2px] bg-slate-700 rounded-full" />
              </div>
            </button>

            {/* V.Doc + PEDI-AIR 하이브리드 로고 */}
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                V
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Doc
              </span>
              <span
                className="
                  inline-flex items-center px-2.5 py-0.5 ml-1
                  rounded-full text-[10px] font-bold tracking-tight
                  bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
                  text-white shadow-sm
                "
              >
                PEDI-AIR
              </span>
            </div>
          </div>

          {/* 우측: 보호자 이름 + 알림 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-800">
              {userName}
            </span>
            <button
              type="button"
              onClick={onOpenNotification}
              className="relative p-2 rounded-full hover:bg-black/5 active:scale-95 transition"
              aria-label="알림"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-slate-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* 타이틀 */}
        <section className="mb-4">
          <h1 className="text-[22px] font-extrabold text-slate-900 leading-snug">
            브이닥 PEDI-AIR에게
            <br />
            물어보세요
          </h1>
          <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">
            인공호흡기, 가래, 호흡수 때문에 걱정될 때
            <br />
            먼저 AI에게 현재 상황을 들려주세요.
          </p>
        </section>

        {/* 메인 카드: 증상 입력 */}
        <section className="mb-6">
          <div className="relative rounded-[26px] bg-white/96 shadow-[0_16px_40px_rgba(74,96,255,0.18)] border border-[#D6DEFF] px-4 pt-3 pb-4">
            <p className="text-[13px] font-semibold text-slate-500 mb-1.5">
              ✨ 평소 아이 호흡/가래 때문에 고민되던 점을 적어주세요.
            </p>

            <div className="relative mt-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxLength))}
                rows={4}
                placeholder="예) 오늘은 가래가 많아지고 숨쉬기 힘들어해요. 산소포화도가 몇 번 89%까지 떨어졌어요."
                className="
                  w-full bg-transparent outline-none resize-none
                  text-[14px] text-slate-900 leading-relaxed
                  placeholder:text-slate-300
                "
              />
              {/* 전송 버튼 */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim()}
                className={`
                  absolute right-1.5 top-1.5 p-2 rounded-full
                  shadow-md transition-all
                  ${
                    text.trim()
                      ? "bg-gradient-to-br from-[#4E6BFF] to-[#7B5CFF] text-white active:scale-95"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  }
                `}
                aria-label="질문 전송"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>

            <div className="mt-2 flex justify-end">
              <span className="text-[11px] text-slate-400">
                {text.length}/{maxLength}
              </span>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            💡 브이닥 PEDI-AIR는 진료를 대신하지 않는 의료 특화 AI이며,
            <br />
            입력하신 내용은 아이의 상태 분석을 위해서만 사용됩니다.
          </p>
        </section>

        {/* 추천 질문 섹션 */}
        <section className="mt-1">
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[13px] text-[#4E6BFF]">💬</span>
            <span className="text-[13px] font-semibold text-[#4E6BFF]">
              이런 질문도 할 수 있어요
            </span>
          </div>

          <div className="space-y-2">
            {suggestions.map((q, idx) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSuggestionClick(q)}
                className={`
                  w-full text-left px-4 py-2.5 rounded-full
                  text-[13px] font-medium
                  transition
                  ${
                    idx < 3
                      ? "bg-white/90 text-slate-800 shadow-sm"
                      : "bg-white/60 text-slate-400"
                  }
                `}
              >
                {q}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeScreen;
