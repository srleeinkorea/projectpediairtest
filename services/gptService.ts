// src/services/gptService.ts
import { PatientData } from "../types";

interface MedicalAdviceResponse {
  answer: string;
  redFlag: boolean;
  safetyNote: string;
  citations?: {
    source: string;
    year?: number;
    note?: string;
  }[];
}

export async function generateMedicalAdvice(
  question: string,
  patient: PatientData
): Promise<MedicalAdviceResponse> {
  const res = await fetch("http://localhost:5174/api/medical-advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, patient }),
  });

  if (!res.ok) {
    throw new Error("의료 안내 API 호출 실패");
  }

  const data = (await res.json()) as MedicalAdviceResponse;
  return data;
}
