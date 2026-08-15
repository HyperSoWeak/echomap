export function RemedialSheet({ onAccept }: { onAccept: () => void }) {
  return (
    <aside className="remedial-sheet" aria-labelledby="remedial-title">
      <span className="sheet-handle" aria-hidden="true" />
      <p className="eyebrow">Adaptive learning</p>
      <h2 id="remedial-title">這個概念需要補強</h2>
      <p>你已經兩次問到 AI Agent 的循環。我們可以加入一個生活例子的短練習。</p>
      <button className="button-primary sheet-action" type="button" onClick={onAccept}>加入補強節點</button>
    </aside>
  );
}
