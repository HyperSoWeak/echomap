import Image from "next/image";
import { AppHeader } from "./AppHeader";
import { QUIZ_STEPS } from "./demo-data";

interface PreQuizProps {
  answers: string[];
  onAnswer: (value: string) => void;
  onBack: () => void;
  onExit: () => void;
}

export function PreQuiz({ answers, onAnswer, onBack, onExit }: PreQuizProps) {
  const index = Math.min(answers.length, QUIZ_STEPS.length - 1);
  const step = QUIZ_STEPS[index];

  return (
    <>
      <AppHeader backLabel={answers.length ? "上一題" : "返回課程列表"} onBack={answers.length ? onBack : onExit} />
      <section className="screen quiz-screen">
        <div className="quiz-progress-row">
          <span>{index + 1} / 5</span>
          <div className="quiz-progress" aria-label={"前測第 " + (index + 1) + " 步，共 5 步"}>
            {QUIZ_STEPS.map((item, stepIndex) => <span key={item.id} className={stepIndex <= index ? "is-active" : ""} />)}
          </div>
        </div>
        <div className="quiz-copy">
          <p className="eyebrow">{step.eyebrow}</p>
          <h1>{step.question}</h1>
          <p className="support-copy">{step.description}</p>
        </div>
        <div className="quiz-options">
          {step.options.map((option, optionIndex) => (
            <button type="button" key={option} onClick={() => onAnswer(option)}>
              <span className="option-index">{optionIndex + 1}</span>
              <span>{option}</span>
              <Image src="/icons/arrow-right.svg" alt="" width={20} height={20} />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
