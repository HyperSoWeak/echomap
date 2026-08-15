import { type Dispatch, useRef, useState } from "react";
import { DEMO_CONCEPT_IDS, FALLBACK_ANSWERS, SUGGESTED_QUESTIONS } from "./demo-data";
import type { AppAction, Course, QuestionRecord } from "./types";

type VoicePhase = "idle" | "recording" | "transcribing" | "answering" | "speaking" | "error";

interface AnswerResult {
  conceptId: string;
  plainAnswer: string;
  exampleAnswer: string;
  selectedAnswer: string;
  selectedStyle: "plain" | "example";
}

interface VoiceQuestionProps {
  course: Course;
  dispatch: Dispatch<AppAction>;
  playbackPosition: number;
  wasPlaying: boolean;
  pauseLesson: () => void;
  resumeLesson: () => void;
}

const phaseLabels: Record<VoicePhase, string> = {
  idle: "按住提問",
  recording: "放開送出",
  transcribing: "正在聽懂你的問題",
  answering: "正在整理回答",
  speaking: "正在播放回答",
  error: "再試一次",
};

export function VoiceQuestion({ course, dispatch, playbackPosition, wasPlaying, pauseLesson, resumeLesson }: VoiceQuestionProps) {
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const cutoffRef = useRef<number | null>(null);

  async function ask(question: string, audio?: Blob, durationSeconds?: number) {
    let recognized = question;
    pauseLesson();
    setMessage("");
    try {
      if (audio) {
        setPhase("transcribing");
        const form = new FormData();
        // Transcription picks its decoder from the extension, and iOS Safari records audio/mp4 rather than webm.
        const extension = audio.type.split(";")[0].split("/")[1] || "webm";
        form.set("audio", audio, `question.${extension}`);
        form.set("durationSeconds", String(durationSeconds ?? 0));
        const response = await fetch("/api/transcribe", { method: "POST", body: form });
        if (!response.ok) throw new Error("transcription");
        recognized = ((await response.json()) as { transcript: string }).transcript;
      }
      setTranscript(recognized);
      setPhase("answering");
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transcript: recognized,
          courseTitle: course.title,
          allowedConceptIds: DEMO_CONCEPT_IDS,
          conceptQuestionCounts: course.conceptQuestionCounts,
        }),
      });
      let result: AnswerResult;
      if (response.ok) {
        result = (await response.json()) as AnswerResult;
      } else {
        const repeated = (course.conceptQuestionCounts["agent-loop"] ?? 0) > 0;
        result = {
          conceptId: "agent-loop",
          plainAnswer: FALLBACK_ANSWERS.plain,
          exampleAnswer: FALLBACK_ANSWERS.example,
          selectedAnswer: repeated ? FALLBACK_ANSWERS.example : FALLBACK_ANSWERS.plain,
          selectedStyle: repeated ? "example" : "plain",
        };
        setMessage("AI 回答暫時無法連線，先顯示固定 demo 回答。");
      }
      setAnswer(result.selectedAnswer);
      const record: QuestionRecord = {
        id: crypto.randomUUID(),
        transcript: recognized,
        conceptId: result.conceptId,
        playbackPositionSeconds: playbackPosition,
        plainAnswer: result.plainAnswer,
        exampleAnswer: result.exampleAnswer,
        selectedAnswer: result.selectedAnswer,
        answerStyle: result.selectedStyle,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "questionAnswered", record });
      setPhase("speaking");
      const speech = await fetch("/api/speech", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: result.selectedAnswer }),
      });
      if (!speech.ok) throw new Error("speech");
      const url = URL.createObjectURL(await speech.blob());
      const audioPlayer = new Audio(url);
      audioPlayer.onended = () => {
        URL.revokeObjectURL(url);
        setPhase("idle");
        if (wasPlaying) resumeLesson();
      };
      await audioPlayer.play();
    } catch (error) {
      setPhase("error");
      if (error instanceof Error && error.message === "speech") {
        setMessage("語音暫時無法播放，文字回答已保留。");
      } else {
        setMessage("沒有成功收到問題，請重試或選擇下方建議問題。");
      }
    }
  }

  async function startRecording() {
    if (phase !== "idle" && phase !== "error") return;
    pauseLesson();
    setTranscript("");
    setAnswer("");
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const duration = Math.min((Date.now() - startedAtRef.current) / 1000, 30);
        void ask("", new Blob(chunksRef.current, { type: recorder.mimeType }), duration);
      };
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setPhase("recording");
      cutoffRef.current = window.setTimeout(stopRecording, 30_000);
    } catch {
      setPhase("error");
      setMessage("無法使用麥克風，請允許權限或選擇建議問題。");
    }
  }

  function stopRecording() {
    if (cutoffRef.current) window.clearTimeout(cutoffRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  return (
    <section className="voice-question" aria-labelledby="voice-title">
      <div className="answer-panel" aria-live="polite">
        <p className="eyebrow">Ask while listening</p>
        <h2 id="voice-title">聽不懂，就直接問</h2>
        {transcript ? <p className="transcript">「{transcript}」</p> : <p className="support-copy">按住下方麥克風說話，放開後會即時回答。</p>}
        {answer ? <p className="answer-copy">{answer}</p> : null}
        {message ? <p className="voice-message">{message}</p> : null}
      </div>
      <button
        className={"mic-button mic-" + phase}
        type="button"
        onPointerDown={() => void startRecording()}
        onPointerUp={stopRecording}
        onPointerCancel={stopRecording}
        aria-label={phaseLabels[phase]}
      >
        <span className="mic-symbol" aria-hidden="true" />
        <span>{phaseLabels[phase]}</span>
      </button>
      <div className="suggested-questions">
        <p>也可以選一個問題</p>
        {SUGGESTED_QUESTIONS.map((question) => (
          <button type="button" key={question} disabled={phase === "answering" || phase === "speaking" || phase === "transcribing"} onClick={() => void ask(question)}>{question}</button>
        ))}
      </div>
      {phase === "error" && answer ? <button className="text-action" type="button" onClick={() => { setPhase("idle"); if (wasPlaying) resumeLesson(); }}>繼續播放</button> : null}
    </section>
  );
}
