import { GoogleGenAI } from "@google/genai";
import { PatientData } from "../types";

// Refined SYSTEM_INSTRUCTION for maximum conciseness and clarity
const SYSTEM_INSTRUCTION = `
[역할]
- 가정용 인공호흡기를 사용하는 아동을 위한 **호흡 모니터링 챗봇**입니다.
- **의료진의 진료를 대신하지 않는** 참고용 안내만 제공합니다.
- 항상 **한국어**로 답변합니다.
- 시나리오가 2개로 분류됨, 안정 케이스에서는 산소 수치 저하에 대해 보호자가 질의하게 되는데 이 때 의학적으로 떨어진 이유 관련 타당한 답변을 하면서(체위변경, 기침 등) 1분만에 복구되었고 불편해하는 경우 석션을 지시해줘. 그리고 두번쟤 물어볼떄 안전하다는 점 격려해줘. 근데 단정하지는 말고 병원에 방문하기보다 집에서 경과를 관찰하라고 이런 방어적 어조로 대답해야해

[의학적 판단 방식]
- 가능하면 아이의 **연령별 정상 범위**를 떠올리며 SpO₂, 호흡수, 심박수, 체온을 봅니다.
- **현재 수치 + 최근 추세(잠깐 저하 후 회복인지, 점점 나빠지는지)**를 함께 고려합니다.
- **호흡곤란 징후(청색증, 흉벽 함몰, 콧볼 벌렁거림, 의식 저하)**와
  인공호흡기 **압력·누출·알람 반복** 여부를 같이 생각합니다.
- 진단·치료를 결정하지 말고, **가능성**과 **주의 필요 여부**만 설명합니다.

[톤]
- 말투는 **부드럽고 또렷하게**, 문장은 **짧게**.
- 중요한 단어는 **굵게** 표시합니다.
- "매우 위험", "절대" 같은 단정적 표현 대신  
  **"조금 높아요", "비교적 낮은 편이에요", "증가한 편이에요"**처럼 말합니다.

[응급 기준]
- 아래가 의심되면 1~2개 핵심 질문 후, **119 또는 응급실 방문을 권고**합니다.
  - SpO₂ **90% 이하가 지속**될 때
  - **입술·얼굴이 파랗게** 보일 때
  - **거의 반응이 없거나** 말·울 힘이 없을 때
  - 인공호흡기 알람이 **반복되고**, 아이 상태도 나빠 보일 때

[폰 화면용 답변 구조]
모든 답변은 스마트폰 챗봇 화면에 바로 들어갈 수 있게 작성합니다.

1) **짧은 공감 한 문장**
   - 예: "많이 걱정되시죠?", "지금 상황이 많이 불안하실 것 같아요."

2) **👉 지금 아이 상태 요약 (2~3줄)**
   - 예: "**SpO₂**: 최근 5분 동안 **93% → 97%로 회복 후 유지 중이에요.**
          **호흡수**: 연령에 비해 **조금 빠르지만, 이전보다 안정되는 편이에요.**"

3) **📌 지금 할 일 (2~4줄)**
   - 예: "**석션(흡인)**을 시행한 뒤, **5~10분 동안 SpO₂와 호흡 상태**를 관찰해 주세요."
`;

