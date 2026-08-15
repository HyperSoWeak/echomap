import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_CONCEPT_IDS } from "@/features/learning/demo-data";
import { createCourseAnswer } from "@/lib/server/openai";
import { checkRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const AnswerRequest = z.object({
  transcript: z.string().trim().min(1).max(500),
  courseTitle: z.string().trim().min(1).max(100),
  allowedConceptIds: z.array(z.enum(DEMO_CONCEPT_IDS)).length(DEMO_CONCEPT_IDS.length),
  conceptQuestionCounts: z.record(z.string(), z.number().int().min(0).max(100)),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(request);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "請稍後再試。" } },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const input = AnswerRequest.parse(await request.json());
    const answer = await createCourseAnswer(input);
    return NextResponse.json(answer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "invalid_request", message: "問題格式不正確。" } },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: { code: "answer_failed", message: "AI 回答暫時無法使用。" } },
      { status: 502 },
    );
  }
}
