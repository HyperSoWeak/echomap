import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LearningApp } from "./LearningApp";
import { createInitialState, learningReducer } from "./state";
import { STORAGE_KEY, STORAGE_VERSION } from "./storage";
import type { AppState } from "./types";

function courseAtPreQuiz(): AppState {
  return learningReducer(createInitialState(), {
    type: "courseCreated",
    id: "course-1",
    title: "自主機器人",
    createdAt: "2026-08-15T00:00:00.000Z",
  });
}

function twoCourseLibrary(): AppState {
  let state = courseAtPreQuiz();
  state = learningReducer(state, {
    type: "courseCreated",
    id: "course-2",
    title: "量子力學",
    createdAt: "2026-08-15T00:01:00.000Z",
  });
  return {
    ...state,
    activeCourseId: null,
    screen: "library",
  };
}

describe("LearningApp onboarding", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows an empty course library with one clear action", async () => {
    render(<LearningApp />);

    expect(await screen.findByRole("heading", { name: "我的課程" })).toBeVisible();
    expect(screen.getByText("還沒有課程")).toBeVisible();
    expect(screen.getByRole("button", { name: "新增課程" })).toBeVisible();
  });

  it("adds a titled course and starts the pre-quiz", async () => {
    const user = userEvent.setup();
    render(<LearningApp />);
    await user.click(
      await screen.findByRole("button", { name: "新增課程" }),
    );
    await user.type(screen.getByLabelText("課程主題"), "自主機器人");
    await user.click(screen.getByRole("button", { name: "建立課程" }));

    expect(screen.getByText("正在建立你的學習地圖")).toBeVisible();
    expect(await screen.findByText("讓我們先認識你")).toBeVisible();
    expect(screen.getByText("1 / 5")).toBeVisible();
  });

  it("opens the map only after all five answers", async () => {
    const user = userEvent.setup();
    render(<LearningApp initialState={courseAtPreQuiz()} />);

    for (const option of [
      "大學生",
      "AI 與機器人",
      "Podcast",
      "理解概念",
      "15 分鐘",
    ]) {
      await user.click(screen.getByRole("button", { name: option }));
    }

    expect(
      await screen.findByRole("heading", { name: "自主機器人" }),
    ).toBeVisible();
    expect(screen.getByRole("navigation", { name: "學習地圖" })).toBeVisible();
  });

  it("renders multiple stored courses and opens the selected record", async () => {
    const user = userEvent.setup();
    render(<LearningApp initialState={twoCourseLibrary()} />);

    expect(screen.getByText("自主機器人")).toBeVisible();
    expect(screen.getByText("量子力學")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "開啟量子力學" }));

    expect(await screen.findByText("讓我們先認識你")).toBeVisible();
  });

  it("restores a versioned course library after hydration", async () => {
    const storedState = twoCourseLibrary();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, state: storedState }),
    );

    render(<LearningApp />);

    await waitFor(() => {
      expect(screen.getByText("自主機器人")).toBeVisible();
      expect(screen.getByText("量子力學")).toBeVisible();
    });
  });
});
