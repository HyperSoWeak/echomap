# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                  # dev server on 0.0.0.0:3000
pnpm build && pnpm start  # production build / serve
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint
pnpm test:run             # vitest, single run
pnpm test:e2e             # playwright (testDir ./tests/e2e does not exist yet)

pnpm vitest run src/features/learning/state.test.ts   # one file
pnpm vitest run -t "opens the map"                    # one test by name
```

`.env.local` (copied from `.env.example`) needs `OPENAI_API_KEY`; the four `OPENAI_*_MODEL`/`VOICE` variables have working defaults in `src/lib/server/openai.ts`.

## Architecture

EchoMap is a mobile-first, voice-driven learning PWA. The whole product is one client-side state machine; the server exists only as a thin authenticated proxy to OpenAI.

### Client

- `src/app/page.tsx` mounts `LearningApp`, the single screen host. `state.screen` (`library | preQuiz | map | lesson`) decides what renders — there is no routing, so URLs never change.
- `src/features/learning/state.ts` holds every state transition in one reducer. All product rules live here, not in components; components dispatch actions and render.
- `storage.ts` persists the whole `AppState` to localStorage under a version gate — bump `STORAGE_VERSION` when the shape in `types.ts` changes, or old payloads are silently dropped on load.
- `demo-data.ts` is the single source of curriculum. Every course created from the library gets a copy of `DEMO_NODES`, and `DEMO_CONCEPT_IDS` is also the zod enum the model must choose from server-side. Adding a concept means touching this file only, but it changes the API contract.
- Lesson audio is browser `SpeechSynthesis`, not a real audio file — only the Q&A answers come from OpenAI TTS.

### Server

| Route | Does |
| --- | --- |
| `POST /api/transcribe` | multipart audio + `durationSeconds` → transcript |
| `POST /api/answer` | transcript + course context → structured answer |
| `POST /api/speech` | text → streamed mp3 |
| `GET /api/health` | deploy probe |

`src/lib/server/openai.ts` owns all OpenAI calls. `createCourseAnswer` constrains output with `zodTextFormat`, so the model can only return a `conceptId` from `DEMO_CONCEPT_IDS`.

### The adaptive rule spans three files

Asking about the same concept twice must escalate. `createCourseAnswer` picks `exampleAnswer` over `plainAnswer` when `conceptQuestionCounts[conceptId] > 0` (server); the reducer flips the node to `stuck` at count >= 2 (client); `RemedialSheet` then offers to splice `DEMO_REMEDIAL_NODE` into the map. Changing one side without the others breaks the demo's core story.

### PWA

`src/app/manifest.ts` (metadata route), `public/sw.js` (app-shell cache, skips `/api/*` and non-GET), and `ServiceWorkerRegistrar` which registers only in production so dev HMR is unaffected. Bump the `CACHE` constant in `sw.js` when precached assets change.

## Gotchas

- **Audio filename determines transcription format.** OpenAI picks its decoder from the extension, and iOS Safari's MediaRecorder emits `audio/mp4` while Chrome emits `audio/webm`. `VoiceQuestion.tsx` derives the extension from the blob MIME subtype — hardcoding it breaks iPhone recording with a generic 502.
- **Failures are invisible.** Every route `catch` swallows the underlying error and returns a generic 502; nothing is logged. When an AI route misbehaves, reproduce the call against `api.openai.com` directly to see the real message.
- **A working-looking UI may be faking it.** When `/api/answer` fails, `VoiceQuestion.tsx` silently substitutes `FALLBACK_ANSWERS` from `demo-data.ts`. Check the network response, not the screen, when verifying model changes.
- **Transcription returns Simplified Chinese** even with `language: "zh"`, though the app is zh-TW throughout.
- **3 tests in `LearningApp.test.tsx` fail** on `main`. They assert pre-migration copy (e.g. a `1 / 5` step counter that the design migration replaced with dots), not broken logic.
- `next dev` regenerates `AGENTS.md` and appends its managed block to this file. `AGENTS.md` is gitignored; keep the block below intact so the tree stays clean.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
