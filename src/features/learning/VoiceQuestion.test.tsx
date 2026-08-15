import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_NODES, PRIMARY_CONCEPT_ID } from "./demo-data";
import { VoiceQuestion } from "./VoiceQuestion";
import type { Course } from "./types";

function course(): Course {
  return {
    id: "course-1",
    prompt: "AI Agent 核心概念",
    createdAt: "2026-08-15T00:00:00.000Z",
    followUpAnswers: [],
    nodes: DEMO_NODES,
    episodeProgressSeconds: 0,
    conceptQuestionCounts: {},
    questionRecords: [],
    remedialNodeAdded: false,
  };
}

function mockAnswerFetch() {
  const fetchMock = vi.fn(async (url: string | URL | Request) => {
    if (String(url) === "/api/answer") {
      return Response.json({
        conceptId: PRIMARY_CONCEPT_ID,
        plainAnswer: "這是一段辨識成功後的回答，說明 Agent 會依照目標規劃、使用工具、讀取結果，並在需要時重新調整。",
        exampleAnswer: "例如規劃旅行時，Agent 會先確認日期和預算，再查交通與天氣，最後整理成可檢查的行程。",
        selectedAnswer: "這是一段辨識成功後的回答，說明 Agent 會依照目標規劃、使用工具、讀取結果，並在需要時重新調整。",
        selectedStyle: "plain",
      });
    }

    return new Response(new Blob(["audio"], { type: "audio/mpeg" }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("VoiceQuestion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps successful answers available when speech playback fails and allows another question", async () => {
    const user = userEvent.setup();
    const fetchMock = mockAnswerFetch();
    const dispatch = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:answer"),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal(
      "Audio",
      vi.fn().mockImplementation(() => ({
        play: vi.fn().mockRejectedValue(new Error("NotAllowedError")),
      })),
    );

    render(
      <VoiceQuestion
        course={course()}
        dispatch={dispatch}
        playbackPosition={12}
        wasPlaying={false}
        pauseLesson={vi.fn()}
        resumeLesson={vi.fn()}
      />,
    );

    const firstQuestion = screen.getByRole("button", {
      name: "所以只要會呼叫工具，就算 Agent 嗎？",
    });
    await user.click(firstQuestion);

    expect(await screen.findByText(/這是一段辨識成功後的回答/)).toBeVisible();
    expect(screen.queryByText("沒有成功收到問題，請重試或選擇下方建議問題。")).toBeNull();
    await waitFor(() => expect(firstQuestion).toBeEnabled());

    await user.click(firstQuestion);

    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
