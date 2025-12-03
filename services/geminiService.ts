
import { GoogleGenAI } from "@google/genai";
import { PatientData } from "../types";

// Refined SYSTEM_INSTRUCTION for maximum conciseness and clarity
const SYSTEM_INSTRUCTION = `
**Tone Rules:**
- 부드럽고 또렷하게. 짧게 말해요. 이해할 수 있게, 과학적 의학적 근거가 기반이 되어야 합니다.
- 가장 중요한 단어는 굵게. 
- 의사처럼 판단하고 진단하는 것은 절대 시행하지마세요. 가능성을 제시하는 정도는 괜찮고 그건 의학적 근거가 탄탄해야합니다.
- 매우 높다, 매우 낮다 와 같이 단정적인 단어는 절대 쓰지마세요. 높아요 낮아요 비교적 이런 워딩으로 표현해주세요
- 의학적으로 적절한 답변을 심사숙고해서 제공해주세요.
- 응급상황의 경우 질의두개정도 한 이후에 즉시대응필요 기능을 누를수있게 좀 반짝거리는 효과를 넣어줘

**Scenario Examples:**

*User: "가래가 많아졌고 호흡이 너무 가빠 보여요"* 
*AI Response:*
많이 걱정되시죠? 😢 정확한 상태 파악을 위해 먼저 확인해주세요.

👉 **체크리스트**
1. **석션(흡인)**을 지금 바로 시행하셨나요?
2. 현재 **산소포화도(SpO2)** 수치가 몇 % 인가요?
3. **입술 색**이 파랗지는 않나요?

답변 주시면 바로 가이드 드릴게요! 💪

**Scenario Examples:**
*User: "평소보다 산소 수치가 낮은 것 같아요. 어떡할까요?"

*AI Response:*
위와 유사한 질문이 오면, 산소 수치가 잠깐 떨어졌다가 금방 회복되었다고 대답할 것. 그리고 
많이 걱정되시죠? 😢 1분 전 산소 포화도 수치가 93%였다가 다시 97%로 회복하고 유지 중이에요.


---
 

**General Rule:**
Always output in **Korean**.
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
    - Name: ${patientData.name} (${patientData.age}yo)
    - Diagnosis: ${patientData.emrDiagnosis}
    - Lung Compliance: ${patientData.compliance}

    [Real-time Vitals]
    - SpO2: ${patientData.spo2}% (Target: >95%, Danger: <90%)
    - Respiratory Rate (RR): ${patientData.rr} bpm
    - Ventilator: P-Peak ${patientData.p_peak_measured} (Limit: ${patientData.p_peak_threshold})
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `System Context:\n${context}\n\nUser Query: ${query}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, 
      },
    });

    return response.text || "죄송합니다. AI 응답을 불러올 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error or Demo Fallback:", error);
    
    // Fallback Mock Response for Demo purposes when API Key is missing or fails
    if (query.includes("가래") || query.includes("호흡")) {
        return `(데모 모드: AI 연결 실패) 많이 걱정되시죠? 😢\n\n✅ **먼저 확인해주세요**\n1. **석션(흡인)**을 먼저 시행해주세요.\n2. 튜브가 꺾이지 않았는지 확인해주세요.\n\n증상이 계속되면 의료진에게 연락하세요!`;
    }
    
    return `(데모 모드: AI 연결 실패) 현재 통신 상태가 원활하지 않아요. 😢\n\n✅ **권장 조치**\n1. 아이의 **호흡 상태**를 직접 확인해주세요.\n2. **산소포화도**가 90% 이상인지 체크해주세요.\n\n응급 상황이라면 즉시 119에 연락하세요!`;
  }
};
