# Mobile Audio Learning Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Build a mobile-first Next.js MVP that uses fixed local course content, real OpenAI voice Q&A, local Docker development, and a Railway-ready production image.

**Architecture:** A single App Router application owns the client guided flow and three server-side OpenAI proxy routes. A reducer and versioned localStorage keep deterministic multi-course progress; server wrappers isolate OpenAI, validation, and in-memory rate limiting so route contracts are testable without network access.

**Tech Stack:** Next.js 16, React 19, TypeScript, pnpm, OpenAI Node SDK, Zod, Vitest, Testing Library, Playwright, CSS, Docker, Railway

---

## File Map

- **package.json**, **pnpm-lock.yaml**: pinned application and test dependencies plus scripts.
- **next.config.ts**, **tsconfig.json**, **eslint.config.mjs**: Next.js standalone production output and strict TypeScript/lint configuration.
- **vitest.config.ts**, **vitest.setup.ts**, **playwright.config.ts**: unit/component/API and mobile E2E test setup.
- **src/app/layout.tsx**, **src/app/page.tsx**, **src/app/globals.css**: root metadata, entry page, Figma-derived tokens, and centered mobile shell.
- **src/features/learning/types.ts**: persisted domain types and reducer actions.
- **src/features/learning/demo-data.ts**: fixed placeholder quiz, nodes, episode, concepts, suggested questions, and fallback answers.
- **src/features/learning/state.ts**: initial state, reducer, status transitions, reset behavior.
- **src/features/learning/storage.ts**: schema-versioned localStorage load/save.
- **src/features/learning/LearningApp.tsx**: provider boundary, hydration, screen routing, reset.
- **src/features/learning/CourseLibrary.tsx**: multi-course library and add-course creation state.
- **src/features/learning/PreQuiz.tsx**: reusable five-step wizard.
- **src/features/learning/LearningMap.tsx**: zig-zag map, node status, course and notes entry points.
- **src/features/learning/LessonPlayer.tsx**: placeholder playback, progress, waveform, notes, and voice panel composition.
- **src/features/learning/VoiceQuestion.tsx**: push-to-talk, suggested questions, API sequence, streamed speech playback, and resume.
- **src/features/learning/QuestionNotes.tsx**: question record presentation.
- **src/features/learning/RemedialSheet.tsx**: stuck-concept suggestion and remedial insertion.
- **src/lib/server/openai.ts**: server-only OpenAI SDK calls and structured answer schema.
- **src/lib/server/rate-limit.ts**: 30 requests per IP per 10-minute in-memory limiter.
- **src/lib/server/request.ts**: IP extraction, body-size and JSON validation helpers.
- **src/app/api/transcribe/route.ts**, **src/app/api/answer/route.ts**, **src/app/api/speech/route.ts**: protected API handlers.
- **src/app/api/health/route.ts**: deployment health endpoint without OpenAI dependency.
- **public/audio/demo-lesson.wav**: intentional local placeholder lesson track.
- **tests/e2e/demo-flow.spec.ts**: 390px end-to-end suggested-question workflow.
- **Dockerfile**, **compose.yaml**, **.dockerignore**, **railway.json**: development and production container paths.
- **.env.example**, **README.md**: local setup, OpenAI variables, Railway connection, and main-branch autodeploy.

### Task 1: Scaffold Next.js and Test Tooling

**Files:**
- Create: **package.json**
- Create: **next.config.ts**
- Create: **tsconfig.json**
- Create: **next-env.d.ts**
- Create: **eslint.config.mjs**
- Create: **vitest.config.ts**
- Create: **vitest.setup.ts**
- Create: **playwright.config.ts**
- Create: **src/app/layout.tsx**
- Create: **src/app/page.tsx**
- Create: **src/app/globals.css**
- Test: **src/app/page.test.tsx**

- [ ] **Step 1: Write a failing smoke test**

