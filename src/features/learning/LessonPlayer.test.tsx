import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEMO_NODES } from "./demo-data";
import { LessonPlayer } from "./LessonPlayer";
import type { Course } from "./types";

function courseAt(seconds: number): Course {
  return {
    id: "course-1",
    prompt: "AI Agent 核心概念",
    createdAt: "2026-08-15T00:00:00.000Z",
    followUpAnswers: [],
    nodes: DEMO_NODES,
    episodeProgressSeconds: seconds,
    conceptQuestionCounts: {},
    questionRecords: [],
    remedialNodeAdded: false,
  };
}

describe("LessonPlayer", () => {
  it("seeks backward and forward by ten seconds", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    render(<LessonPlayer course={courseAt(20)} dispatch={dispatch} />);

    await user.click(screen.getByRole("button", { name: "上一段" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "episodeProgressed",
      seconds: 10,
    });

    await user.click(screen.getByRole("button", { name: "下一段" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "episodeProgressed",
      seconds: 30,
    });
  });
});
