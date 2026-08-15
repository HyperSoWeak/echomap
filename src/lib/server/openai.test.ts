import { describe, expect, it } from "vitest";
import { DEMO_EPISODE } from "@/features/learning/demo-data";
import { buildCourseAnswerPrompt } from "./openai";

describe("buildCourseAnswerPrompt", () => {
  it("includes the podcast script and requests longer spoken answers", () => {
    const prompt = buildCourseAnswerPrompt({
      transcript: "Agent 和聊天機器人差在哪？",
      courseTitle: "AI Agent 核心概念",
    });

    expect(prompt.podcastTranscript).toBe(DEMO_EPISODE.transcript);
    expect(prompt.answerLength).toContain("180 到 260");
  });
});