~~~tsx
import { render, screen } from "@testing-library/react";
import Home from "./page";

it("renders the learning application entry", () => {
  render(<Home />);
  expect(screen.getByRole("main", { name: "Learn Audio Map" })).toBeVisible();
});
~~~

- [ ] **Step 2: Install dependencies and verify the test fails**

Run:

~~~bash
pnpm install
pnpm test:run src/app/page.test.tsx
~~~

Expected: FAIL because **src/app/page.tsx** does not exist.

- [ ] **Step 3: Add strict project configuration and the minimum page**

Use scripts:

~~~json
{
  "scripts": {
    "dev": "next dev --hostname 0.0.0.0",
    "build": "next build",
    "start": "next start --hostname 0.0.0.0",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  }
}
~~~

Use standalone production output:

~~~ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
~~~

Implement the entry:

~~~tsx
export default function Home() {
  return (
    <main aria-label="Learn Audio Map">
      <h1>Learn Audio Map</h1>
    </main>
  );
}
~~~

- [ ] **Step 4: Run the scaffold checks**

Run:

~~~bash
pnpm test:run src/app/page.test.tsx
pnpm typecheck
pnpm lint
~~~

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

~~~bash
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json next-env.d.ts eslint.config.mjs vitest.config.ts vitest.setup.ts playwright.config.ts src/app
git commit -m "build: scaffold next application"
~~~

### Task 2: Add Deterministic Course State and Persistence

**Files:**
- Create: **src/features/learning/types.ts**
- Create: **src/features/learning/demo-data.ts**
- Create: **src/features/learning/state.ts**
- Create: **src/features/learning/storage.ts**
- Test: **src/features/learning/state.test.ts**
- Test: **src/features/learning/storage.test.ts**

- [ ] **Step 1: Write reducer tests for every product transition**

Define tests using these public functions:

~~~ts
import {
  createInitialState,
  learningReducer,
  selectActiveCourse,
} from "./state";

it("creates separate courses that share fixed nodes but preserve titles", () => {
  const first = learningReducer(createInitialState(), {
    type: "courseCreated",
    title: "自主機器人",
    id: "course-1",
    createdAt: "2026-08-15T00:00:00.000Z",
  });
  const second = learningReducer(first, {
    type: "courseCreated",
    title: "量子力學",
    id: "course-2",
    createdAt: "2026-08-15T00:01:00.000Z",
  });
  expect(second.courses.map((course) => course.title)).toEqual([
    "自主機器人",
    "量子力學",
  ]);
  expect(second.courses[0].nodes.map((node) => node.conceptId)).toEqual(
    second.courses[1].nodes.map((node) => node.conceptId),
  );
});

it("marks a concept stuck on its second question and inserts remediation", () => {
  let state = createCourseReadyState();
  state = learningReducer(state, {
    type: "questionAnswered",
    record: questionRecord("question-1"),
  });
  state = learningReducer(state, {
    type: "questionAnswered",
    record: questionRecord("question-2"),
  });
  expect(selectActiveCourse(state)?.nodes[1].status).toBe("stuck");
  state = learningReducer(state, { type: "remedialAccepted" });
  expect(selectActiveCourse(state)?.remedialNodeAdded).toBe(true);
});
~~~

Add persistence tests:

~~~ts
it("restores matching versioned state", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: STORAGE_VERSION,
    state: createInitialState(),
  }));
  expect(loadState()).toEqual(createInitialState());
});

it("discards an unsupported schema version", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: STORAGE_VERSION - 1,
    state: { courses: [{ invalid: true }] },
  }));
  expect(loadState()).toBeNull();
});
~~~

- [ ] **Step 2: Run tests and confirm missing modules fail**

Run:

~~~bash
pnpm test:run src/features/learning/state.test.ts src/features/learning/storage.test.ts
~~~

Expected: FAIL with unresolved **state** and **storage** modules.

