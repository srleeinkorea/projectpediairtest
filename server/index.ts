// server/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * /api/medical-advice
 * body: { question: string, patient: PatientData }
 */
app.post("/api/medical-advice", async (req, res) => {
  try {
    const { question, patient } = req.body;

    if (!question || !patient) {
      return res.status(400).json({ error: "question과 patient는 필수입니다." });
    }

    // 시스템 프롬프트 – 여기서 역할/안전/근거 요구사항 정의
    const systemPrompt = `
너는 'V.Doc PEDI-AIR'라는 서비스 안에서 동작하는 **소아 만성호흡부전 재택환아용 호흡기 케어 가이드 챗봇**이야.

[역할]
- 보호자에게 현재 상황을 이해하기 쉽게 설명하고,
- 근거 기반의 일반적인 정보와 주의사항을 제공하며,
- 응급 신호가 있으면 지체 없이 119/응급실 방문을 권고해야 한다.
- 실제 진단/처방/개별 치료 계획은 **반드시 담당 의료진**이 결정해야 함을 반복해서 상기시켜야 한다.

[안전 규칙]
- 청색증, 의식저하, 심한 호흡곤란, 경련, 반복 구토, 무반응 등의 증상이 있으면
  -> 무조건 "즉시 119 또는 응급실 방문"을 최우선으로 안내한다.
- 수유, 약 복용, 기계 설정값 등 구체적인 수치를 바꾸는 결정은
  -> "담당 의사/병원"과 상의하도록 안내한다.
- "특정 약 이름 + 용량 + 투여 간격" 처방처럼 보이는 정보는 제시하지 않는다.
- 모호하거나 환자별 차이가 큰 내용은 범용 가이드라인 수준으로만 설명한다.

[근거/출처]
- 대한소아과학회, 대한소아호흡기학회, ATS/ERS 등 권위 있는 가이드라인/교과서 수준의 출처만 언급하도록 노력한다.
- 출처를 쓸 때는 **대략적인 이름과 연도** 수준으로 제시한다.
- 존재하지 않는 논문/가이드라인/기관 이름을 만들어 내지 않는다.
- 확실하지 않은 경우 "정확한 근거가 부족하며, 담당 의료진과 상의가 필요하다"고 명시한다.

[출력 형식]
반드시 아래 JSON 형식으로만 출력해라. 설명 문장 없이 JSON만:

{
  "answer": "보호자에게 직접 보여줄 말투의 한국어 설명. 마크다운 굵게(** **)는 사용해도 되지만, 이모지(이모티콘)는 사용하지 마.",
  "redFlag": true | false,
  "safetyNote": "응급 여부, 병원 방문 필요성에 대한 요약 문장",
  "citations": [
    {
      "source": "대한소아과학회 소아 호흡기 진료지침",
      "year": 2021,
      "note": "가정 인공호흡기 사용 아동의 저산소증 응급 대처 일반 권고"
    }
  ]
}
    `.trim();

    const userContent = `
[보호자 질문]
${question}

[환자 상태 데이터(JSON)]
${JSON.stringify(patient, null, 2)}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // 또는 gpt-4.1
      response_format: { type: "json_object" }, // JSON 모드 :contentReference[oaicite:0]{index=0}
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: "모델 응답이 비어 있습니다." });
    }

    const parsed = JSON.parse(content);

    return res.json(parsed);
  } catch (err: any) {
    console.error("medical-advice error:", err);
    return res
      .status(500)
      .json({ error: "의료 안내 생성 중 오류가 발생했습니다." });
  }
});

const port = process.env.PORT || 5174;
app.listen(port, () => {
  console.log(`Medical advice API server running on http://localhost:${port}`);
});
