// src/services/geminiService.ts

import { GoogleGenAI } from "@google/genai";
import { PatientData } from "../types";

// 💡 시스템 인스트럭션: AI의 페르소나와 모든 규칙을 정의합니다.
const SYSTEM_INSTRUCTION = `
You are **V.Doc AI**, a warm, empathetic, and efficient pediatric home care specialist.

- 아동 보호자에게 **이해하기 쉽고 친절하게** 대답하지만, 너무 아동스러운 말투는 자제합니다.
- 응답의 주요 목적은 **정확하고 시의적절한 조언**을 제공하는 것입니다.
- 의사처럼 **진단하거나 판단하지 마세요**. 가능성만 제시하고 그 이유를 누구나 알기 쉽게 타당하게 알려주세요.
- 위험 시나리오에서는 **응급실 방문**을 강력히 권고하고, 그 이유를 아이의 현재 수치나 증상과 연결하여 **아주 타당하게 제시**해야 합니다.
- **인공호흡기 압력, P-Peak 등** 관련 기술적인 언급은 절대 하지 마세요.

**General Rule:**
Always output in **Korean**. Keep the main part **under 150 characters** if possible.
`;

export const generateMedicalAdvice = async (
  query: string,
  patientData: PatientData
): Promise<string> => {
  // 1. 환경변수에서 키 읽기
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing. Switching to Demo Mode.");
    return handleDemoFallback(query);
  }

  try {
    // 2. 클라이언트 생성 (키가 string임을 단언)
    const ai = new GoogleGenAI({ apiKey: apiKey as string });

    // 3. AI에게 전달할 실시간 환자 데이터 컨텍스트 생성 (P-Peak 제거됨)
    const context = `
[Patient Profile]
- Name: ${patientData.name} (${patientData.age}yo)
- Diagnosis: ${patientData.emrDiagnosis}
- Lung Compliance: ${patientData.compliance}

[Real-time Vitals]
- SpO2: ${patientData.spo2}% (Target: >95%, Danger: <90%)
- Respiratory Rate (RR): ${patientData.rr} bpm
    `;

    const fullUserPrompt = `System Context:\n${context}\n\nUser Query: ${query}`;

    // 4. API 호출
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // contents: Chat Completions API 표준 형식으로 데이터 전달
      contents: [{ role: "user", parts: [{ text: fullUserPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    // 5. 응답 텍스트 반환
    return result.text;
  } catch (error) {
    console.error("🚨 Gemini API Error:", error);
    return handleDemoFallback(query);
  }
};

// 💡 데모/오류 발생 시 대체 응답 로직
const handleDemoFallback = (query: string): string => {
  if (query.includes("가래") || query.includes("호흡")) {
    return `(데모 모드: AI 연결 실패) 많이 걱정되시죠? 😢

✅ **먼저 확인해주세요**
1. **석션(흡인)**을 먼저 시행해주세요.
2. 튜브가 꺾이지 않았는지 확인해주세요.

증상이 계속되면 의료진에게 연락하세요!`;
  }

  return `(데모 모드: AI 연결 실패) 현재 통신 상태가 원활하지 않아요. 😢

✅ **권장 조치**
1. 아이의 **호흡 상태**를 직접 확인해주세요.
2. **산소포화도**가 90% 이상인지 체크해주세요.

응급 상황이라면 즉시 119에 연락하세요!`;
};