- [ ] **Step 3: Implement fixed data, reducer, selectors, and storage**

Define:

~~~ts
export type Screen =
  | "library"
  | "creating"
  | "preQuiz"
  | "map"
  | "lesson";

export type NodeStatus = "unlearned" | "learned" | "stuck";

export interface QuestionRecord {
  id: string;
  transcript: string;
  conceptId: string;
  playbackPositionSeconds: number;
  plainAnswer: string;
  exampleAnswer: string;
  selectedAnswer: string;
  answerStyle: "plain" | "example";
  createdAt: string;
}

export interface AppState {
  courses: Course[];
  activeCourseId: string | null;
  screen: Screen;
}
~~~

Reducer actions must include **courseCreated**, **courseSelected**, **preQuizAnswered**, **preQuizCompleted**, **nodeSelected**, **lessonOpened**, **episodeProgressed**, **questionAnswered**, **remedialAccepted**, **episodeCompleted**, **navigateBack**, and **reset**. The second **questionAnswered** for a concept sets its node to **stuck**; **episodeCompleted** never overwrites **stuck**.

Persist only this envelope:

~~~ts
export const STORAGE_VERSION = 1;
export const STORAGE_KEY = "learn-audio-map:v1";

interface StoredState {
  version: typeof STORAGE_VERSION;
  state: AppState;
}
~~~

- [ ] **Step 4: Run reducer and storage tests**

Run:

~~~bash
pnpm test:run src/features/learning/state.test.ts src/features/learning/storage.test.ts
~~~

Expected: all state transition and storage-version tests pass.

- [ ] **Step 5: Commit**

~~~bash
git add src/features/learning
git commit -m "feat: add local course state"
~~~

### Task 3: Implement the Figma-Derived Course and Pre-Quiz Flow

**Files:**
- Modify: **src/app/globals.css**
- Modify: **src/app/page.tsx**
- Create: **src/features/learning/LearningApp.tsx**
- Create: **src/features/learning/CourseLibrary.tsx**
- Create: **src/features/learning/PreQuiz.tsx**
- Test: **src/features/learning/LearningApp.test.tsx**

- [ ] **Step 1: Write component tests for the guided entry flow**

~~~tsx
it("adds a titled course and starts the pre-quiz", async () => {
  const user = userEvent.setup();
  render(<LearningApp />);
  await user.click(screen.getByRole("button", { name: "新增課程" }));
  await user.type(screen.getByLabelText("課程主題"), "自主機器人");
  await user.click(screen.getByRole("button", { name: "建立課程" }));
  expect(await screen.findByText("讓我們先認識你")).toBeVisible();
  expect(screen.getByText("1 / 5")).toBeVisible();
});

it("opens the map only after all five answers", async () => {
  render(<LearningApp initialState={courseAtPreQuiz()} />);
  await answerFiveQuizSteps();
  expect(await screen.findByRole("heading", { name: "自主機器人" })).toBeVisible();
  expect(screen.getByRole("navigation", { name: "學習地圖" })).toBeVisible();
});
~~~

- [ ] **Step 2: Run the component tests**

Run:

~~~bash
pnpm test:run src/features/learning/LearningApp.test.tsx
~~~

Expected: FAIL because the components are absent.

- [ ] **Step 3: Implement hydration, library, creation, and five-step quiz**

The page becomes:

~~~tsx
import { LearningApp } from "@/features/learning/LearningApp";

export default function Home() {
  return (
    <main className="app-shell" aria-label="Learn Audio Map">
      <LearningApp />
    </main>
  );
}
~~~

The visual root uses:

~~~css
:root {
  --canvas: #f4f3ee;
  --mint-100: #ccfaf5;
  --mint-300: #81d8d0;
  --mint-400: #67aea8;
  --teal-600: #4e8781;
  --teal-700: #37615d;
  --teal-900: #1e3b39;
  --muted: #7d8583;
  --card: #ffffff;
  --radius-card: 28px;
  --radius-control: 999px;
  --shadow-card: 0 12px 36px rgb(30 59 57 / 9%);
}

