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
    if (!process.env.API_KEY) {
      console.warn("API_KEY is missing. Switching to Demo Mode.");
      throw new Error("Missing API Key");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    // SDK 버전에 따라 response 구조가 다를 수 있어서
    // 필요하면 여기 부분을 `response.response.text()`처럼 바꿔야 할 수도 있습니다.
    // (지금 형태가 동작하고 있다면 그대로 두셔도 됩니다.)
    // @ts-ignore
    return response.text || "죄송합니다. AI 응답을 불러올 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error or Demo Fallback:", error);

    if (query.includes("가래") || query.includes("호흡")) {
      return `(데모 모드: AI 연결 실패) 많이 걱정되시죠? 😢\n\n✅ **먼저 확인해주세요**\n1. **석션(흡인)**을 먼저 시행해주세요.\n2. 튜브가 꺾이지 않았는지 확인해주세요.\n\n증상이 계속되면 의료진에게 연락하세요!`;
    }

    return `(데모 모드: AI 연결 실패) 현재 통신 상태가 원활하지 않아요. 😢\n\n✅ **권장 조치**\n1. 아이의 **호흡 상태**를 직접 확인해주세요.\n2. **산소포화도**가 90% 이상인지 체크해주세요.\n\n응급 상황이라면 즉시 119에 연락하세요!`;
  }
};
