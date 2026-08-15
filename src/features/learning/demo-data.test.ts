import { describe, expect, it } from "vitest";
import {
  DEMO_CONCEPT_GRAPH,
  DEMO_EPISODE,
  DEMO_NODES,
  FALLBACK_ANSWERS,
  FOLLOW_UP_QUESTIONS,
  PRIMARY_CONCEPT_ID,
  SUGGESTED_QUESTIONS,
} from "./demo-data";

describe("AI Agent mock content", () => {
  it("uses the ai-agents roadmap as the prepared learning path", () => {
    expect(PRIMARY_CONCEPT_ID).toBe("ai-agent");
    expect(DEMO_NODES.map((node) => node.conceptId)).toEqual([
      "ai-model",
      "llm",
      "ai-agent",
      "agent-loop",
      "goal-clarification",
      "task-decomposition",
      "tool-selection",
      "working-memory",
      "result-validation",
      "safe-agent",
      "agent-workflow",
    ]);
  });

  it("exposes AI Agent course scripts and interruption examples", () => {
    expect(DEMO_CONCEPT_GRAPH.nodes).toHaveLength(8);
    expect(DEMO_CONCEPT_GRAPH.nodes.map((node) => node.id)).toContain(
      "prompt-injection-risk",
    );
    expect(DEMO_EPISODE.title).toBe("第一課：回答問題和完成任務有何不同");
    expect(DEMO_EPISODE.transcript).toContain("Agent 的重點不只是產生一段文字");
    expect(SUGGESTED_QUESTIONS).toContain("所以只要會呼叫工具，就算 Agent 嗎？");
    expect(FALLBACK_ANSWERS.plain).toContain("單次按照固定規則呼叫工具");
  });

  it("uses the ai-agents prompt questions for onboarding", () => {
    expect(FOLLOW_UP_QUESTIONS.map((question) => question.question)).toEqual([
      "AI Agent 和一般問答系統最大的差別可能是什麼？",
      "Agent 要查詢即時天氣，最適合怎麼做？",
      "Agent 準備替使用者寄出重要信件前，應該優先做什麼？",
      "工具執行失敗時，Agent 應該怎麼做？",
      "你最想先設計哪一種 Agent？",
    ]);
  });
});
