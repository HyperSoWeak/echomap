import Image from "next/image";
import { type FormEvent, useState } from "react";
import { AppHeader } from "./AppHeader";
import type { Course } from "./types";

interface CourseLibraryProps {
  courses: Course[];
  onCreate: (title: string) => void;
  onSelect: (id: string) => void;
  onReset: () => void;
}

export function CourseLibrary({ courses, onCreate, onSelect, onReset }: CourseLibraryProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = title.trim();
    if (!value) {
      setError("請輸入想學的課程主題。");
      return;
    }
    setError("");
    setIsCreating(true);
    window.setTimeout(() => onCreate(value), 360);
  }

  if (isCreating) {
    return (
      <section className="screen screen-centered" aria-live="polite">
        <div className="creation-orbit" aria-hidden="true"><span /><span /><span /></div>
        <p className="eyebrow">固定 Demo 課程</p>
        <h1>正在建立你的學習地圖</h1>
        <p className="support-copy">整理前測、節點與聲音課程中⋯</p>
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
          <button className="hero-start" type="button" onClick={() => setShowForm(true)}>
            <span>新增課程</span><Image src="/icons/arrow-right.svg" alt="" width={18} height={18} />
          </button>
        </div>

        <div className="home-or-divider" aria-hidden="true"><span>OR</span></div>

        <div className="discovery-heading">
          <p>建立主題，開始你的 <strong>聲音學習地圖</strong></p>
        </div>

        <div className="discovery-card">
          {showForm ? (
            <form className="topic-search-form" onSubmit={submit}>
              <label className="sr-only" htmlFor="course-title">課程主題</label>
              <div className="search-input-shell">
                <span className="search-icon" aria-hidden="true" />
                <input id="course-title" autoFocus autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="輸入想學的主題，例如：自主機器人" />
                <button className="search-submit" type="submit" aria-label="建立課程">
                  <Image src="/icons/arrow-right.svg" alt="" width={16} height={16} />
                </button>
              </div>
              <p className="field-help">目前所有主題都會使用同一份固定 demo 內容。</p>
              {error ? <p className="field-error" role="alert">{error}</p> : null}
              <button className="text-action" type="button" onClick={() => setShowForm(false)}>取消</button>
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
              <p>新增一個主題，建立第一張學習地圖。</p>
            </div>
          ) : (
            <div className="course-list" aria-label="課程列表">
              {courses.map((course, index) => (
                <article className="course-card" key={course.id}>
                  <span className="course-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="course-kicker">EchoMap Demo</p>
                    <h2>{course.title}</h2>
                    <p>{course.nodes.filter((node) => node.status === "learned").length} / {course.nodes.length} 個節點完成</p>
                  </div>
                  <button className="course-open" type="button" aria-label={"開啟" + course.title} onClick={() => onSelect(course.id)}>
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
