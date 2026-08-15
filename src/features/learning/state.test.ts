import { describe, expect, it } from "vitest";
import { FOLLOW_UP_QUESTIONS } from "./demo-data";
import {
  createInitialState,
  learningReducer,
  selectActiveCourse,
} from "./state";
import type { AppState, QuestionRecord } from "./types";

const createdAt = "2026-08-15T00:00:00.000Z";

const FOLLOW_UP_REPLIES = [
  "Agent 能為目標規劃並執行多個步驟",
  "使用可靠的天氣工具取得資料",
  "顯示內容並取得確認",
  "辨認錯誤、嘗試安全替代方案或請求協助",
  "資料蒐集與摘要助理",
];

function createCourseState(): AppState {
  return learningReducer(createInitialState(), {
    type: "courseCreated",
    id: "course-1",
    prompt: "自主機器人",
    createdAt,
  });
}

function createMapState(): AppState {
  let state = createCourseState();
  for (const value of FOLLOW_UP_REPLIES) {
    state = learningReducer(state, { type: "followUpAnswered", value });
  }
  return learningReducer(state, { type: "followUpCompleted" });
}

function questionRecord(id: string): QuestionRecord {
  return {
    id,
    transcript: "什麼是 AI Agent？",
    conceptId: "ai-agent",
    playbackPositionSeconds: 18,
    plainAnswer: "AI Agent 會觀察環境後採取行動。",
    exampleAnswer: "像掃地機器人感測牆壁後轉向。",
    selectedAnswer:
      id === "question-1"
        ? "AI Agent 會觀察環境後採取行動。"
        : "像掃地機器人感測牆壁後轉向。",
    answerStyle: id === "question-1" ? "plain" : "example",
    createdAt,
  };
}

describe("learningReducer", () => {
  it("starts at an empty course library", () => {
    expect(createInitialState()).toEqual({
      courses: [],
      activeCourseId: null,
      screen: "library",
    });
  });

  it("creates separate courses with the typed prompts and the prepared nodes", () => {
    const first = createCourseState();
    const second = learningReducer(first, {
      type: "courseCreated",
      id: "course-2",
      prompt: "量子力學",
      createdAt: "2026-08-15T00:01:00.000Z",
    });

    expect(second.courses.map((course) => course.prompt)).toEqual([
      "自主機器人",
      "量子力學",
    ]);
    expect(second.courses[0].nodes.map((node) => node.conceptId)).toEqual(
      second.courses[1].nodes.map((node) => node.conceptId),
    );
    expect(second.activeCourseId).toBe("course-2");
    expect(second.screen).toBe("followUp");
  });

  it("keeps the map closed until every follow-up is answered", () => {
    let state = createCourseState();
    for (const value of FOLLOW_UP_REPLIES.slice(0, -1)) {
      state = learningReducer(state, { type: "followUpAnswered", value });
    }
    expect(learningReducer(state, { type: "followUpCompleted" }).screen).toBe(
      "followUp",
    );

    state = learningReducer(state, {
      type: "followUpAnswered",
      value: FOLLOW_UP_REPLIES.at(-1)!,
    });
    expect(selectActiveCourse(state)?.followUpAnswers).toHaveLength(
      FOLLOW_UP_QUESTIONS.length,
    );

    state = learningReducer(state, { type: "followUpCompleted" });
    expect(state.screen).toBe("map");
  });

  it("marks a clicked node visited before opening it", () => {
    const state = learningReducer(createMapState(), {
      type: "nodeOpened",
      conceptId: "ai-agent",
    });

    expect(state.screen).toBe("node");
    expect(
      selectActiveCourse(state)?.nodes.find(
        (node) => node.conceptId === "ai-agent",
      )?.status,
    ).toBe("visited");
  });

  it("marks a concept stuck only on its second question", () => {
    let state = createMapState();
    state = learningReducer(state, {
      type: "questionAnswered",
      record: questionRecord("question-1"),
    });
    expect(selectActiveCourse(state)?.conceptQuestionCounts["ai-agent"]).toBe(
      1,
    );
    expect(
      selectActiveCourse(state)?.nodes.find(
        (node) => node.conceptId === "ai-agent",
      )?.status,
    ).toBe("unlearned");

    state = learningReducer(state, {
      type: "questionAnswered",
      record: questionRecord("question-2"),
    });
    expect(selectActiveCourse(state)?.conceptQuestionCounts["ai-agent"]).toBe(
      2,
    );
    expect(
      selectActiveCourse(state)?.nodes.find(
        (node) => node.conceptId === "ai-agent",
      )?.status,
    ).toBe("stuck");
    expect(selectActiveCourse(state)?.questionRecords).toHaveLength(2);
  });

  it("inserts one remedial node immediately after the stuck concept", () => {
    let state = createMapState();
    state = learningReducer(state, {
      type: "questionAnswered",
      record: questionRecord("question-1"),
    });
    state = learningReducer(state, {
      type: "questionAnswered",
      record: questionRecord("question-2"),
    });
    state = learningReducer(state, { type: "remedialAccepted" });
    state = learningReducer(state, { type: "remedialAccepted" });

    const course = selectActiveCourse(state);
    const parentIndex = course?.nodes.findIndex(
      (node) => node.conceptId === "ai-agent",
    );
    expect(course?.remedialNodeAdded).toBe(true);
    expect(course?.nodes[parentIndex! + 1].id).toBe("ai-agent-remedial");
    expect(
      course?.nodes.filter((node) => node.id === "ai-agent-remedial"),
    ).toHaveLength(1);
  });

  it("preserves stuck when the episode completes", () => {
    let state = createMapState();
    state = learningReducer(state, {
      type: "questionAnswered",
      record: questionRecord("question-1"),
    });
    state = learningReducer(state, {
      type: "questionAnswered",
      record: questionRecord("question-2"),
    });
    state = learningReducer(state, { type: "episodeCompleted" });

    expect(
      selectActiveCourse(state)?.nodes.find(
        (node) => node.conceptId === "ai-agent",
      )?.status,
    ).toBe("stuck");
  });

  it("resets to a clean library", () => {
    const state = learningReducer(createMapState(), { type: "reset" });
    expect(state).toEqual(createInitialState());
  });
});
