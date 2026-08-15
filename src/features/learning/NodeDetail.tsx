import { type Dispatch, useState } from "react";
import { Clock3, Heart, Play } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { DEMO_CONCEPT_EPISODES, DEMO_CONCEPT_GRAPH, DEMO_EPISODES, PRIMARY_CONCEPT_ID } from "./demo-data";
import type { AppAction, Course } from "./types";

export function NodeDetail({ course, dispatch }: { course: Course; dispatch: Dispatch<AppAction> }) {
  const node = course.nodes.find((item) => item.conceptId === PRIMARY_CONCEPT_ID);
  const completedCount = DEMO_EPISODES.filter((episode) => episode.completed).length;
  const progress = Math.round((completedCount / DEMO_EPISODES.length) * 1000) / 10;
  const byId = Object.fromEntries(DEMO_CONCEPT_GRAPH.nodes.map((item) => [item.id, item]));

  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const selectedConcept = selectedConceptId ? byId[selectedConceptId] : null;
  const activeEpisodes = selectedConcept ? DEMO_CONCEPT_EPISODES[selectedConcept.id] ?? DEMO_EPISODES : DEMO_EPISODES;

  return (
    <>
      <AppHeader backLabel="返回學習地圖" onBack={() => dispatch({ type: "navigateBack" })} />
      <section className="screen node-screen">
        <p className="prequiz-eyebrow">{course.prompt} / {node?.title}</p>
        <div className="lesson-heading node-heading">
          <h1>{node?.title}<span className="node-tag">設計</span></h1>
          <p className="support-copy">現在全部都是尚未學習狀態。每聽完一段、每問一次問題，狀態將會立即更新。</p>
        </div>

        <div className="topic-stats node-stats">
          <span>此領域涉及 <b>{DEMO_CONCEPT_GRAPH.nodes.length}</b> 個概念</span>
          <span>全部集數 <b>{DEMO_EPISODES.length}</b> 集</span>
          <span>已完成 <b>{completedCount}</b> 集</span>
          <span>進度比例 <b>{progress}%</b></span>
        </div>

        <div className="concept-graph-card">
          <p className="concept-graph-title">針對 {node?.title}，我們推薦你學習的相關知識點</p>
          <div className="concept-graph">
            <svg className="concept-graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {DEMO_CONCEPT_GRAPH.edges.map(([from, to]) => {
                const a = byId[from];
                const b = byId[to];
                return <line key={from + "-" + to} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
              })}
            </svg>
            {DEMO_CONCEPT_GRAPH.nodes.map((item) => (
              <button
                type="button"
                key={item.id}
                className={"concept-node concept-node-" + item.status + (selectedConceptId === item.id ? " concept-node-selected" : "")}
                style={{ left: item.x + "%", top: item.y + "%" }}
                aria-pressed={selectedConceptId === item.id}
                onClick={() => setSelectedConceptId(item.id)}
              >
                <span className="concept-node-circle" aria-hidden="true" />
                <small>{item.title}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="episode-section">
          <div className="episode-section-heading">
            <h2>集數內容</h2>
            {selectedConcept ? (
              <button type="button" className="text-action" onClick={() => setSelectedConceptId(null)}>
                {selectedConcept.title} · 顯示全部
              </button>
            ) : null}
          </div>
          <div className="episode-scroll" aria-label={(selectedConcept?.title ?? node?.title) + " 集數內容"}>
            {activeEpisodes.map((episode, index) => (
              <button type="button" key={episode.id} className="episode-tile" onClick={() => dispatch({ type: "lessonOpened" })}>
                <span className="episode-tile-thumb" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <strong>{episode.title}</strong>
                <p>{episode.description}</p>
                <div className="episode-tile-meta">
                  <span className="episode-duration">
                    <Clock3 className="episode-meta-icon" aria-hidden="true" />
                    {episode.durationMinutes} 分鐘
                  </span>
                  <span className={"episode-like" + (episode.completed ? " episode-like-active" : "")} aria-hidden="true">
                    {episode.completed ? <Heart className="episode-meta-icon" fill="currentColor" /> : <Play className="episode-meta-icon" />}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