.app-shell {
  width: min(100%, 480px);
  min-height: 100dvh;
  margin-inline: auto;
  background: var(--canvas);
}
~~~

The add form validates a trimmed non-empty title, shows a short **正在建立你的學習地圖** state, then dispatches **courseCreated**. Quiz options are one-column buttons with a five-segment progress indicator and immediate next-step navigation.

- [ ] **Step 4: Verify tests and responsive semantics**

Run:

~~~bash
pnpm test:run src/features/learning/LearningApp.test.tsx
pnpm typecheck
pnpm lint
~~~

Expected: component tests pass with no type or lint errors.

- [ ] **Step 5: Commit**

~~~bash
git add src/app src/features/learning
git commit -m "feat: add mobile course onboarding"
~~~

### Task 4: Add Map, Player, Notes, and Remedial UI

**Files:**
- Modify: **src/app/globals.css**
- Modify: **src/features/learning/LearningApp.tsx**
- Create: **src/features/learning/LearningMap.tsx**
- Create: **src/features/learning/LessonPlayer.tsx**
- Create: **src/features/learning/QuestionNotes.tsx**
- Create: **src/features/learning/RemedialSheet.tsx**
- Create: **public/audio/demo-lesson.wav**
- Test: **src/features/learning/LearningMap.test.tsx**
- Test: **src/features/learning/LessonPlayer.test.tsx**

- [ ] **Step 1: Write map and lesson behavior tests**

~~~tsx
it("renders the fixed nodes as a vertical learning path", () => {
  render(<LearningMap course={courseWithStatuses()} dispatch={vi.fn()} />);
  expect(screen.getAllByRole("button", { name: /節點/ })).toHaveLength(7);
  expect(screen.getByText("卡住")).toBeVisible();
});

it("shows real question records and accepts the remedial node", async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  render(<LessonPlayer course={courseWithTwoQuestions()} dispatch={dispatch} />);
  expect(screen.getByText("我的提問紀錄")).toBeVisible();
  expect(screen.getAllByRole("article", { name: /提問/ })).toHaveLength(2);
  await user.click(screen.getByRole("button", { name: "加入補強節點" }));
  expect(dispatch).toHaveBeenCalledWith({ type: "remedialAccepted" });
});
~~~

- [ ] **Step 2: Run the new tests**

Run:

~~~bash
pnpm test:run src/features/learning/LearningMap.test.tsx src/features/learning/LessonPlayer.test.tsx
~~~

Expected: FAIL because map and player modules are absent.

- [ ] **Step 3: Implement the Figma map and podcast motifs**

Render seven circular nodes connected by a thin absolute line. Alternate left/right horizontal alignment while preserving DOM order. Give states text and color, not color alone. Insert the fixed remedial node immediately after its parent concept when **remedialNodeAdded** is true.

Use a native **audio** element for **/audio/demo-lesson.wav**, save **currentTime** through **episodeProgressed**, and dispatch **episodeCompleted** on **ended**. The waveform is an accessible decorative bar group; native duration and current-time text remain readable.

Show **QuestionNotes** directly from **questionRecords**. Show **RemedialSheet** only when a node is **stuck** and no remedial node exists.

- [ ] **Step 4: Run map/player checks**

Run:

~~~bash
pnpm test:run src/features/learning
pnpm typecheck
pnpm lint
~~~

Expected: all learning feature tests pass.

- [ ] **Step 5: Commit**

~~~bash
git add public/audio src/app/globals.css src/features/learning
git commit -m "feat: add learning map and lesson player"
~~~

### Task 5: Add Protected OpenAI Server Functions

**Files:**
- Create: **src/lib/server/openai.ts**
- Create: **src/lib/server/rate-limit.ts**
- Create: **src/lib/server/request.ts**
- Test: **src/lib/server/openai.test.ts**
- Test: **src/lib/server/rate-limit.test.ts**

