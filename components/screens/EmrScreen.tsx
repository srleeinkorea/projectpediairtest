// src/components/screens/EmrScreen.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { PatientData, ChatMessage, ScreenName } from "../../types"; // 🔹 ScreenName 추가
import { generateMedicalAdvice } from "../../services/geminiService";

interface EmrScreenProps {
  patientData: PatientData;
  onToggleStatus: () => void;
  onNavigate: (screen: ScreenName) => void; // 🔹 string → ScreenName으로 변경
  childName: string;
  onRandomizeChild: () => void;
}

// ====================================================================
// 1. 신호등 이모지 컴포넌트
// ====================================================================
const TrafficLightFace: React.FC<{
  type: "safe" | "warning" | "danger";
  active: boolean;
}> = ({ type, active }) => {
  const config = {
    safe: {
      gradient: "from-emerald-400 to-emerald-500",
      glow: "from-emerald-300/35 to-emerald-400/35",
      icon: "😊",
      label: "안전한 상태",
    },
    warning: {
      gradient: "from-amber-400 to-amber-500",
      glow: "from-amber-300/35 to-amber-400/35",
      icon: "😐",
      label: "주의 상태",
    },
    danger: {
      gradient: "from-rose-400 to-rose-500",
      glow: "from-rose-300/35 to-rose-400/35",
      icon: "😫",
      label: "위험 상태",
    },
  }[type];

  return (
    <div
      className="relative flex items-center justify-center group"
      role="img"
      aria-label={config.label}
    >
      {active && (
        <>
          <div
            className={`absolute -inset-1 rounded-full bg-gradient-to-br ${config.glow} blur-md opacity-70 animate-pulse`}
          />
          <div className="absolute -inset-2 rounded-full border border-white/60 opacity-60 animate-ping" />
        </>
      )}

      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
          active
            ? `w-8 h-8 bg-gradient-to-br ${config.gradient} text-white shadow-md scale-105 ring-[0.5px] ring-white/70`
            : "w-7 h-7 bg-slate-100 text-slate-300 opacity-70"
        }`}
      >
        <span
          className={active ? "text-[11px]" : "text-[10px] opacity-70"}
          aria-hidden="true"
        >
          {config.icon}
        </span>
      </div>
    </div>
  );
};

// ====================================================================
// 2. 텍스트 볼드 처리 유틸
// ====================================================================
const renderFormattedText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-extrabold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    )
  );
};

// ====================================================================
// 3. 안정 케이스용 시작 화면
// ====================================================================
interface WelcomeScreenProps {
  onQuestionSelect: (question: string) => void;
  childName?: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onQuestionSelect,
  childName,
}) => {
  const [welcomeInput, setWelcomeInput] = useState("");
  const maxLength = 300;

  // 질문 5개
  const initialSuggestions = [
    "오늘 가래가 많아져서 석션을 더 자주 하는데 괜찮을까요?",
    "잘 때 인공호흡기 경고음이 자주 울리는데 어떻게 해야 하나요?",
    "요즘 SpO₂가 92~94% 정도로 나와서 걱정돼요.",
    "평소보다 호흡수가 빨라졌는데 응급실에 가야 할까요?",
    "밤에 깨서 숨이 가빠 보일 때 어떻게 해야 할까요?",
  ];

  // 🔹 자동 위로 스크롤용 상태
  const [scrollIndex, setScrollIndex] = useState(0);
  const [instantJump, setInstantJump] = useState(false);

  // 한 아이템의 높이/간격 (px) - 필요하면 숫자만 살짝 조정하면 됨
  const ITEM_HEIGHT = 52;
  const ITEM_GAP = 10;
  const STEP = ITEM_HEIGHT + ITEM_GAP;
  const VISIBLE_COUNT = 3;

  // 🔹 1초에 한 번씩 한 칸 위로
  useEffect(() => {
    const timer = setInterval(() => {
      setScrollIndex((prev) => prev + 1);
    }, 2000); // 1초마다

    return () => clearInterval(timer);
  }, []);

  // 🔹 끝까지 올라가면 티 안 나게 맨 앞으로 점프
  useEffect(() => {
    const len = initialSuggestions.length;

    if (scrollIndex === len) {
      // transition(0.5s) 끝난 뒤에 점프
      const t = setTimeout(() => {
        setInstantJump(true); // 잠시 애니메이션 끄고
        setScrollIndex(0); // 맨 앞으로 점프
        // 다음 프레임에서 다시 transition 켜기
        requestAnimationFrame(() => {
          setInstantJump(false);
        });
      }, 520);

      return () => clearTimeout(t);
    }
  }, [scrollIndex, initialSuggestions.length]);

  const handleWelcomeSend = () => {
    const trimmed = welcomeInput.trim();
    if (!trimmed) return;
    onQuestionSelect(trimmed);
    setWelcomeInput("");
  };

  // 🔹 무한 루프처럼 보이게 리스트를 두 번 이어붙임
  const rollingList = [...initialSuggestions, ...initialSuggestions];

  return (
    <div
      className="
        flex flex-col
        justify-between
        items-center
        h-full
        bg-gradient-to-b from-[#F5F7FF] via-[#F0F4FF] to-[#E6EDFF]
        pt-8 pb-6
      "
    >
      {/* 상단 영역: 타이틀 + 인풋 */}
      <div className="w-full max-w-md px-5 flex flex-col">
        {/* 타이틀 */}
        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-slate-900 tracking-tight leading-snug text-center">
          브이닥 PEDI-AIR에게
          <br />
          먼저 물어보세요
        </h2>

        {/* 서브 타이틀 */}
        <p className="mt-4 text-[13px] font-semibold text-[#2E4475] text-center">
          어떤 점이 가장 걱정되세요?
        </p>

        {/* 인풋 박스 */}
        <div className="mt-5 relative flex justify-center">
          {/* 바깥 은은한 테두리/글로우 */}
          <div
            className="
      pointer-events-none
      absolute
      -inset-[3px]
      rounded-[20px]
      border border-sky-300/75
      shadow-[0_0_0_1px_rgba(96,142,255,0.30)]
      opacity-90
      animate-pulse
    "
          />

          {/* 실제 입력 박스 – 폭을 약간 줄여서 너무 커 보이지 않게 */}
          <div
            className="
      relative
      w-full max-w-[21rem]
      bg-white
      rounded-[18px]
      px-4 py-3
      flex gap-3
      shadow-[0_10px_24px_rgba(120,150,220,0.18)]
    "
          >
            {/* 아이콘 영역 */}
            <div className="pt-0.5">
              <span className="text-[18px] text-sky-400">📝</span>
            </div>

            {/* textarea + 하단 바 */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={welcomeInput}
                onChange={(e) =>
                  setWelcomeInput(e.target.value.slice(0, maxLength))
                }
                placeholder="지금 가장 궁금한 상황을 편하게 적어주세요."
                maxLength={maxLength}
                rows={3}
                className="
          w-full
          bg-transparent
          border-none
          outline-none
          resize-none
          text-[12.5px] font-medium text-slate-900
          placeholder:text-slate-400 placeholder:font-normal
          leading-relaxed
        "
                aria-label="아이 상태 입력"
              />

              {/* 아래 여백 + 카운터/버튼 정렬 */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {welcomeInput.length}/{maxLength}
                </span>

                <button
                  type="button"
                  onClick={handleWelcomeSend}
                  disabled={!welcomeInput.trim()}
                  className={`
            inline-flex items-center justify-center gap-1.5
            rounded-full px-3 py-1.5
            text-[11px] font-semibold
            transition-all duration-200
            ${
              welcomeInput.trim()
                ? "bg-gradient-to-r from-[#4F86FF] to-[#3167FF] text-white shadow-md hover:shadow-lg active:scale-95"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }
          `}
                  aria-label="메시지 전송"
                >
                  <span>보내기</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 글자 수 카운터 */}
        <div className="mt-1.5 text-right text-[11px] text-slate-400">
          {welcomeInput.length}/{maxLength}
        </div>
      </div>

      {/* 하단 영역: 또래 보호자 질문 – 맨 아래 + 자동 위로 스크롤 */}
      <div className="w-full max-w-sm px-4 pb-1">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-[#4F7BFF] text-[18px]">💬</span>
          <span className="text-[13px] font-bold text-[#344674]">
            {childName
              ? `${childName} 또래 보호자들이 자주 한 질문들이에요`
              : "또래 아이 보호자들이 자주 한 질문들이에요"}
          </span>
        </div>

        {/* 🔹 세 개 정도만 완전히 보이고, 밑에는 살짝 보일 듯 말 듯 + 1초마다 한 칸씩 위로 */}
        <div
          className="overflow-hidden"
          style={{
            // 3개 + 약간 여유를 줘서 아래가 살짝 보이는 느낌
            height: VISIBLE_COUNT * STEP + 10,
          }}
        >
          <div
            className={`
              ${instantJump ? "" : "transition-transform duration-500 ease-out"}
            `}
            style={{
              transform: `translateY(-${scrollIndex * STEP}px)`,
            }}
          >
            {rollingList.map((q, idx) => (
              <button
                key={`${q}-${idx}`}
                type="button"
                onClick={() => onQuestionSelect(q)}
                style={{
                  height: ITEM_HEIGHT,
                  marginBottom: idx === rollingList.length - 1 ? 0 : ITEM_GAP,
                }}
                className="
                  w-full text-center
                  px-4
                  bg-white/96 backdrop-blur-sm
                  border border-slate-100
                  rounded-[999px]
                  text-[13px] font-semibold text-slate-800
                  shadow-[0_8px_20px_rgba(120,150,220,0.18)]
                  transition-all duration-200
                  hover:bg-slate-50 active:scale-[0.98]
                  flex items-center justify-center
                "
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// 4. 메인 컴포넌트: EmrScreen
// ====================================================================
const EmrScreen: React.FC<EmrScreenProps> = ({
  patientData,
  onToggleStatus,
  onNavigate,
  childName,
  onRandomizeChild,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<
    Record<string, boolean>
  >({});
  const [showMenu, setShowMenu] = useState(false);
  const [sentQuestions, setSentQuestions] = useState<string[]>([]);

  const isEmergency = patientData.spo2 < 90;
  const showWelcomeScreen = !isEmergency && messages.length === 0;

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const prevEmergencyRef = useRef(isEmergency);
  const prevNameRef = useRef<string | undefined>(childName);

  const getRiskLevel = useCallback(
    (spo2: number): "safe" | "warning" | "danger" => {
      if (spo2 < 90) return "danger"; // 위험신호
      if (spo2 < 94) return "warning"; // 주의신호 (90~93%)
      return "safe"; // 안정신호 (94 이상)
    },
    []
  );

  const riskLevel = useMemo(
    () => getRiskLevel(patientData.spo2),
    [patientData.spo2, getRiskLevel]
  );

  const getInitialMessage = useCallback(
    (data: PatientData) => {
      const effectiveChildName = childName || "아이";
      const guardianName =
        (data as any).guardianName &&
        typeof (data as any).guardianName === "string"
          ? (data as any).guardianName
          : "보호자님";

      if (data.spo2 < 90) {
        return `${effectiveChildName} ${guardianName}, **인공호흡기 이상 신호** 알람이 1분 이상 감지되어 알림을 드렸어요.

현재 **호흡수(RR)가 ${data.rr}회**로 높고, 수치를 볼 때 **가래 등 분비물이 기도를 좁게 만들어 발생할 수 있는 현상**일 수 있어요.

너무 당황하지 마시고, 침착하게 **먼저 이렇게 해보세요.**

[즉시 행동 가이드]
1. 석션(Suction)을 바로 시행해 주세요.
2. 튜브가 꺾이거나 빠지지 않았는지 확인해 주세요.
3. 체위 변경(머리는 살짝 올리고, 몸은 약간 옆으로)을 시도해 주세요.

💡 **잠깐, 왜 그럴까요?**
가래가 기도를 막으면 공기 흐름이 차단되어 산소 수치가 급격히 떨어질 수 있습니다. 석션 후 SpO₂와 호흡수 변화를 5~10분 정도 지켜봐 주세요.`;
      }

      return `안녕하세요. 현재 ${effectiveChildName}의 호흡 상태와 인공호흡기 데이터를 실시간으로 모니터링 중입니다.

가래가 늘었거나, 호흡수가 달라졌거나, 인공호흡기 알람이 자주 울리는 등
평소와 다른 점이 느껴진다면 아래에 편하게 적어 주세요.
`;
    },
    [childName]
  );

  useEffect(() => {
    const nameChanged = prevNameRef.current !== childName;
    const shouldInitializeChat = isEmergency || nameChanged;

    if (
      isFirstRender.current ||
      prevEmergencyRef.current !== isEmergency ||
      nameChanged
    ) {
      if (shouldInitializeChat) {
        setMessages([
          {
            id: `init-${Date.now()}`,
            role: "model",
            text: getInitialMessage(patientData),
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages([]);
      }

      setSentQuestions([]);
      setExpandedEvidence({});
      setShowMenu(false);

      prevEmergencyRef.current = isEmergency;
      prevNameRef.current = childName;
      isFirstRender.current = false;
    }
  }, [isEmergency, getInitialMessage, patientData, childName]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, expandedEvidence, scrollToBottom]);

  const parseMessageContent = useCallback((text: string) => {
    const splitMarker = "💡 **잠깐, 왜 그럴까요?**";
    if (text.includes(splitMarker)) {
      const parts = text.split(splitMarker);
      return { main: parts[0].trim(), evidence: parts[1].trim() };
    }
    return { main: text, evidence: null as string | null };
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setSentQuestions((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed]
      );

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const effectiveName = childName || patientData.name;

        const aiResponseRaw = await generateMedicalAdvice(trimmed, {
          ...patientData,
          name: effectiveName,
        } as PatientData);

        const aiResponse =
          typeof aiResponseRaw === "string" ? aiResponseRaw.trim() : "";

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "model",
          text:
            aiResponse ||
            "죄송합니다. AI 답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (error) {
        console.error("generateMedicalAdvice 에러:", error);
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: "model",
          text:
            "지금은 답변 생성 중 문제가 발생했습니다.\n\n" +
            "증상이 급하게 나빠지거나, 청색증·의식 저하·심한 호흡곤란이 보이면 즉시 119에 연락하거나 응급실로 이동해 주세요.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [patientData, childName, isLoading]
  );

  const handleFeedback = useCallback(
    (messageId: string, type: "positive" | "negative") => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, feedback: msg.feedback === type ? undefined : type }
            : msg
        )
      );
    },
    []
  );

  const toggleEvidence = useCallback((id: string) => {
    setExpandedEvidence((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const getSuggestions = useCallback(
    (data: PatientData) => {
      const emergencySuggestions = [
        "석션을 했는데도 SpO₂가 잘 안 올라와요.",
        "호흡수가 계속 빠른데 집에서 더 볼 수 있을까요?",
        "지금 당장 119를 불러야 할까요?",
        "입술이나 손끝 색이 평소보다 더 파래졌어요.",
      ];

      const normalSuggestions = [
        "가래가 없어도 석션을 규칙적으로 해야 하나요?",
        "잘 때 인공호흡기 가습 온도는 몇 도가 좋나요?",
        "지난주보다 호흡 상태가 좋아졌는지 궁금해요.",
        "목욕시킬 때 인공호흡기/튜브는 어떻게 관리하면 좋을까요?",
        "야간에 갑자기 알람이 울리면 어떤 순서로 확인해야 하나요?",
      ];

      const baseList =
        data.spo2 < 90 ? emergencySuggestions : normalSuggestions;
      return baseList.filter((q) => !sentQuestions.includes(q));
    },
    [sentQuestions]
  );

  const suggestions = useMemo(
    () => getSuggestions(patientData),
    [getSuggestions, patientData]
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 상단 로고 */}
      <header
        className="
    px-4 sm:px-5
    py-2.5 sm:py-3
    flex items-center justify-center
    bg-white/90 backdrop-blur-xl
    border-b border-white/40
    z-30 shrink-0 shadow-sm
  "
      >
        <button
          type="button"
          onClick={onToggleStatus} // 🔹 여기: 상태 토글만
          className="group hover:opacity-95 active:scale-[0.99] transition-all duration-200"
          aria-label="홈으로 이동"
        >
          <div className="flex items-center gap-2.5 transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-95">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white"
                aria-hidden="true"
              >
                <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
                <path d="M15 12h.01"></path>
                <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
                <path d="M9 12h.01"></path>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[17px] font-extrabold tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                V.Doc PEDI-AIR
              </span>
              <span className="text-[8px] text-slate-500">
                PEDIatric AI for Respiratory-care
              </span>
            </div>
          </div>
        </button>
      </header>

      {/* 위험도 배지 */}
      {/* 위험도 배지 */}
      <section className="px-4 sm:px-5 pt-2 pb-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            // 🔹 이제는 상태는 건드리지 않고,
            //    "주의" 또는 "위험"일 때만 Triage 화면으로 이동
            if (riskLevel === "warning" || riskLevel === "danger") {
              onNavigate("triage");
            }
            // riskLevel === "safe"일 때는 아무 일도 안 함
          }}
          className="
      w-full flex items-center
      rounded-2xl
      bg-white/95
      border border-slate-100
      shadow-sm
      px-2.5 py-1.75
      active:scale-[0.99]
      transition-all duration-150
    "
          aria-label="상세 위험도 보기"
        >
          <div className="flex items-center gap-1.5 bg-slate-50/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-slate-200/60">
            <TrafficLightFace type="safe" active={riskLevel === "safe"} />
            <TrafficLightFace type="warning" active={riskLevel === "warning"} />
            <TrafficLightFace type="danger" active={riskLevel === "danger"} />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {riskLevel === "safe" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-tight">
                건강 위험등 안정신호
              </span>
            )}
            {riskLevel === "warning" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 tracking-tight">
                건강 위험등 주의신호
              </span>
            )}
            {riskLevel === "danger" && (
              <span className="relative inline-flex items-center">
                <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-400/60 to-red-500/60 blur-md opacity-80 animate-pulse" />
                <span className="relative inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md border border-rose-200/80 tracking-tight">
                  건강 위험등 위험신호
                </span>
              </span>
            )}
            <span className="text-sm leading-none text-slate-300">›</span>
          </div>
        </button>
      </section>

      {/* 메인 영역: Welcome / 채팅 */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        onClick={() => setShowMenu(false)}
      >
        {showWelcomeScreen ? (
          <WelcomeScreen onQuestionSelect={handleSend} childName={childName} />
        ) : (
          <div className="px-4 sm:px-5 pt-2.5 pb-3.5 space-y-3">
            {messages.map((msg) => {
              const { main, evidence } = parseMessageContent(msg.text);
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="relative group max-w-[85%]">
                    {!isUser && (
                      <div className="absolute -inset-0.5 bg-sky-100/40 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <div
                      className={`relative px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-lg transition-all duration-300 ${
                        isUser
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl rounded-tr-md font-medium"
                          : "bg-white/95 backdrop-blur-md text-slate-800 border border-slate-100 rounded-3xl rounded-tl-md"
                      }`}
                    >
                      {isUser ? msg.text : renderFormattedText(main)}

                      {!isUser && evidence && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleEvidence(msg.id)}
                            className="flex items-center justify-between w-full text-left group/evidence"
                            aria-label="근거 확인 토글"
                          >
                            <div className="relative">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400/20 to-blue-400/20 rounded-lg blur opacity-0 group-hover/evidence:opacity-100 transition-opacity duration-300" />
                              <span className="relative text-xs font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent px-2.5 py-1 rounded-lg bg-sky-50/80 backdrop-blur-sm border border-sky-100 flex items-center gap-1">
                                🔍 근거 확인하기
                              </span>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${
                                expandedEvidence[msg.id] ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {expandedEvidence[msg.id] && (
                            <div className="mt-2.5 text-xs text-slate-700 bg-slate-50/80 backdrop-blur-sm p-3 rounded-xl leading-relaxed border border-slate-100">
                              {renderFormattedText(evidence)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isUser && (
                    <div className="flex items-center mt-1.5 ml-1.5 space-x-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold">
                        답변이 도움이 되었나요?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, "positive")}
                        className={`p-1.5 rounded-lg border-2 transition-all duration-200 ${
                          msg.feedback === "positive"
                            ? "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-300 text-sky-600 shadow-sm"
                            : "bg-white border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50/50"
                        }`}
                        aria-label="긍정 피드백"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill={
                            msg.feedback === "positive"
                              ? "currentColor"
                              : "none"
                          }
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, "negative")}
                        className={`p-1.5 rounded-lg border-2 transition-all duration-200 ${
                          msg.feedback === "negative"
                            ? "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 text-rose-600 shadow-sm"
                            : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50"
                        }`}
                        aria-label="부정 피드백"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill={
                            msg.feedback === "negative"
                              ? "currentColor"
                              : "none"
                          }
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l2.969 1.305m-7.18 5.635h2.969v9a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400/10 to-blue-400/10 rounded-3xl blur opacity-50" />
                  <div className="relative bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl rounded-tl-md border border-white/50 shadow-lg">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 하단 입력 영역 (Welcome일 때는 숨김) */}
      {!showWelcomeScreen && (
        <div className="relative bg-white/90 backdrop-blur-xl border-t border-white/40 px-4 sm:px-5 pt-3.5 pb-4 shadow-2xl rounded-t-xl">
          {showMenu && (
            <div className="absolute bottom-full left-4 mb-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 min-w-[220px] z-50 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onNavigate("pro");
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                aria-label="상태 기록 입력 화면으로 이동"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 via-sky-400 to-blue-500 flex items-center justify-center text-white text-sm">
                  PRO
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  오늘 아이 상태 기록하기
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onNavigate("ventilator");
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                aria-label="인공호흡기 상태 분석 화면으로 이동"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-300 flex items-center justify-center text-white text-sm">
                  Vent
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  인공호흡기 알람 · 압력 확인
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onRandomizeChild();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                aria-label="다른 아이 이름으로 보기"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-300 via-sky-300 to-sky-200 flex items-center justify-center text-white text-sm">
                  👶
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  다른 아이 정보로 보기 (데모)
                </span>
              </button>
            </div>
          )}

          {!isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "model" &&
            suggestions.length > 0 && (
              <div className="mb-2.5">
                <div className="flex overflow-x-auto space-x-3 py-1 scrollbar-hide">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSend(s)}
                      className="relative group whitespace-nowrap px-4 py-2 text-[11px] font-bold rounded-xl flex-shrink-0 transition-all duration-300"
                      aria-label={s}
                    >
                      <div className="absolute inset-0 bg-sky-50 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-300/30 to-blue-300/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        {s}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div
                className={`absolute -inset-0.5 rounded-xl blur transition-opacity duration-300 ${
                  showMenu
                    ? "bg-gradient-to-r from-sky-400/40 to-blue-400/40 opacity-100"
                    : "bg-gradient-to-r from-slate-300/40 to-slate-400/40 opacity-0 group-hover:opacity-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className={`relative p-3 rounded-xl flex-shrink-0 transition-all duration-300 border-2 ${
                  showMenu
                    ? "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-300 text-sky-700 rotate-45 shadow-md"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                }`}
                aria-label="추가 메뉴 열기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-grow relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="아이의 호흡/가래 변화, 인공호흡기 알람, 걱정되는 상황을 입력해 주세요."
                className="w-full bg-white/95 backdrop-blur-sm border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 outline-none placeholder:text-slate-400 placeholder:font-normal tracking-tight transition-all duration-200 shadow-sm"
                disabled={isLoading}
                aria-label="메시지 입력"
              />
            </div>

            <div className="relative group">
              <div
                className={`absolute -inset-0.5 rounded-xl blur-md transition-opacity duration-300 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-sky-400/50 to-blue-500/50 opacity-70 group-hover:opacity-100"
                    : "opacity-0"
                }`}
              />
              <button
                type="button"
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className={`relative p-3 rounded-xl flex-shrink-0 transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-xl active:scale-95"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
                aria-label="메시지 전송"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmrScreen;
