import type { Dispatch } from "react";
import { AppHeader } from "./AppHeader";
import type { AppAction, Course } from "./types";

const labels = { learned: "已完成", unlearned: "未學習", stuck: "卡住" } as const;

export function LearningMap({ course, dispatch }: { course: Course; dispatch: Dispatch<AppAction> }) {
  return (
    <>
      <AppHeader backLabel="返回課程列表" onBack={() => dispatch({ type: "navigateBack" })} />
      <section className="screen map-screen">
        <p className="eyebrow">我的個人學習路徑</p>
        <h1>{course.title}</h1>
        <p className="support-copy">全域學習地圖 · 點選 AI Agent 開始</p>
        <nav className="learning-path" aria-label="學習地圖">
          {course.nodes.map((node) => (
            <button
              type="button"
              key={node.id}
              className={"map-node map-node-" + node.status + (node.kind === "remedial" ? " map-node-remedial" : "")}
              aria-label={node.title + " 節點，" + labels[node.status]}
              onClick={() => node.conceptId === "agent-loop" ? dispatch({ type: "lessonOpened" }) : undefined}
            >
              <span className="map-node-circle" aria-hidden="true" />
              <span className="map-node-copy"><strong>{node.title}</strong><small>{node.kind === "remedial" ? "新增補強" : labels[node.status]}</small></span>
            </button>
          ))}
        </nav>
        {course.questionRecords.length ? (
          <div className="map-insight"><span>{course.questionRecords.length}</span><p>提問正在改變這張地圖</p></div>
        ) : null}
      </section>
    </>
  );
}