- [ ] **Step 1: Write structured response and limiter tests**

~~~ts
it("uses example style for a repeated concept", async () => {
  mockParsedAnswer({
    conceptId: "agent-loop",
    plainAnswer: "代理人會觀察後行動。",
    exampleAnswer: "像掃地機器人偵測牆壁後轉向。",
  });
  const answer = await createCourseAnswer(validAnswerInput({
    conceptQuestionCounts: { "agent-loop": 1 },
  }));
  expect(answer.selectedStyle).toBe("example");
  expect(answer.selectedAnswer).toContain("掃地機器人");
});

it("blocks request 31 in the same ten-minute window", () => {
  const limiter = createRateLimiter({ limit: 30, windowMs: 600_000 });
  for (let index = 0; index < 30; index += 1) {
    expect(limiter.check("127.0.0.1", 0).allowed).toBe(true);
  }
  expect(limiter.check("127.0.0.1", 0).allowed).toBe(false);
});
~~~

- [ ] **Step 2: Run server-function tests**

Run:

~~~bash
pnpm test:run src/lib/server
~~~

Expected: FAIL because the server modules do not exist.

- [ ] **Step 3: Implement server-only OpenAI operations**

Export these boundaries:

~~~ts
export async function transcribeAudio(file: File): Promise<string>;

export async function createCourseAnswer(
  input: AnswerRequest,
): Promise<{
  conceptId: string;
  plainAnswer: string;
  exampleAnswer: string;
  selectedAnswer: string;
  selectedStyle: "plain" | "example";
}>;

export async function synthesizeSpeech(
  text: string,
): Promise<ReadableStream<Uint8Array>>;
~~~

Use a Zod enum containing only fixed demo concept IDs. Ask the Responses API for the enum concept plus both answer variants. Select **plain** when the current count is zero and **example** when it is at least one. Read models from **OPENAI_TRANSCRIBE_MODEL**, **OPENAI_ANSWER_MODEL**, **OPENAI_SPEECH_MODEL**, and voice from **OPENAI_SPEECH_VOICE**.

The request helper rejects JSON above 5 MB, audio files above 5 MB, audio duration metadata above 30 seconds, and malformed input. The limiter returns status metadata suitable for **Retry-After**.

- [ ] **Step 4: Run server checks**

Run:

~~~bash
pnpm test:run src/lib/server
pnpm typecheck
pnpm lint
~~~

Expected: all server tests and static checks pass.

- [ ] **Step 5: Commit**

~~~bash
git add src/lib/server
git commit -m "feat: add protected openai services"
~~~

### Task 6: Implement the Three AI Route Contracts

**Files:**
- Create: **src/app/api/transcribe/route.ts**
- Create: **src/app/api/answer/route.ts**
- Create: **src/app/api/speech/route.ts**
- Create: **src/app/api/health/route.ts**
- Test: **src/app/api/transcribe/route.test.ts**
- Test: **src/app/api/answer/route.test.ts**
- Test: **src/app/api/speech/route.test.ts**

- [ ] **Step 1: Write mocked route contract tests**

~~~ts
it("returns a transcript for valid multipart audio", async () => {
  vi.mocked(transcribeAudio).mockResolvedValue("什麼是 AI agent？");
  const form = new FormData();
  form.set("audio", new File(["audio"], "question.webm", { type: "audio/webm" }));
  form.set("durationSeconds", "2.4");
  const response = await POST(new Request("http://test/api/transcribe", {
    method: "POST",
    body: form,
  }));
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    transcript: "什麼是 AI agent？",
  });
});

it("returns the selected answer contract", async () => {
  vi.mocked(createCourseAnswer).mockResolvedValue(answerResult);
  const response = await POST(answerRequest(validAnswerBody));
  await expect(response.json()).resolves.toEqual(answerResult);
});

