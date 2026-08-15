import type { Dispatch } from "react";
import { AppHeader } from "./AppHeader";
import { PRIMARY_CONCEPT_ID } from "./demo-data";
import type { AppAction, Course } from "./types";

const labels = { learned: "已完成", visited: "已點過", unlearned: "未學習", stuck: "卡住" } as const;

export function LearningMap({ course, dispatch }: { course: Course; dispatch: Dispatch<AppAction> }) {
  return (
    <>
      <AppHeader backLabel="返回課程列表" onBack={() => dispatch({ type: "navigateBack" })} />
      <section className="screen map-screen">
        <div className="prequiz-flow map-flow">
          <p className="prequiz-eyebrow">Generated Map</p>
          <div className="prequiz-card map-card">
            <p className="eyebrow">我的個人學習路徑</p>
            <h1>{course.prompt}</h1>
            <p className="support-copy">點選 AI Agent，開始第一集聲音課程。</p>
            <div className="topic-stats">
              <span>知識節點 <b>{course.nodes.length}</b></span>
              <span>已完成 <b>{course.nodes.filter((node) => node.status === "learned").length}</b></span>
              <span>提問紀錄 <b>{course.questionRecords.length}</b></span>
            </div>
            <nav className="learning-path" aria-label="學習地圖">
              {course.nodes.map((node) => (
                <button
                  type="button"
                  key={node.id}
                  className={"map-node map-node-" + node.status + (node.kind === "remedial" ? " map-node-remedial" : "")}
                  data-concept={node.conceptId}
                  aria-label={node.title + " 節點，" + labels[node.status]}
                  onClick={() => node.conceptId === PRIMARY_CONCEPT_ID ? dispatch({ type: "nodeOpened", conceptId: node.conceptId }) : undefined}
                >
                  <span className="map-node-circle" aria-hidden="true" />
                  <span className="map-node-copy"><strong>{node.title}</strong><small>{node.kind === "remedial" ? "新增補強" : labels[node.status]}</small></span>
                </button>
              ))}
            </nav>
            <div className="map-legend"><span><i className="legend-learned" />懂了</span><span><i className="legend-visited" />點過</span><span><i className="legend-stuck" />卡過</span><span><i className="legend-unlearned" />還沒學</span></div>
            {course.questionRecords.length ? <div className="map-insight"><b>{course.questionRecords.length}</b><p>你的提問正在改變這張地圖。</p></div> : null}
          </div>
        </div>
      </section>
    </>
  );
}
