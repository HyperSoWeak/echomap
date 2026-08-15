"use client";

import { useEffect, useReducer, useState } from "react";
import { CourseLibrary } from "./CourseLibrary";
import { FollowUp } from "./FollowUp";
import { LearningMap } from "./LearningMap";
import { LessonPlayer } from "./LessonPlayer";
import { NodeDetail } from "./NodeDetail";
import { createInitialState, learningReducer, selectActiveCourse } from "./state";
import { clearState, loadState, saveState } from "./storage";
import type { AppState } from "./types";

export function LearningApp({ initialState }: { initialState?: AppState }) {
  const [state, dispatch] = useReducer(learningReducer, initialState ?? createInitialState());
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const course = selectActiveCourse(state);

  useEffect(() => {
    if (initialState) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const saved = loadState();
      if (saved) dispatch({ type: "hydrated", state: saved });
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [initialState]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.courses.length) saveState(state);
    else clearState();
  }, [hydrated, state]);

  if (!hydrated) return <section className="screen screen-centered"><div className="loading-node" /><p>讀取你的學習地圖⋯</p></section>;

  if (state.screen === "followUp" && course) {
    return (
      <FollowUp
        prompt={course.prompt}
        answers={course.followUpAnswers}
        onBack={() => dispatch({ type: "followUpBack" })}
        onExit={() => dispatch({ type: "navigateBack" })}
        onAnswer={(value) => dispatch({ type: "followUpAnswered", value })}
        onComplete={() => dispatch({ type: "followUpCompleted" })}
      />
    );
  }
  if (state.screen === "map" && course) return <LearningMap course={course} dispatch={dispatch} />;
  if (state.screen === "node" && course) return <NodeDetail course={course} dispatch={dispatch} />;
  if (state.screen === "lesson" && course) return <LessonPlayer course={course} dispatch={dispatch} />;

  return (
    <CourseLibrary
      courses={state.courses}
      onCreate={(prompt) => dispatch({ type: "courseCreated", id: crypto.randomUUID(), prompt, createdAt: new Date().toISOString() })}
      onSelect={(id) => dispatch({ type: "courseSelected", id })}
      onReset={() => dispatch({ type: "reset" })}
    />
  );
}