it("streams speech audio", async () => {
  vi.mocked(synthesizeSpeech).mockResolvedValue(streamOf("mp3"));
  const response = await POST(speechRequest({ text: "代理人的答案" }));
  expect(response.headers.get("content-type")).toBe("audio/mpeg");
  expect(await response.text()).toBe("mp3");
});
~~~

- [ ] **Step 2: Run route tests**

Run:

~~~bash
pnpm test:run src/app/api
~~~

Expected: FAIL because the route handlers are absent.

- [ ] **Step 3: Implement consistent route responses**

Each AI route calls the shared limiter before parsing. Return:

~~~ts
{ error: { code: "invalid_request", message: string } }
~~~

with status 400 for validation, status 429 plus **Retry-After** for rate limit, and status 502 for OpenAI service failure. Do not include raw SDK errors or submitted audio in the response or logs.

The health route returns:

~~~ts
export function GET() {
  return Response.json({ status: "ok" });
}
~~~

- [ ] **Step 4: Run API checks**

Run:

~~~bash
pnpm test:run src/app/api src/lib/server
pnpm typecheck
pnpm lint
~~~

Expected: all route contracts pass and health does not require an API key.

- [ ] **Step 5: Commit**

~~~bash
git add src/app/api
git commit -m "feat: add voice question api routes"
~~~

### Task 7: Connect Push-to-Talk and Dynamic Answers

**Files:**
- Modify: **src/features/learning/LessonPlayer.tsx**
- Create: **src/features/learning/VoiceQuestion.tsx**
- Test: **src/features/learning/VoiceQuestion.test.tsx**

- [ ] **Step 1: Write tests for suggested and recorded question sequences**

~~~tsx
it("uses a suggested question, stores the answer, and resumes playback", async () => {
  mockAnswerFetch(answerResult);
  mockSpeechFetch(new Blob(["mp3"], { type: "audio/mpeg" }));
  const dispatch = vi.fn();
  const lesson = fakeLessonController({ paused: false, currentTime: 18 });
  render(<VoiceQuestion course={courseReady()} dispatch={dispatch} lesson={lesson} />);
  await userEvent.click(screen.getByRole("button", {
    name: "AI agent 和一般程式有什麼不同？",
  }));
  expect(lesson.pause).toHaveBeenCalled();
  expect(await screen.findByText(answerResult.selectedAnswer)).toBeVisible();
  finishSpeechPlayback();
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
    type: "questionAnswered",
  }));
  expect(lesson.play).toHaveBeenCalled();
});

it("shows suggested questions when microphone permission fails", async () => {
  mockGetUserMediaRejected();
  render(<VoiceQuestion course={courseReady()} dispatch={vi.fn()} lesson={fakeLessonController()} />);
  await userEvent.pointer([
    { keys: "[MouseLeft>]", target: screen.getByRole("button", { name: "按住提問" }) },
    { keys: "[/MouseLeft]" },
  ]);
  expect(await screen.findByText("也可以選一個問題")).toBeVisible();
});
~~~

- [ ] **Step 2: Run voice component tests**

Run:

~~~bash
pnpm test:run src/features/learning/VoiceQuestion.test.tsx
~~~

Expected: FAIL because **VoiceQuestion** is absent.

- [ ] **Step 3: Implement the 30-second voice state machine**

Use explicit UI phases:

~~~ts
type VoicePhase =
  | "idle"
  | "recording"
  | "transcribing"
  | "answering"
  | "speaking"
  | "error";
~~~

On pointer/key press, request mono audio, start **MediaRecorder**, pause the lesson, and start a 30-second cutoff. On release, stop recorder and tracks, send multipart audio and measured duration, then post the transcript and course context to **/api/answer**. Display transcript and selected answer before posting the answer text to **/api/speech**. Play the returned object URL, revoke it at completion, dispatch one **questionAnswered**, and resume the lesson only if it had been playing.

