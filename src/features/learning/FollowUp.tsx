import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { FOLLOW_UP_QUESTIONS } from "./demo-data";

interface FollowUpProps {
  prompt: string;
  answers: string[];
  onAnswer: (value: string) => void;
  onComplete: () => void;
  onBack: () => void;
  onExit: () => void;
}

export function FollowUp({ prompt, answers, onAnswer, onComplete, onBack, onExit }: FollowUpProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const index = Math.min(answers.length, FOLLOW_UP_QUESTIONS.length - 1);
  const step = FOLLOW_UP_QUESTIONS[index];
  const isLast = index === FOLLOW_UP_QUESTIONS.length - 1;

  function choose(option: string) {
    onAnswer(option);
    if (!isLast) return;
    setIsBuilding(true);
    window.setTimeout(onComplete, 1600);
  }

  if (isBuilding) {
    return (
      <section className="screen screen-centered" aria-live="polite">
        <div className="creation-orbit" aria-hidden="true"><span /><span /><span /></div>
        <p className="eyebrow">Step 2 / 2</p>
        <h1>正在生成你的學習地圖</h1>
        <p className="support-copy">依照你的回答排出節點順序與長度⋯</p>
      </section>
    );
  }

  return (
    <>
      <AppHeader backLabel={answers.length ? "上一題" : "返回課程列表"} onBack={answers.length ? onBack : onExit} />
      <section className="screen quiz-screen">
        <div className="prequiz-flow">
          <p className="prequiz-eyebrow">Follow-up {index + 1}</p>
          <p className="prompt-echo">「{prompt}」</p>
          <div className="prequiz-card">
            <div className="quiz-dots" aria-label={"追問第 " + (index + 1) + " 題，共 " + FOLLOW_UP_QUESTIONS.length + " 題"}>
              {FOLLOW_UP_QUESTIONS.map((item, stepIndex) => (
                <div className={"quiz-dot-item" + (stepIndex <= index ? " done" : "")} key={item.id}>
                  <span aria-current={stepIndex === index ? "step" : undefined}>{stepIndex + 1}</span>
                  {stepIndex < FOLLOW_UP_QUESTIONS.length - 1 ? <i aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
            <div className="quiz-copy">
              <p className="eyebrow">{step.eyebrow}</p>
              <h1>{step.question}</h1>
              <p className="support-copy">{step.description}</p>
            </div>
            <div className="quiz-options">
              {step.options.map((option) => (
                <button type="button" key={option} onClick={() => choose(option)}>{option}</button>
              ))}
            </div>
            {isLast ? <p className="prequiz-footnote">最後一題！回答後就會生成你的 <strong>EchoMap</strong> 學習地圖。</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
