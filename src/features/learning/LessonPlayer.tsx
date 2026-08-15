import { type Dispatch, useEffect, useState } from "react";
import { AppHeader } from "./AppHeader";
import { DEMO_EPISODE } from "./demo-data";
import { QuestionNotes } from "./QuestionNotes";
import { RemedialSheet } from "./RemedialSheet";
import type { AppAction, Course } from "./types";
import { VoiceQuestion } from "./VoiceQuestion";

const bars = [18, 28, 42, 24, 54, 68, 34, 48, 72, 39, 58, 30, 65, 46, 74, 32, 52, 68, 26, 42, 62, 35, 55, 76, 44, 64, 36, 50, 70, 28];

interface LessonPlayerProps {
  course: Course;
  dispatch: Dispatch<AppAction>;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return Math.floor(safeSeconds / 60) + ":" + String(safeSeconds % 60).padStart(2, "0");
}

export function LessonPlayer({ course, dispatch }: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      const next = Math.min(course.episodeProgressSeconds + 1, DEMO_EPISODE.durationSeconds);
      dispatch({ type: "episodeProgressed", seconds: next });
      if (next >= DEMO_EPISODE.durationSeconds) {
        setIsPlaying(false);
        dispatch({ type: "episodeCompleted" });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [course.episodeProgressSeconds, dispatch, isPlaying]);

  function play() {
    setIsPlaying(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(DEMO_EPISODE.transcript);
      utterance.lang = "zh-TW";
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  }

  function pause() {
    setIsPlaying(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  const stuck = course.nodes.some((node) => node.status === "stuck");
  const progress = (course.episodeProgressSeconds / DEMO_EPISODE.durationSeconds) * 100;

  return (
    <>
      <AppHeader backLabel="返回學習地圖" onBack={() => dispatch({ type: "navigateBack" })} />
      <section className="screen lesson-screen">
        <p className="eyebrow">Now learning</p>
        <h1>AI Agent</h1>
        <p className="support-copy">理解觀察、決策、行動的循環</p>

        <article className="episode-card">
          <span className="episode-number">EP. 01</span>
          <h2>{DEMO_EPISODE.title}</h2>
          <p>{DEMO_EPISODE.description}</p>
        </article>

        <div className="player-card">
          <div className="waveform" aria-label="課程音訊波形">
            {bars.map((height, index) => <span key={index} className={index / bars.length * 100 <= progress ? "played" : ""} style={{ height }} />)}
          </div>
          <div className="timeline"><span style={{ width: progress + "%" }} /></div>
          <div className="player-times"><span>{formatTime(course.episodeProgressSeconds)}</span><span>{formatTime(DEMO_EPISODE.durationSeconds)}</span></div>
          <button className="play-button" type="button" onClick={isPlaying ? pause : play}>
            <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
            {isPlaying ? "暫停課程" : "播放課程"}
          </button>
          <button className="text-action" type="button" onClick={() => setShowTranscript((value) => !value)}>{showTranscript ? "收起文字稿" : "顯示文字稿"}</button>
          {showTranscript ? <p className="lesson-transcript">{DEMO_EPISODE.transcript}</p> : null}
        </div>

        <VoiceQuestion
          course={course}
          dispatch={dispatch}
          playbackPosition={course.episodeProgressSeconds}
          wasPlaying={isPlaying}
          pauseLesson={pause}
          resumeLesson={play}
        />
        <QuestionNotes records={course.questionRecords} />
      </section>
      {stuck && !course.remedialNodeAdded ? <RemedialSheet onAccept={() => dispatch({ type: "remedialAccepted" })} /> : null}
    </>
  );
}
