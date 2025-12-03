// services/geminiService.ts
import { PatientData } from "../types";

/**
 * 프론트에서 사용하는 의료 상담 함수
 * - 브라우저 → 같은 도메인의 /api/medical-advice 로 요청
 * - 실제 로직은 Vercel 서버리스 함수에서 처리
 */
export async function generateMedicalAdvice(
  message: string,
  patientData: PatientData,
): Promise<string> {
  try {
    const res = await fetch("/api/medical-advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, patientData }),
    });

    if (!res.ok) {
      console.error("API 응답 에러:", res.status, res.statusText);
      throw new Error("API 요청 실패");
    }

    const data = await res.json();

    if (typeof data.reply === "string" && data.reply.trim().length > 0) {
      return data.reply.trim();
    }

    return "답변을 정상적으로 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } catch (err) {
    console.error("generateMedicalAdvice 요청 중 에러:", err);
    throw err;
  }
}
