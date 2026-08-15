import { type Dispatch, useEffect, useRef, useState } from "react";
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

function clampProgress(seconds: number, durationSeconds: number) {
  return Math.min(Math.max(0, seconds), durationSeconds);
}

export function LessonPlayer({ course, dispatch }: LessonPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(DEMO_EPISODE.durationSeconds);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isPlaying) return;
    if (Math.abs(audio.currentTime - course.episodeProgressSeconds) > 0.5) {
      audio.currentTime = course.episodeProgressSeconds;
    }
  }, [course.episodeProgressSeconds, isPlaying]);

  function play() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = course.episodeProgressSeconds;
    setIsPlaying(true);
    void audio.play().catch(() => setIsPlaying(false));
  }

  function pause() {
    setIsPlaying(false);
    audioRef.current?.pause();
  }

  function seek(deltaSeconds: number) {
    const seconds = clampProgress(course.episodeProgressSeconds + deltaSeconds, durationSeconds);
    if (audioRef.current) audioRef.current.currentTime = seconds;
    dispatch({
      type: "episodeProgressed",
      seconds,
    });
  }

  function progressAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    dispatch({
      type: "episodeProgressed",
      seconds: Math.floor(clampProgress(audio.currentTime, durationSeconds)),
    });
  }

  function loadAudioMetadata() {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    setDurationSeconds(Math.floor(audio.duration));
  }

  function completeAudio() {
    setIsPlaying(false);
    dispatch({ type: "episodeCompleted" });
  }

  const stuck = course.nodes.some((node) => node.status === "stuck");
  const progress = (course.episodeProgressSeconds / durationSeconds) * 100;

  return (
    <>
      <AppHeader backLabel="返回學習地圖" onBack={() => dispatch({ type: "navigateBack" })} />
      <section className="screen lesson-screen">
        <p className="prequiz-eyebrow">AI Agent 核心概念 / Episode 01</p>
        <div className="lesson-heading"><p className="eyebrow">Now learning</p><h1>AI Agent</h1><p className="support-copy">理解模型回答和 Agent 完成任務的差異</p></div>

        <article className="episode-card">
          <span className="episode-thumb" aria-hidden="true">1</span>
          <div><span className="episode-number">EP. 01</span><h2>{DEMO_EPISODE.title}</h2><p>{DEMO_EPISODE.description}</p></div>
        </article>

        <div className="player-card">
          <audio
            ref={audioRef}
            aria-label="課程音檔"
            preload="metadata"
            src={DEMO_EPISODE.audioSrc}
            onLoadedMetadata={loadAudioMetadata}
            onTimeUpdate={progressAudio}
            onEnded={completeAudio}
          />
          <div className="waveform" aria-label="課程音訊波形">
            {bars.map((height, index) => <span key={index} className={index / bars.length * 100 <= progress ? "played" : ""} style={{ height }} />)}
          </div>
          <div className="timeline"><span style={{ width: progress + "%" }} /></div>
          <div className="player-times"><span>{formatTime(course.episodeProgressSeconds)}</span><span>{formatTime(durationSeconds)}</span></div>
          <div className="transport">
            <button className="transport-button" type="button" aria-label="上一段" onClick={() => seek(-10)}>−10</button>
            <button className="play-button" type="button" onClick={isPlaying ? pause : play}><span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>{isPlaying ? "暫停" : "播放"}</button>
            <button className="transport-button" type="button" aria-label="下一段" onClick={() => seek(10)}>+10</button>
          </div>
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
