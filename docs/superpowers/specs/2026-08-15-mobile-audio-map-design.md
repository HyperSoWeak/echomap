# Mobile Learn Audio Map — First Deployable Version

Date: 2026-08-15

## Goal

Build the smallest mobile-first version of Learn Audio Map that can run locally in Docker and deploy to Railway as one Next.js service. The demo must accept real microphone input, obtain a real OpenAI-generated answer, speak the answer with OpenAI TTS, and update the learning map from the user's question history.

The application uses the supplied Figma file as the visual source of truth:

- Figma file: `1rUwdEQ9iU5UN3DYZ599yc`
- Design page: `Web / Laptop` (`0:1`)
- Reference frames: `Home`, `Generated Map`, `Sun node / AI Agent`, and `podcast`

## Product Positioning

Learn Audio Map begins with learners who find reading difficult, while its primary product value is adaptive learning: questions reveal where a learner is stuck, and the learning map grows a remedial node at that point.

## First-Version Scope

The first version includes:

- A mobile course library that supports multiple course records.
- An add-course input that appears to create a course from any topic.
- A fixed five-step pre-quiz after each course is added.
- One fixed demo dataset reused for every newly added course.
- A 5–9-node learning map with `unlearned`, `learned`, and `stuck` states.
- A single playable episode with a bundled local placeholder lesson track.
- Push-to-talk microphone input.
- OpenAI transcription, dynamic answers, and TTS.
- Question records, personal notes, repeated-concept detection, and remedial-node insertion.
- A one-action demo reset.

The typed topic becomes the visible course title. All generated courses share the same intentional placeholder pre-quiz, nodes, lesson, and episode data in this version.

## Non-Goals

- Generating course material from the typed topic.
- Uploading or parsing PDFs.
- Accounts, authentication, database persistence, or cross-device sync.
- Full-duplex Realtime API conversation.
- Arbitrary map editing, zooming, or dragging.
- Production content or pre-generated final lesson audio.
- Multiple deployable services.

## User Flow

1. The learner opens the course library.
2. The learner selects **新增課程** and enters any topic.
3. The app briefly displays a course-creation state and creates a local course record backed by the fixed demo dataset.
4. The learner completes five fixed pre-quiz steps using the existing Figma wizard pattern:
   - identity;
   - learning interest;
   - preferred learning medium;
   - learning objective;
   - daily learning time.
5. The app opens the course learning map.
6. The learner selects the available node and opens the course/episode view.
7. The learner plays the placeholder episode.
8. The learner holds the microphone action, asks a question, and releases it.
9. The lesson pauses; the UI shows transcription, the generated answer, and TTS playback in order.
10. After the answer audio finishes, the lesson resumes from the saved position.
11. When the same concept is identified twice, its node changes to `stuck`, the two real questions appear in notes, and a remedial suggestion appears.
12. Accepting the suggestion inserts a fixed remedial node into the map.
13. **重新 Demo** clears local application state and returns to the course library.

## Mobile Design

The target viewport is 390 px wide. The application may grow to a maximum width of 480 px and is centered on wider screens. Desktop does not receive a separate layout.

The Figma file is the visual source of truth. The implementation preserves its design language:

- warm off-white page background;
- low-saturation teal palette and dark green primary surfaces;
- circular learning nodes and thin connecting lines;
- large rounded cards and controls;
- light shadows, generous whitespace, and muted gray secondary text;
- the existing header, progress indicator, option, episode-card, waveform, and notes motifs;
- the color foundation shown in Figma, including `#CCFAF5`, `#81D8D0`, `#67AEA8`, `#4E8781`, `#37615D`, `#1E3B39`, and `#F4F3EE`.

Desktop compositions are reflowed for mobile rather than proportionally scaled:

- Course cards use one column.
- Pre-quiz options use one column and reuse a single five-step question component.
- Episode cards use a horizontal snap row.
- The learning graph becomes a vertically scrollable zig-zag node path.
- The player uses a full-width waveform card and a fixed bottom push-to-talk action.
- Transcription and answers appear in a focused rounded panel above the player.
- The remedial suggestion appears as a bottom sheet.

Typography, iconography, radii, shadows, and spacing are copied from the Figma source during implementation. No unrelated design system or component theme is introduced.

## Application Architecture

Use a single Next.js App Router application with TypeScript and pnpm.

- UI screens run as a client-side guided flow.
- Focused screen components separate course library, add course, pre-quiz, map, course detail, player, answer panel, and remedial prompt responsibilities.
- A reducer owns deterministic demo transitions.
- Browser `localStorage` persists user-visible state across reloads.
- Next.js route handlers proxy all OpenAI requests so the API key never reaches browser code.
- No database or separate backend service is used.

The application exposes these server routes:

- `POST /api/transcribe`
- `POST /api/answer`
- `POST /api/speech`

## Client State

Persist a versioned object containing:

