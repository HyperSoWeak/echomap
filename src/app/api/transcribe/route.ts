import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/server/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const durationSeconds = Number(form.get("durationSeconds"));

    if (
      !(audio instanceof File) ||
      !audio.type.startsWith("audio/") ||
      audio.size === 0 ||
      audio.size > 5 * 1024 * 1024 ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0 ||
      durationSeconds > 30.5
    ) {
      return NextResponse.json(
        { error: { code: "invalid_audio", message: "請提供 30 秒內的錄音。" } },
        { status: 400 },
      );
    }

    const transcript = await transcribeAudio(audio);
    if (!transcript) {
      return NextResponse.json(
        { error: { code: "empty_transcript", message: "沒有辨識到語音。" } },
        { status: 422 },
      );
    }
    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json(
      { error: { code: "transcription_failed", message: "語音辨識暫時無法使用。" } },
      { status: 502 },
    );
  }
}