export const generateMedicalAdvice = async (
  query: string,
  patientData: PatientData
): Promise<string> => {
  try {
    // =========================================================
    // 1) 예지(응급 시나리오) 데모용 하드코딩 로직
    // =========================================================
    const patientName = patientData.name?.trim();

    if (patientName === "예지") {
      const compact = query.replace(/\s+/g, ""); // 공백 제거해서 패턴 매칭

      // (1) 첫 질문: "가래 증가, 호흡 불규칙, 인공호흡기 알람"
      if (
        compact.includes("가래증가") &&
        compact.includes("호흡불규칙") &&
        compact.includes("인공호흡기알람") &&
        !compact.includes("흡인") // 아직 흡인 언급 없음
      ) {
        return [
          "많이 놀라셨죠, 예지 보호자님.",
          "👉 지금 예지는 가래가 늘고 호흡이 고르지 않은 상태에서 인공호흡기 알람까지 지속되는 상황이에요. 기도가 좁아졌거나 인공호흡기 압력이 높아졌을 때 나타날 수 있는 패턴입니다.",

          "📌 먼저 한 가지를 꼭 확인하고 싶어요.",
          "**기도 흡인(석션)을 이미 해보셨나요?**",
          "",
          "아직 석션을 하지 않으셨다면, **바로 기도 흡인(석션)**을 시행해 주세요.",
          "그 후 **1~2분 동안 SpO₂가 90% 이상으로 회복되는지**, 그리고 호흡이 조금 더 규칙적으로 변하는지 함께 관찰해 주세요.",
        ].join("\n");
      }

      // (2) 두 번째 질문: "흡인을 했지만 산소포화도가 88%" 등
      if (
        compact.includes("흡인을했지만") &&
        (compact.includes("산소포화도가88") ||
          compact.includes("spo2가88") ||
          patientData.spo2 <= 88)
      ) {
        return [
          "예지 보호자님, 지금은 **집에서 더 지켜보시기엔 위험한 상황**으로 보입니다.",
          "",
          "예지는 **기도 흡인(석션)을 시행한 뒤에도 SpO₂가 약 88%로 저산소 상태가 계속**되고 있는 상태예요.",
          "이런 경우에는 가정에서의 조치만으로는 충분하지 않고, **응급실에서 빠르게 평가와 치료를 받는 것이 안전합니다.**",
          "",
          "🔴 **현재 위험도: 즉시 응급실 방문 필요**",
          "",
          "📌 지금 권장되는 행동",
          "1) 주변에 도움을 요청하시거나, 바로 **119에 연락**해 주세요. 상단의 건강 위험등 신호를 누르면 근처 응급실을 확인할 수 있어요.",
          "2) 구조대가 도착할 때까지는 **산소 공급과 인공호흡기 연결 상태**를 계속 확인해 주세요.",
          "3) **입술·손끝 색이 더 파래지거나, 반응이 둔해지면** 119에 상황을 다시 알려 긴급하게 도착할 수 있도록 해 주세요.",
          "",
          "이번 상황은 단순 감시보다는, **병원 응급실에서 소아 호흡기 전문 진료를 받는 것이 가장 안전한 선택**입니다.",
        ].join("\n");
      }
    }

    // =========================================================
    // 2) 일반 케이스 → Gemini 호출
    // =========================================================
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY is missing. Switching to Demo Mode.");
      throw new Error("Missing API Key");
    }

    const ai = new GoogleGenAI({ apiKey });

    const context = `
[Patient Profile]
- 환아 이름: ${patientData.name} (${patientData.age}세)
- EMR 진단: ${patientData.emrDiagnosis}
- Lung Compliance: ${patientData.compliance}

[Real-time Vitals]
- SpO₂: ${patientData.spo2}% (Target: >95%, Danger: <90%)
- Respiratory Rate (RR): ${patientData.rr} bpm
- Ventilator: P-Peak ${patientData.p_peak_measured} (Limit: ${patientData.p_peak_threshold})

[이름 사용 규칙]
- 답변에서 아이를 부를 때는 **반드시 "${patientData.name}" 또는 "${patientData.name} 보호자님"**이라고만 부르세요.
- "민성이"처럼 **다른 이름은 절대 사용하지 마세요.**
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `System Context:\n${context}\n\nUser Query: ${query}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    const anyRes = response as any;
    const text =
      anyRes?.response?.text?.() ??
      anyRes?.text ??
      "죄송합니다. AI 응답을 불러올 수 없습니다.";

    return text;
  } catch (error) {
    console.error("Gemini API Error or Demo Fallback:", error);

    if (query.includes("가래") || query.includes("호흡")) {
      return `(데모 모드: AI 연결 실패) 많이 걱정되시죠? 😢\n\n✅ **먼저 확인해주세요**\n1. **석션(흡인)**을 먼저 시행해주세요.\n2. 튜브가 꺾이지 않았는지 확인해주세요.\n\n증상이 계속되면 의료진에게 연락하세요!`;
    }

    return `(데모 모드: AI 연결 실패) 현재 통신 상태가 원활하지 않아요. 😢\n\n✅ **권장 조치**\n1. 아이의 **호흡 상태**를 직접 확인해주세요.\n2. **산소포화도**가 90% 이상인지 체크해주세요.\n\n응급 상황이라면 즉시 119에 연락하세요!`;
  }
};
