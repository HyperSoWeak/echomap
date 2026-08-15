import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEMO_NODES } from "./demo-data";
import { NodeDetail } from "./NodeDetail";
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

describe("NodeDetail", () => {
  it("focuses the page on the concept map and episodes", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    render(<NodeDetail course={course()} dispatch={dispatch} />);

    expect(screen.getByRole("region", { name: "AI Agent 設計" })).toBeVisible();
    expect(screen.getByText("1 / 9 集完成 · 8 個概念")).toBeVisible();
    expect(screen.getByRole("button", { name: "開始第一課" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "課程進度摘要" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Concept map" })).toBeVisible();
    expect(screen.getByRole("region", { name: "集數內容" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "開始第一課" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "lessonOpened" });
  });

  it("marks the selected concept and filters episodes", async () => {
    const user = userEvent.setup();

    render(<NodeDetail course={course()} dispatch={vi.fn()} />);

    const concept = screen.getByRole("button", { name: "工具選擇" });
    expect(concept).toHaveAttribute("aria-pressed", "false");

    await user.click(concept);

    expect(concept).toHaveAttribute("aria-pressed", "true");
    expect(concept).toHaveClass("concept-node-selected");
    expect(screen.getByRole("button", { name: "工具選擇 · 顯示全部" })).toBeVisible();
  });
});
