import type { QuestionRecord } from "./types";

export function QuestionNotes({ records }: { records: QuestionRecord[] }) {
  return (
    <section className="notes-section" aria-labelledby="notes-title">
      <div className="section-heading-row compact-row">
        <div><p className="eyebrow">Notes</p><h2 id="notes-title">我的提問紀錄</h2></div>
        <span className="course-count">{records.length} 則</span>
      </div>
      {records.length === 0 ? (
        <div className="notes-empty">提問後，問題與回答會自動整理在這裡。</div>
      ) : (
        <div className="notes-list">
          {records.map((record, index) => (
            <article key={record.id} aria-label={"提問 " + (index + 1)}>
              <span className="note-time">{Math.floor(record.playbackPositionSeconds / 60)}:{String(Math.floor(record.playbackPositionSeconds % 60)).padStart(2, "0")}</span>
              <h3>{record.transcript}</h3>
              <p>{record.selectedAnswer}</p>
              <span className="answer-style">{record.answerStyle === "plain" ? "白話解釋" : "生活例子"}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