Suggested questions begin at the answer request and use the same state update and speech path. Answer request failures use the fixed concept fallback with style selected from current count. Speech failures retain visible text and expose **繼續播放**.

- [ ] **Step 4: Run voice and learning checks**

Run:

~~~bash
pnpm test:run src/features/learning
pnpm typecheck
pnpm lint
~~~

Expected: voice state tests, reducer tests, and component tests pass.

- [ ] **Step 5: Commit**

~~~bash
git add src/features/learning
git commit -m "feat: connect realtime voice questions"
~~~

### Task 8: Add Docker, Railway, and Operator Documentation

**Files:**
- Create: **Dockerfile**
- Create: **compose.yaml**
- Create: **.dockerignore**
- Create: **railway.json**
- Create: **.env.example**
- Create: **README.md**
- Modify: **.gitignore**
- Test: **tests/config/deployment.test.ts**

- [ ] **Step 1: Write deployment configuration tests**

~~~ts
it("uses the development target for compose", () => {
  expect(compose.services.app.build.target).toBe("development");
  expect(compose.services.app.command).toEqual(["pnpm", "dev"]);
});

it("configures Railway health checks and Docker builds", () => {
  expect(railway.build.builder).toBe("DOCKERFILE");
  expect(railway.deploy.healthcheckPath).toBe("/api/health");
});
~~~

- [ ] **Step 2: Run configuration tests**

Run:

~~~bash
pnpm test:run tests/config/deployment.test.ts
~~~

Expected: FAIL because the deployment files are absent.

- [ ] **Step 3: Implement development and production container paths**

Docker stages:

~~~dockerfile
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "dev"]

FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
~~~

Compose mounts source and an anonymous **/app/node_modules** volume, maps port 3000, and loads optional **.env.local**. Railway config uses Dockerfile builder, restart on failure, **/api/health**, and a 100-second health timeout.

README must contain exact commands:

~~~bash
cp .env.example .env.local
docker compose up --build
pnpm install
pnpm dev
~~~

It must also explain the one-time Railway sequence: create project from GitHub repo, select branch **main**, add **OPENAI_API_KEY** and model/voice variables, generate a public domain, then verify a later push to **main** triggers a deployment.

- [ ] **Step 4: Verify deployment files**

Run:

~~~bash
pnpm test:run tests/config/deployment.test.ts
docker compose config
pnpm typecheck
pnpm lint
~~~

Expected: test passes and Compose renders valid configuration.

- [ ] **Step 5: Commit**

~~~bash
git add Dockerfile compose.yaml .dockerignore railway.json .env.example README.md .gitignore tests/config
git commit -m "chore: add railway docker deployment"
~~~

### Task 9: Add Mobile E2E Coverage and Finish Visual Fidelity

