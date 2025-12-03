import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { PatientData, ChatMessage, ScreenName } from "../../types";
import { generateMedicalAdvice } from "../../services/geminiService";

/**
 * 아동 호흡 상태 모니터링용 채팅 화면
 */

interface EmrScreenProps {
  patientData: PatientData;
  onToggleStatus: () => void;
  onNavigate: (screen: ScreenName) => void;
}

/** PediAir 로고 – 아기 느낌 버전 (현재 헤더에는 미사용이지만 유지) */
const PediairLogo: React.FC = () => (
  <div className="flex items-center gap-1.5">
    {/* 심볼: 아기 얼굴 + 숨 라인 */}
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-300 to-sky-300 flex items-center justify-center relative overflow-hidden shadow-sm">
      {/* 아기 얼굴 */}
      <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center relative">
        {/* 볼터치 */}
        <div className="absolute left-1 top-[11px] w-1.5 h-1.5 rounded-full bg-rose-200/70" />
        <div className="absolute right-1 top-[11px] w-1.5 h-1.5 rounded-full bg-rose-200/70" />
        {/* 눈 + 입 */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-[2px] mt-[1px]">
            <div className="w-0.5 h-0.5 rounded-full bg-slate-700" />
            <div className="w-0.5 h-0.5 rounded-full bg-slate-700" />
          </div>
          <div className="w-3 h-1.5 border-b-[1.5px] border-slate-700 rounded-b-full mt-[1px]" />
        </div>
      </div>
      {/* 오른쪽 숨/공기 라인 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1">
        <div className="w-3 h-[2px] bg-white/60 rounded-full mb-[2px]" />
        <div className="w-2 h-[2px] bg-white/40 rounded-full" />
      </div>
    </div>

    {/* 워드마크: 위에 V.Doc, 아래 PediAir */}
    <div className="flex flex-col leading-none">
      <span className="text-[9px] font-semibold text-slate-500 tracking-[0.16em] uppercase">
        V.Doc
      </span>
      <span className="text-[13px] font-bold tracking-tight">
        <span className="text-slate-900">Pedi</span>
        <span className="text-emerald-500">Air</span>
      </span>
    </div>
  </div>
);

/** 상단 위험도 아이콘 (신호등 얼굴) – 여백 줄여서 더 컴팩트하게 */
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
    <div className="relative group" role="img" aria-label={config.label}>
      {active && (
        <div
          className={`absolute -inset-0.5 bg-gradient-to-br ${config.glow} rounded-full blur-sm opacity-70 group-hover:opacity-90 transition-opacity duration-300`}
        />
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

/** **bold** 처리 렌더링 */
const renderFormattedText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-extrabold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    ),
  );
};