- `courses`: local course records with an ID, typed title, creation timestamp, and all course-specific progress;
- `activeCourseId`;
- `screen`: the current guided-flow screen;

Each course record contains:

- `preQuizAnswers`: five selected values;
- `nodes`: fixed demo nodes and their `unlearned`, `learned`, or `stuck` state;
- `episodeProgressSeconds`;
- `conceptQuestionCounts`;
- `questionRecords`: transcript, concept ID, playback position, answer text, answer style, and timestamp;
- `remedialNodeAdded`.

Each browser owns its state. Adding several courses creates several course records, but each record points to the same fixed demo dataset.

## AI Request Flow

1. The browser records up to 30 seconds through `MediaRecorder` while the user holds the microphone action.
2. `/api/transcribe` accepts the audio as multipart form data and returns the recognized transcript.
3. `/api/answer` receives the transcript, fixed course context, allowed concept IDs, and current per-concept question counts.
4. A single structured model response returns a concept ID, a plain-language answer, and a concrete-example answer.
5. The server selects the plain answer for a first question about that concept and the concrete example for the second or later question.
6. `/api/speech` converts the selected answer into streaming audio.
7. The browser plays the answer, records the question, updates the concept count and notes, then resumes the lesson.

Model and voice identifiers are server environment variables so they can be changed without rebuilding UI code. The required secret is `OPENAI_API_KEY`; model and voice variables have documented defaults in `.env.example`.

## Deterministic Learning Logic

OpenAI identifies the concept and generates answer variants. Application code owns all persistent behavior:

- A first question increments the concept count to one and records a plain answer.
- A second question about the same concept increments the count to two and changes the node to `stuck`.
- Question records directly populate personal notes.
- A `stuck` node reveals the fixed remedial suggestion.
- Accepting the suggestion inserts the fixed remedial node.
- Completing the episode marks its primary node as `learned` unless it is already `stuck`.

## Failure Handling

- Microphone permission or capture failure: show the two suggested questions.
- Transcription failure: keep the lesson paused and offer retry or a suggested question.
- Answer failure: use the fixed answer for the active demo concept matching the expected style.
- TTS failure: keep the visible answer, then allow the lesson to resume.
- Placeholder lesson playback failure: show its transcript and retain functional timeline controls.
- Confused state: **重新 Demo** clears the versioned storage key and returns to the first screen.

Suggested questions bypass transcription but still call `/api/answer` and `/api/speech`.

## API Protection

- Keep `OPENAI_API_KEY` server-side.
- Reject recordings longer than 30 seconds or request bodies above 5 MB.
- Apply an in-memory limit of 30 AI endpoint requests per IP per 10 minutes for the single Railway instance.
- Do not log audio data or the API key.

## Docker and Railway

Use one multi-stage `Dockerfile`:

- `development` installs dependencies and starts `pnpm dev`.
- `builder` creates the Next.js production build.
- the final production stage starts the built application with `pnpm start` and listens on Railway's `PORT` using `0.0.0.0`.

`docker compose up` selects the development target, mounts the source tree, and runs local hot reload. Railway builds the final production target from the repository-root `Dockerfile`. Deployment requires `OPENAI_API_KEY` and may override the documented model and voice variables.

The GitHub repository uses `main` as Railway's production trigger branch. After the repository is connected to a Railway service and GitHub access is authorized once, every new commit pushed to `main` triggers an automatic production deployment. Repository documentation records the one-time connection, environment-variable, and public-domain setup.

## Testing

Automated tests cover:

- reducer transitions for course creation, pre-quiz completion, question counting, `stuck`, remedial insertion, and reset;
- request validation and response contracts for all three API routes with mocked OpenAI calls;
- the complete suggested-question browser flow at a 390 px viewport;
- localStorage restoration and schema-version reset.

Manual verification covers:

- real microphone permission and recording on a new device;
- real transcription, generated answers, and TTS using the configured OpenAI key;
- answer playback followed by lesson resumption;
- five consecutive complete demo runs;
- production Docker startup.

## Acceptance Criteria

- `docker compose up` starts local development with `pnpm dev`.
- A production Docker image builds and starts successfully.
- The application can be deployed to one Railway service by supplying its environment variables.
- Once Railway is linked to the GitHub repository, pushing a commit to `main` automatically triggers a production deployment.
- Mobile and desktop browsers display the same centered mobile application flow.
- A user can add more than one locally stored course.
- Any typed topic creates the same fixed demo content under the typed title.
- The five-step pre-quiz precedes the new course map.
- The complete map and episode flow works with intentional placeholder content.
- A real spoken question produces a real transcript, dynamic answer, and TTS audio.
- The first and second explanations use visibly different styles.
- Two questions mapped to the same concept update the node, notes, and remedial suggestion together.
- Accepting the suggestion visibly inserts a remedial node.
- Reset restores a clean, repeatable demo.
