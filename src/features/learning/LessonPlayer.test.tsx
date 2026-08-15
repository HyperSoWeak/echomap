import { fireEvent, render, screen } from "@testing-library/react";
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
  it("uses the episode audio source for playback", () => {
    render(<LessonPlayer course={courseAt(0)} dispatch={vi.fn()} />);

    const audio = screen.getByLabelText("課程音檔");
    expect(audio).toHaveAttribute("src", "/audio/demo-lesson.wav");
  });

  it("plays the episode audio when playback starts", async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();

    render(<LessonPlayer course={courseAt(0)} dispatch={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /播放/ }));

    expect(play).toHaveBeenCalledOnce();
  });

  it("uses the loaded audio duration in the player timeline", () => {
    render(<LessonPlayer course={courseAt(0)} dispatch={vi.fn()} />);

    const audio = screen.getByLabelText("課程音檔");
    Object.defineProperty(audio, "duration", { configurable: true, value: 54 });
    fireEvent.loadedMetadata(audio);

    expect(screen.getByText("0:54")).toBeInTheDocument();
  });

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
