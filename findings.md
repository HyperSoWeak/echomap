# Findings & Decisions

## Requirements

- 以 Figma Group 8 設計語言實作 mobile view，目標寬度 390px、desktop 最大 480px 置中。
- 允許多個課程；新增課程後才進入五步前測。
- 任意輸入都建立同一份固定 demo 課程內容，但保留使用者輸入課名。
- 第一版內容使用明確 placeholder，不在 runtime 生成課程。
- 語音提問是真實 OpenAI 串接：錄音、轉錄、動態回答、TTS，完成後續播課程。
- Next.js + TypeScript，UI 與 `/api/transcribe`、`/api/answer`、`/api/speech` 同一 container。
- 本機 Docker 直接跑 `pnpm dev`；Railway 使用 production target。
- 建立 Git repo；連結 Railway 後，push `main` 自動部署。

## Research Findings

- Figma 畫面包含 Home、Generated Map、AI Agent detail 與 podcast/player workflow。
- OpenAI API key 必須只放 server environment；Responses API 適合文字回答，Transcriptions 與 Speech API 支援語音流程。
- Railway 會偵測 repository root 的 Dockerfile；GitHub 服務連結後可依指定 branch 自動部署。
- Railway GitHub repo 連線與權限授權是一次性 dashboard 操作，無法由 repository 檔案單獨完成。
- 2026-08-15 registry versions: Next.js `16.3.1`, React `19.2.8`, OpenAI SDK `7.4.0`, Zod `4.4.3`, Vitest `4.1.10`, Playwright `1.62.1`。
- Tooling registry versions: TypeScript `7.0.2`, ESLint `10.8.1`, `eslint-config-next` `16.3.1`, Testing Library React `16.3.2`, jsdom `30.0.1`；實際 lockfile 由 pnpm resolution 固定。
- 本機 pnpm 是 `11.3.0`；專案以 `packageManager` 固定此版本。Docker 使用 Node 24，因此型別固定於 `@types/node` 24.x，而不是 registry 最新的 26.x。
- `eslint-config-next@16.3.1` 本身接受較新工具，但其 bundled plugins 目前要求 ESLint 9 與 TypeScript `<6.1`；因此固定相容的 ESLint `9.39.5` 與 TypeScript `6.0.3`。
- pnpm 11 的 non-registry project settings 放在 `pnpm-workspace.yaml`；build allowlist 已改為 `allowBuilds` map，舊版 `onlyBuiltDependencies` 已移除。
- The local runtime is Node `25.9.0`, which exposes a configurable global `localStorage`; without a configured file it emits a warning and lacks jsdom Storage methods.
- Vitest 4.1.10's jsdom `populateGlobal` only overwrites pre-existing globals listed in its `LIVING_KEYS` / `OTHER_KEYS`. `localStorage` is not listed, and Vitest sets `window = global`, so Node 25's incomplete storage shadows jsdom storage even through `window.localStorage`.

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| CSS custom properties 重建 palette、radius、shadow、spacing | 保留 Figma 一致性，也能用純 CSS 做 responsive mobile shell |
| 課程 placeholder 使用 browser `SpeechSynthesis` | 不先生成課程素材，仍能展示播放/暫停與語音問答流程 |
| OpenAI SDK 包在 `src/lib/server/openai.ts` | 集中 server-only 設定並方便 route 測試 mock |
| `/api/answer` 回傳 `conceptId`, `plainAnswer`, `exampleAnswer` | UI 可顯示雙層回答，deterministic reducer 可記錄概念計數 |
| 固定 30 requests/IP/10 minutes in-memory limit | 符合單 instance hackathon MVP 的最低濫用保護 |
| API model/voice 全由 env 控制並提供範例預設 | Railway 可無改碼切換模型，避免硬綁部署環境 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `pnpm install` emitted `ERR_PNPM_IGNORED_BUILDS` for `unrs-resolver` | Explicitly allow only that transitive native package through `pnpm-workspace.yaml` `allowBuilds` |
| Planning-log patch context did not match the existing zh-TW sentence | Located exact source text with `rg` and reapplied a narrow patch |
| `pnpm peers check` rejected ESLint 10 and TypeScript 7 | Pin the newest versions accepted by the transitive Next.js lint plugins |
| Storage tests failed before reaching production functions because Node 25 storage shadowed jsdom | Bind the test global to Vitest's exposed `jsdom.window.localStorage` in `vitest.setup.ts` |
| Figma Starter plan rejected further `get_design_context` calls for AI Agent detail and podcast | Keep Home/Map code context as exact source and use the previously inspected detail/player screenshots recorded in the approved spec |
| Docker host cannot create bridge veth interfaces | Use host networking only for local verification; this is a host constraint rather than image behavior |
| Next 16 standalone tracing selected CommonJS files while Node runtime resolved `module-sync` ESM helpers | Declare `@swc/helpers` directly and include its complete package in output file tracing |

