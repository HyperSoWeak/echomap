import Image from "next/image";
import { type FormEvent, useState } from "react";
import { AppHeader } from "./AppHeader";
import type { Course } from "./types";

const PROMPT_MAX_LENGTH = 80;

interface CourseLibraryProps {
  courses: Course[];
  onCreate: (prompt: string) => void;
  onSelect: (id: string) => void;
  onReset: () => void;
}

export function CourseLibrary({ courses, onCreate, onSelect, onReset }: CourseLibraryProps) {
  const [showComposer, setShowComposer] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) {
      setError("先描述你想學什麼，一句話就好。");
      return;
    }
    setError("");
    setIsAnalyzing(true);
    window.setTimeout(() => onCreate(value), 1400);
  }

  if (isAnalyzing) {
    return (
      <section className="screen screen-centered" aria-live="polite">
        <div className="creation-orbit" aria-hidden="true"><span /><span /><span /></div>
        <p className="eyebrow">Step 1 / 2</p>
        <h1>正在理解你的目標</h1>
        <p className="support-copy">拆解你的描述，準備幾個問題把方向收斂⋯</p>
      </section>
    );
  }

  return (
    <>
      <AppHeader onReset={courses.length ? onReset : undefined} />
      <section className="screen library-screen">
        <div className="home-hero">
          <div className="wordmark" aria-label="EchoMap">EchoMap</div>
          <p>讓 <strong>EchoMap</strong> 快速掌握你的學習方向與程度</p>
          <button className="hero-start" type="button" onClick={() => setShowComposer(true)}>
            <span>新增課程</span><Image src="/icons/arrow-right.svg" alt="" width={18} height={18} />
          </button>
        </div>

        <div className="home-or-divider" aria-hidden="true"><span>OR</span></div>

        <div className="discovery-heading">
          <p>描述你的目標，開始你的 <strong>聲音學習地圖</strong></p>
        </div>

        <div className="discovery-card">
          {showComposer ? (
            <form className="prompt-form" onSubmit={submit}>
              <label className="prompt-label" htmlFor="learning-prompt">你想學什麼？</label>
              <div className="prompt-shell">
                <textarea
                  id="learning-prompt"
                  autoFocus
                  rows={3}
                  maxLength={PROMPT_MAX_LENGTH}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="例如：我想搞懂 AI agent 怎麼運作，之後能自己做一個"
                />
                <div className="prompt-footer">
                  <span className="prompt-count">{prompt.length} / {PROMPT_MAX_LENGTH}</span>
                  <button className="prompt-submit" type="submit">
                    <span>開始規劃</span><Image src="/icons/arrow-right.svg" alt="" width={16} height={16} />
                  </button>
                </div>
              </div>
              <p className="field-help">接著會有幾個追問，用來決定路徑的深度與順序。</p>
              {error ? <p className="field-error" role="alert">{error}</p> : null}
              <button className="text-action" type="button" onClick={() => setShowComposer(false)}>取消</button>
            </form>
          ) : null}

          <div className="section-heading-row course-section-heading">
            <div><p className="eyebrow">Your maps</p><h1>我的課程</h1></div>
            <span className="course-count">{courses.length} 門</span>
          </div>

          {courses.length === 0 ? (
            <div className="empty-course-card">
              <span className="empty-node" aria-hidden="true" />
              <h2>還沒有課程</h2>
              <p>描述一個目標，建立第一張學習地圖。</p>
            </div>
          ) : (
            <div className="course-list" aria-label="課程列表">
              {courses.map((course, index) => (
                <article className="course-card" key={course.id}>
                  <span className="course-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="course-kicker">學習路徑</p>
                    <h2>{course.prompt}</h2>
                    <p>{course.nodes.filter((node) => node.status === "learned").length} / {course.nodes.length} 個節點完成</p>
                  </div>
                  <button className="course-open" type="button" aria-label={"開啟" + course.prompt} onClick={() => onSelect(course.id)}>
                    <Image src="/icons/arrow-right.svg" alt="" width={20} height={20} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
