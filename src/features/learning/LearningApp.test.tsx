import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LearningApp } from "./LearningApp";
import { createInitialState, learningReducer } from "./state";
import { STORAGE_KEY, STORAGE_VERSION } from "./storage";
import type { AppState } from "./types";

function courseAtFollowUp(): AppState {
  return learningReducer(createInitialState(), {
    type: "courseCreated",
    id: "course-1",
    prompt: "自主機器人",
    createdAt: "2026-08-15T00:00:00.000Z",
  });
}

function twoCourseLibrary(): AppState {
  let state = courseAtFollowUp();
  state = learningReducer(state, {
    type: "courseCreated",
    id: "course-2",
    prompt: "量子力學",
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

  it("turns a typed prompt into generated follow-up questions", async () => {
    const user = userEvent.setup();
    render(<LearningApp />);
    await user.click(
      await screen.findByRole("button", { name: "新增課程" }),
    );
    await user.type(screen.getByLabelText("你想學什麼？"), "自主機器人");
    await user.click(screen.getByRole("button", { name: "開始規劃" }));

    expect(screen.getByText("正在理解你的目標")).toBeVisible();
    expect(
      await screen.findByText("先確認起點", {}, { timeout: 3000 }),
    ).toBeVisible();
    expect(screen.getByText("「自主機器人」")).toBeVisible();
  });

  it("opens the map only after every follow-up is answered", async () => {
    const user = userEvent.setup();
    render(<LearningApp initialState={courseAtFollowUp()} />);

    for (const option of [
      "完全沒接觸",
      "工作專案",
      "能自己動手",
      "15 分鐘",
    ]) {
      await user.click(screen.getByRole("button", { name: option }));
    }

    expect(screen.getByText("正在生成你的學習地圖")).toBeVisible();
    expect(
      await screen.findByRole("heading", { name: "自主機器人" }, { timeout: 3000 }),
    ).toBeVisible();
    expect(screen.getByRole("navigation", { name: "學習地圖" })).toBeVisible();
  });

  it("renders multiple stored courses and opens the selected record", async () => {
    const user = userEvent.setup();
    render(<LearningApp initialState={twoCourseLibrary()} />);

    expect(screen.getByText("自主機器人")).toBeVisible();
    expect(screen.getByText("量子力學")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "開啟量子力學" }));

    expect(await screen.findByText("先確認起點")).toBeVisible();
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
