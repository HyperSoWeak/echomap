# EchoMap

EchoMap is a mobile-first, voice-driven learning platform. Learners create a course, complete a short diagnostic, follow a generated learning map, and ask questions out loud at any point during a lesson — EchoMap transcribes the question, answers it in the context of the current concept, and speaks the answer back.

## Features

- **Course library** — create and switch between multiple courses, with progress persisted locally per course.
- **Diagnostic pre-quiz** — a five-step assessment that captures the learner's background before the map is opened.
- **Learning map** — an ordered set of concept nodes (core, checkpoint, remedial) tracking `unlearned`, `learned`, and `stuck` states.
- **Voice Q&A during playback** — record a question mid-lesson; EchoMap transcribes it, resolves it to the most relevant concept, and returns both a plain explanation and an example-based explanation.
- **Spoken answers** — answers are synthesized to speech and played back, so the session stays hands-free.
- **Adaptive remediation** — a concept asked about twice is flagged as `stuck`, and EchoMap offers to insert a remedial node into the map right after it.
- **Question notes** — every question, its transcript, playback position, and the answer are recorded for later review.

## Architecture

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Validation | Zod (request schemas and structured model output) |
| AI | OpenAI transcription, structured responses, and text-to-speech |
| Persistence | Browser `localStorage` (versioned schema) |
| Testing | Vitest + Testing Library, Playwright |
| Deployment | Docker, Railway |

### API routes

| Route | Purpose |
| --- | --- |
| `POST /api/transcribe` | Speech-to-text for a recorded question |
| `POST /api/answer` | Structured, concept-scoped answer generation |
| `POST /api/speech` | Text-to-speech for the selected answer |
| `GET /api/health` | Health probe used by the deployment platform |

All AI routes validate their input with Zod before reaching the model.

## Requirements

- Node.js 24
- pnpm 11
- An OpenAI API key

## Getting started

```bash
cp .env.example .env.local
# set OPENAI_API_KEY in .env.local
pnpm install
pnpm dev
```

The application runs at <http://localhost:3000>.

Without an API key the full interface remains navigable and answers fall back to canned responses, but live transcription and speech synthesis are unavailable.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | — | Required for transcription, answers, and speech |
| `OPENAI_ANSWER_MODEL` | `gpt-5.6-luna` | Model used for structured answers |
| `OPENAI_TRANSCRIBE_MODEL` | `gpt-transcribe` | Speech-to-text model |
| `OPENAI_SPEECH_MODEL` | `gpt-4o-mini-tts` | Text-to-speech model |
| `OPENAI_SPEECH_VOICE` | `coral` | Voice used for spoken answers |

## Docker

```bash
cp .env.example .env.local
# set OPENAI_API_KEY in .env.local
docker compose up --build
```

`compose.yaml` runs the Next.js dev server with hot reload against your working tree.

## Deployment (Railway)

1. Push the repository to GitHub.
2. Create a Railway project and choose **Deploy from GitHub repo**, targeting the `main` branch.
3. Add `OPENAI_API_KEY` to the service variables; the remaining model variables can keep the defaults from `.env.example`.
4. Generate a public domain.

Railway builds from the root `Dockerfile` and `railway.json`. After the initial GitHub connection, every push to `main` triggers a build, a `/api/health` check, and a production deployment.

## Scripts

```bash
pnpm dev         # start the development server
pnpm build       # production build
pnpm start       # serve the production build
pnpm typecheck   # TypeScript, no emit
pnpm lint        # ESLint
pnpm test        # unit tests (watch)
pnpm test:run    # unit tests (single run)
pnpm test:e2e    # Playwright end-to-end tests
```

## Current scope

Course content ships as a single bundled curriculum: every course created in the library uses the same concept set, and lesson audio is rendered with the browser `SpeechSynthesis` API. Voice questions, answer generation, and spoken answers are backed by live OpenAI calls. Per-course content generation and server-side persistence are the next steps on the roadmap.