**Files:**
- Modify: **src/app/globals.css**
- Modify: **src/features/learning/*.tsx**
- Create: **tests/e2e/demo-flow.spec.ts**
- Create: **tests/e2e/storage-version.spec.ts**

- [ ] **Step 1: Write the 390px complete suggested-question test**

~~~ts
test.use({ viewport: { width: 390, height: 844 } });

test("completes onboarding and adds remediation after two questions", async ({ page }) => {
  await mockAiRoutes(page, { conceptId: "agent-loop" });
  await page.goto("/");
  await page.getByRole("button", { name: "新增課程" }).click();
  await page.getByLabel("課程主題").fill("自主機器人");
  await page.getByRole("button", { name: "建立課程" }).click();
  for (let step = 0; step < 5; step += 1) {
    await page.getByRole("button", { name: /選項/ }).first().click();
  }
  await page.getByRole("button", { name: /AI Agent 節點/ }).click();
  await page.getByRole("button", { name: "開始學習" }).click();
  const suggestion = page.getByRole("button", {
    name: "AI agent 和一般程式有什麼不同？",
  });
  await suggestion.click();
  await page.getByRole("button", { name: "完成語音回答" }).click();
  await suggestion.click();
  await page.getByRole("button", { name: "完成語音回答" }).click();
  await expect(page.getByText("這個概念需要補強")).toBeVisible();
  await page.getByRole("button", { name: "加入補強節點" }).click();
  await expect(page.getByText("AI Agent 補強練習")).toBeVisible();
});
~~~

The mocked speech route returns a short audio fixture; the test-only completion control is exposed only when **NEXT_PUBLIC_E2E_AUDIO=true**.

- [ ] **Step 2: Run E2E and capture initial failures**

Run:

~~~bash
pnpm exec playwright install chromium
NEXT_PUBLIC_E2E_AUDIO=true pnpm test:e2e
~~~

Expected: first run identifies any accessible-name, screen-transition, or layout mismatch.

- [ ] **Step 3: Fix only observed workflow and Figma-fidelity gaps**

At 390px, verify:

- no horizontal page overflow;
- touch targets at least 44 by 44 px;
- course cards remain one column;
- map nodes and lines do not overlap labels;
- fixed microphone does not cover notes;
- answer/remedial panels stay inside the shell;
- keyboard focus is visible;
- status is expressed by text plus color;
- desktop width remains a centered maximum of 480px.

Use browser screenshots against the four reference frames and adjust existing tokens, spacing, radii, shadows, font scale, and icon sizing without adding a second visual system.

- [ ] **Step 4: Run the full automated suite**

Run:

~~~bash
pnpm test:run
NEXT_PUBLIC_E2E_AUDIO=true pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
~~~

Expected: every command exits 0.

- [ ] **Step 5: Commit**

~~~bash
git add src tests playwright.config.ts
git commit -m "test: verify mobile demo workflow"
~~~

### Task 10: Production Image, Review, and Main Integration

**Files:**
- Modify only files required by observed verification or review findings.
- Update: **task_plan.md**
- Update: **findings.md**
- Update: **progress.md**

- [ ] **Step 1: Build and smoke-test the final Docker target**

Run:

~~~bash
docker build -t learn-audio-map:verify .
docker run --rm -d --name learn-audio-map-verify -p 3100:3000 -e OPENAI_API_KEY=test learn-audio-map:verify
curl --fail http://127.0.0.1:3100/api/health
docker stop learn-audio-map-verify
~~~

Expected: image builds, health returns **{"status":"ok"}**, and the container stops cleanly.

- [ ] **Step 2: Perform the final acceptance audit**

Run:

~~~bash
pnpm test:run
NEXT_PUBLIC_E2E_AUDIO=true pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
git status --short
git log --oneline --decorate -12
~~~

Expected: all checks pass, only intentional planning-log updates remain, and commits are small Conventional Commits.

- [ ] **Step 3: Review security and user-visible failure paths**

Confirm from source and tests:

- browser bundles never reference **OPENAI_API_KEY**;
- AI routes reject malformed/oversized requests and rate-limit by IP;
- API errors do not expose SDK internals;
- mic failure exposes suggested questions;
- answer failure uses deterministic fixed answer;
- speech failure preserves the visible answer and resume action;
- reset removes the versioned localStorage key.

- [ ] **Step 4: Integrate the feature branch into main**

From the original repository:

~~~bash
git checkout main
git merge --ff-only feat/0-mobile-audio-map
git status --short
~~~

Expected: **main** advances by fast-forward and remains clean. Do not push without an explicitly configured remote; once the repository remote and Railway service are connected, **git push origin main** is the deployment trigger.

- [ ] **Step 5: Record final evidence**

Update **task_plan.md** phases to complete, list test commands and outputs in **progress.md**, record any model/API compatibility decision in **findings.md**, then commit:

~~~bash
git add task_plan.md findings.md progress.md
git commit -m "docs: record implementation verification"
~~~

