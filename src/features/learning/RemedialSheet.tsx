export function RemedialSheet({ onAccept }: { onAccept: () => void }) {
  return (
    <aside className="remedial-sheet" aria-labelledby="remedial-title">
      <span className="sheet-handle" aria-hidden="true" />
      <p className="eyebrow">Adaptive learning</p>
      <h2 id="remedial-title">這個概念需要補強</h2>
      <p>你已經數次問到 AI Agent 和自動化流程的差異。我們可以開啟一個生活例子的補強節點。</p>
      <button className="button-primary sheet-action" type="button" onClick={onAccept}>開啟補強節點</button>
    </aside>
  );
}
