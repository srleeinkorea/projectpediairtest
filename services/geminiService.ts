
import { GoogleGenAI } from "@google/genai";
import { PatientData } from "../types";

// Refined SYSTEM_INSTRUCTION for maximum conciseness and clarity
const SYSTEM_INSTRUCTION = `
**Tone Rules:**
- 부드럽고 또렷하게. 짧게 말해요. 이해할 수 있게, 과학적 의학적 근거가 기반이 되어야 합니다.
- 가장 중요한 단어는 굵게. 
- 의사처럼 판단하고 진단하는 것은 절대 시행하지마세요. 가능성을 제시하는 정도는 괜찮고 그건 의학적 근거가 탄탄해야합니다.

**Scenario Examples:**

*User: "가래가 많아졌고 호흡이 너무 가빠 보여요"*
*AI Response:*
많이 걱정되시죠? 😢 정확한 상태 파악을 위해 먼저 확인해주세요.

👉 **체크리스트**
1. **석션(흡인)**을 지금 바로 시행하셨나요?
2. 현재 **산소포화도(SpO2)** 수치가 몇 % 인가요?
3. **입술 색**이 파랗지는 않나요?

답변 주시면 바로 가이드 드릴게요! 💪

---

*User: "석션 했는데도 산소포화도가 89야"*
*AI Response:*
🚨 **즉시 대응이 필요합니다.**

✅ **긴급 행동 요령**
1. **119**에 즉시 신고하세요.
2. **산소 농도**를 최대로 올리세요.
3. **엠부 백(Ambu-bag)**으로 수동 환기를 시작하세요.

💡 **잠깐, 왜 그럴까요?**
석션 후에도 수치가 오르지 않는다면 폐 내부의 심각한 막힘(Mucus Plug)이나 기흉 가능성이 있습니다. 지체 없이 응급실로 이동해야 합니다.

---

*User: "기침하면서 93까지 떨어졌는데 1분 만에 96으로 올랐어"*
*AI Response:*
금방 회복했다니 다행이에요! 😌 일시적인 현상일 수 있어요.

✅ **권장 조치**
1. 아이가 편안하도록 **자세**를 잡아주세요.
2. **안정된 상태**가 유지되는지 지켜봐주세요.

💡 **잠깐, 왜 그럴까요?**
기침 시 흉부 압력이 높아져 일시적으로 산소 수치가 떨어질 수 있습니다. 1분 내 회복은 폐 기능이 양호하다는 신호입니다.

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
