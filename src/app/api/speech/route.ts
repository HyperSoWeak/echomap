import { NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeSpeech } from "@/lib/server/openai";

export const runtime = "nodejs";

const SpeechRequest = z.object({
  text: z.string().trim().min(1).max(1_000),
});

export async function POST(request: Request) {
  try {
    const { text } = SpeechRequest.parse(await request.json());
    const speech = await synthesizeSpeech(text);
    return new Response(speech.body, {
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "invalid_request", message: "朗讀文字格式不正確。" } },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: { code: "speech_failed", message: "語音播放暫時無法使用。" } },
      { status: 502 },
    );
  }
}
