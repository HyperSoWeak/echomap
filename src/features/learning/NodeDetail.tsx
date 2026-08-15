import { type Dispatch, useState } from "react";
import { CheckCircle2, Clock3, Play } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { DEMO_CONCEPT_EPISODES, DEMO_CONCEPT_GRAPH, DEMO_EPISODES, PRIMARY_CONCEPT_ID } from "./demo-data";
import type { AppAction, Course } from "./types";

export function NodeDetail({ course, dispatch }: { course: Course; dispatch: Dispatch<AppAction> }) {
  const node = course.nodes.find((item) => item.conceptId === PRIMARY_CONCEPT_ID);
  const completedCount = DEMO_EPISODES.filter((episode) => episode.completed).length;
  const byId = Object.fromEntries(DEMO_CONCEPT_GRAPH.nodes.map((item) => [item.id, item]));

  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const selectedConcept = selectedConceptId ? byId[selectedConceptId] : null;
  const activeEpisodes = selectedConcept ? DEMO_CONCEPT_EPISODES[selectedConcept.id] ?? DEMO_EPISODES : DEMO_EPISODES;

  return (
    <>
      <AppHeader backLabel="返回學習地圖" onBack={() => dispatch({ type: "navigateBack" })} />
      <section className="screen node-screen">
        <section className="node-summary" aria-label="AI Agent 設計">
          <p className="prequiz-eyebrow">{course.prompt}</p>
          <div className="node-summary-main">
            <div>
              <h1>{node?.title} 設計</h1>
              <p className="support-copy">先看知識點關係，再照集數往下學。</p>
            </div>
            <button className="button-primary node-primary-action" type="button" onClick={() => dispatch({ type: "lessonOpened" })}>
              <Play className="node-action-icon" aria-hidden="true" />
              開始第一課
            </button>
          </div>
          <p className="node-summary-meta">{completedCount} / {DEMO_EPISODES.length} 集完成 · {DEMO_CONCEPT_GRAPH.nodes.length} 個概念</p>
        </section>

        <section className="concept-graph-card" aria-label="Concept map">
          <div className="node-section-heading">
            <div>
              <p className="eyebrow">Concept map</p>
              <h2>推薦知識點</h2>
            </div>
          </div>
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
        </section>

        <section className="episode-section" aria-label="集數內容">
          <div className="node-section-heading">
            <div>
              <p className="eyebrow">Episodes</p>
              <h2>集數內容</h2>
            </div>
            {selectedConcept ? (
              <button type="button" className="text-action" onClick={() => setSelectedConceptId(null)}>
                {selectedConcept.title} · 顯示全部
              </button>
            ) : null}
          </div>
          <div className="episode-scroll" aria-label={(selectedConcept?.title ?? node?.title) + " 集數內容"}>
            {activeEpisodes.map((episode, index) => (
              <button type="button" key={episode.id} className="episode-tile" onClick={() => dispatch({ type: "lessonOpened" })}>
                <span className="episode-number">{String(index + 1).padStart(2, "0")}</span>
                <strong>{episode.title}</strong>
                <p>{episode.description}</p>
                <div className="episode-tile-meta">
                  <span className="episode-duration">
                    <Clock3 className="episode-meta-icon" aria-hidden="true" />
                    {episode.durationMinutes} 分鐘
                  </span>
                  {episode.completed ? <CheckCircle2 className="episode-complete-icon" aria-label="已完成" /> : null}
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
