import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { DEMO_CONCEPT_IDS, DEMO_EPISODE } from "@/features/learning/demo-data";

const CourseAnswer = z.object({
  conceptId: z.enum(DEMO_CONCEPT_IDS),
  plainAnswer: z.string().min(1).max(500),
  exampleAnswer: z.string().min(1).max(500),
});

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export async function transcribeAudio(file: File) {
  const transcription = await getClient().audio.transcriptions.create({
    file,
    model: process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-transcribe",
    language: "zh",
  });
  return transcription.text.trim();
}

export async function createCourseAnswer(input: {
  transcript: string;
  courseTitle: string;
  conceptQuestionCounts: Record<string, number>;
}) {
  const response = await getClient().responses.parse({
    model: process.env.OPENAI_ANSWER_MODEL || "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content:
          "你是繁體中文語音課程助教。只根據提供的固定課程摘要回答，語氣自然、精簡且適合口語播放。plainAnswer 直接解釋概念；exampleAnswer 必須再用一個日常具體例子解釋。兩者各不超過 120 個中文字。conceptId 必須選最相關的概念。",
      },
      {
        role: "user",
        content: JSON.stringify({
          courseTitle: input.courseTitle,
          courseSummary: DEMO_EPISODE.transcript,
          concepts: DEMO_CONCEPT_IDS,
          question: input.transcript,
        }),
      },
    ],
    text: { format: zodTextFormat(CourseAnswer, "course_answer") },
  });

  const answer = response.output_parsed;
  if (!answer) throw new Error("OpenAI returned no structured answer");
  const selectedStyle =
    (input.conceptQuestionCounts[answer.conceptId] ?? 0) > 0
      ? "example"
      : "plain";

  return {
    ...answer,
    selectedAnswer:
      selectedStyle === "example" ? answer.exampleAnswer : answer.plainAnswer,
    selectedStyle,
  } as const;
}

export async function synthesizeSpeech(text: string) {
  return getClient().audio.speech.create({
    model: process.env.OPENAI_SPEECH_MODEL || "gpt-4o-mini-tts",
    voice: process.env.OPENAI_SPEECH_VOICE || "coral",
    input: text,
    instructions: "以自然、清楚、友善的台灣繁體中文教學語氣朗讀。",
    response_format: "mp3",
  });
}