## Resources

- Product spec: `docs/superpowers/specs/2026-08-15-mobile-audio-map-design.md`
- Figma: https://www.figma.com/design/1rUwdEQ9iU5UN3DYZ599yc/
- OpenAI text guide: https://developers.openai.com/api/docs/guides/text
- OpenAI speech-to-text guide: https://developers.openai.com/api/docs/guides/speech-to-text
- OpenAI text-to-speech guide: https://developers.openai.com/api/docs/guides/text-to-speech
- Railway Dockerfile docs: https://docs.railway.com/builds/dockerfiles
- Railway GitHub autodeploy docs: https://docs.railway.com/deployments/github-autodeploys
- pnpm 11 build settings: https://pnpm.io/settings/build

## Visual/Browser Findings

- 背景是暖灰白 `#F4F3EE`，主色由淺薄荷到深綠：`#CCFAF5`, `#81D8D0`, `#67AEA8`, `#4E8781`, `#37615D`, `#1E3B39`。
- 視覺元素以大圓角 cards、細線、圓形節點、柔和陰影與大量留白為主。
- Home 使用 course cards；前測是五階段；map 是節點連線；podcast 使用 waveform 與下方控制；AI Agent detail 有 notes 與狀態。
- Mobile adaptation 採單欄 course/prequiz、垂直 zigzag map、橫向 snap episodes、full-width waveform、fixed bottom mic 與補救 bottom sheet。
- Figma design context confirms typefaces `Zen Tokyo Zoo` for the display wordmark, `Gen Jyuu Gothic` Bold for zh-TW headings/actions, and `Inter` for utility text. The implementation should use local/system fallbacks if the design fonts are not distributable, without importing the unrelated skill-suggested playful fonts.
- Home frame uses a 126px pale-teal header at desktop scale, white circular logo, `#67AEA8` display title, pill CTA with 2px/2px shadow, and a dark `#37615D` pill search/add surface. Mobile keeps these proportions as a compact top bar and full-width pill control.
- Generated Map uses 103px desktop circular nodes and thin connectors. Active/learned nodes use solid `#67AEA8`, the current/in-progress style can be a teal outline or dotted outline, and future nodes are light gray; labels are `#909090` bold.
- `ui-ux-pro-max` suggested a generic neumorphic education palette and childlike font pairing, but the user-provided Figma source has higher priority. Only its accessibility, 8pt rhythm, 44px touch, focus, and reduced-motion guidance applies.

## Declared Design System

- Color: Figma teal scale (`#CCFAF5`, `#81D8D0`, `#67AEA8`, `#4E8781`, `#37615D`, `#1E3B39`) on warm `#F4F3EE`, white surfaces, gray `#909090`/`#C4C4C4` secondary text.
- Typography: Figma display/rounded-gothic intent; 12/14/16/20/28/36 mobile scale with 1.4–1.65 line height.
- Spacing: 4px base with 8/16/24/32/48 hierarchy and 20px mobile gutters.
- Radius: circular nodes/controls, 24–32px cards, 16px compact chips.
- Elevation: one subtle card shadow and one stronger bottom-sheet shadow; no unrelated glass/gradient effects.
- Motion: 180–280ms opacity/transform transitions, creation state up to 400ms, with `prefers-reduced-motion` disabling non-essential motion.