const EmrScreen: React.FC<EmrScreenProps> = ({
  patientData,
  onToggleStatus,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<
    Record<string, boolean>
  >({});
  const [showMenu, setShowMenu] = useState(false);
  const [sentQuestions, setSentQuestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  /** 위험도 계산 – 이 EMR 화면에서는 '주의' 단계 없이 안정/위험만 사용 */
  const getRiskLevel = useCallback((spo2: number) => {
    if (spo2 < 90) return "danger" as const;
    return "safe" as const;
  }, []);

  const riskLevel = useMemo(
    () => getRiskLevel(patientData.spo2),
    [patientData.spo2, getRiskLevel],
  );

  /** 위험도별 헤더 설정 */
  const headerConfig = useMemo(
    () =>
      ({
        safe: {
          label: "현재 상태 안정적",
          action: "가정 내 경과 관찰 유지",
          gradient: "from-emerald-500 to-sky-500",
        },
        warning: {
          label: "주의 요망",
          action: "호흡수 변화와 청색증 여부 자주 확인",
          gradient: "from-amber-500 to-orange-500",
        },
        danger: {
          label: "즉시 대응 필요",
          action: "119 신고 및 응급실 이동",
          gradient: "from-rose-500 to-rose-600",
        },
      })[riskLevel],
    [riskLevel],
  );

  /** 초기 안내 문구 */
  const getInitialMessage = useCallback((data: PatientData) => {
    const childName =
      (data as any).name && typeof (data as any).name === "string"
        ? (data as any).name
        : "아이";
    const guardianName =
      (data as any).guardianName &&
      typeof (data as any).guardianName === "string"
        ? (data as any).guardianName
        : "보호자님";

    if (data.spo2 < 90) {
      return `${childName} ${guardianName}, **산소포화도 저하(${data.spo2}%)** 알람이 1분 이상 감지되어 연락드려요.

현재 **호흡수(RR)가 ${data.rr}회**로 높고, 수치를 볼 때 **가래 등 분비물이 기도를 좁게 만들어 발생할 수 있는 현상**이에요.

너무 당황하지 마시고, 침착하게 **먼저 이렇게 해보세요**.

[즉시 행동 가이드]
1. 석션(Suction)을 바로 시행해주세요.
2. 튜브가 꺾이거나 빠지지 않았는지 확인해주세요.

💡 **잠깐, 왜 그럴까요?**
가래가 기도를 막으면 공기 흐름이 차단되어 산소 수치가 급격히 떨어질 수 있습니다. 석션 후 수치 변화를 지켜봐주세요.`;
    }
    return `안녕하세요. 현재 ${childName}의 호흡 상태를 실시간 모니터링 중입니다.

지금 산소포화도 ${data.spo2}%, 호흡수 ${data.rr}회로 안정적인 상태입니다.

평소와 다른 점이 있거나, 궁금한 점이 있으시면 언제든 입력해 주세요.`;
  }, []);

  const isEmergency = patientData.spo2 < 90;
  const prevEmergencyRef = useRef(isEmergency);

  /** spo2 상태에 따라 초기 메시지 리셋 */
  useEffect(() => {
    if (isFirstRender.current || prevEmergencyRef.current !== isEmergency) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: "model",
          text: getInitialMessage(patientData),
          timestamp: new Date(),
        },
      ]);
      prevEmergencyRef.current = isEmergency;
      isFirstRender.current = false;
    }
  }, [isEmergency, getInitialMessage, patientData]);

  /** 스크롤 맨 아래로 */
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, expandedEvidence, scrollToBottom]);

  /** 메시지에서 메인 내용 / 근거 블록 분리 */
  const parseMessageContent = useCallback((text: string) => {
    const splitMarker = "💡 **잠깐, 왜 그럴까요?**";
    if (text.includes(splitMarker)) {
      const parts = text.split(splitMarker);
      return { main: parts[0].trim(), evidence: parts[1].trim() };
    }
    return { main: text, evidence: null as string | null };
  }, []);

  /** 질문 전송 */
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const trimmed = text.trim();

      setSentQuestions((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed],
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
        const aiResponseRaw = await generateMedicalAdvice(trimmed, patientData);
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
        // eslint-disable-next-line no-console
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
    [patientData, isLoading],
  );

  /** 피드백 토글 */
  const handleFeedback = useCallback(
    (messageId: string, type: "positive" | "negative") => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, feedback: msg.feedback === type ? undefined : type }
            : msg,
        ),
      );
    },
    [],
  );

  const toggleEvidence = useCallback((id: string) => {
    setExpandedEvidence((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  /** 추천 질문 */
  const getSuggestions = useCallback(
    (data: PatientData) => {
      const emergencySuggestions = [
        "가래가 많아졌고 호흡이 너무 가빠 보여요",
        "석션 후에도 수치가 안 올라요",
        "응급실에 지금 가야 할까요?",
        "입술이 파랗게 변했어요",
      ];

      const normalSuggestions = [
        "가래가 없어도 석션을 규칙적으로 해야 하나요?",
        "잘 때 호흡기 가습 온도는 몇도가 좋나요?",
        "지난주보다 호흡 상태가 좋아졌나요?",
        "목욕시킬 때 주의할 점 알려줘",
        "응급 상황 대비 물품 리스트 알려줘",
      ];

      const baseList =
        data.spo2 < 90 ? emergencySuggestions : normalSuggestions;
      return baseList.filter((q) => !sentQuestions.includes(q));
    },
    [sentQuestions],
  );

  const suggestions = useMemo(
    () => getSuggestions(patientData),
    [getSuggestions, patientData],
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 상단 헤더 – 여백 확대 */}
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
          onClick={onToggleStatus}
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

      {/* 위험도 헤더 – 좌우 여백도 Layout과 맞춤 */}
      <section className="px-4 sm:px-5 pt-2 pb-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onNavigate("triage")}
          className={`
            w-full flex items-center gap-2.5
            rounded-2xl
            bg-white/95
            border border-slate-100
            shadow-sm
            px-2.5 py-1.75
            active:scale-[0.99]
            transition-all duration-150
          `}
          aria-label="상세 위험도 보기"
        >
          {/* 신호등 아이콘 묶음 */}
          <div className="flex items-center gap-1.5 bg-slate-50/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-slate-200/60">
            <TrafficLightFace type="safe" active={riskLevel === "safe"} />
            <TrafficLightFace type="warning" active={riskLevel === "warning"} />
            <TrafficLightFace type="danger" active={riskLevel === "danger"} />
          </div>

          {/* 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            <p
              className={`
                text-[13px] font-extrabold truncate
                bg-gradient-to-r ${headerConfig.gradient}
                bg-clip-text text-transparent
              `}
            >
              {headerConfig.label}
            </p>
            <p className="text-[11px] text-slate-600 truncate font-medium">
              {headerConfig.action}
            </p>
          </div>

          <div className="flex items-center justify-center text-slate-350">
            <span className="text-sm leading-none">›</span>
          </div>
        </button>
      </section>

      {/* 채팅 영역 – px를 4/5로 맞춰서 전체 라인 통일 */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pt-2.5 pb-3.5 space-y-3"
        onClick={() => setShowMenu(false)}
      >
        {messages.map((msg) => {
          const { main, evidence } = parseMessageContent(msg.text);
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
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
                        msg.feedback === "positive" ? "currentColor" : "none"
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
                        msg.feedback === "negative" ? "currentColor" : "none"
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

        {/* 로딩 인디케이터 */}
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

      {/* 하단 입력 영역 – 상단과 좌우 여백 맞춤 */}
      <div className="relative bg-white/90 backdrop-blur-xl border-t border-white/40 px-4 sm:px-5 pt-3.5 pb-4 shadow-2xl rounded-t-xl">
        {/* 플러스 버튼 메뉴 */}
        {showMenu && (
          <div className="absolute bottom-full left-4 mb-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 min-w-[220px] z-50 space-y-3">
            {/* 상태 기록 입력 메뉴 */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5V3h4v2M3 12h18M9 16h6"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                상태 기록 입력
              </span>
            </button>
            {/* 인공호흡기 상태 분석 메뉴 */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="3" width="18" height="12" rx="2" ry="2" />
                  <path
                    d="M7 9h2l1 3 2-6 2 3h3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect x="3" y="16" width="6" height="4" rx="1" ry="1" />
                  <rect x="15" y="16" width="6" height="4" rx="1" ry="1" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                인공호흡기 상태 분석
              </span>
            </button>
          </div>
        )}

        {/* 추천 질문 – 입력창 바로 위 */}
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
          {/* 플러스 버튼 */}
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

          {/* 입력창 */}
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
              placeholder="증상이나 궁금한 점을 입력하세요..."
              className="w-full bg-white/95 backdrop-blur-sm border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 outline-none placeholder:text-slate-400 placeholder:font-normal tracking-tight transition-all duration-200 shadow-sm"
              disabled={isLoading}
              aria-label="메시지 입력"
            />
          </div>

          {/* 전송 버튼 */}
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
    </div>
  );
};

export default EmrScreen;
