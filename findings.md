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

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| CSS custom properties 重建 palette、radius、shadow、spacing | 保留 Figma 一致性，也能用純 CSS 做 responsive mobile shell |
| 預錄 placeholder audio 放 `public/audio` | 課程播放不依賴 runtime AI，示範穩定且可離線操作 |
| OpenAI SDK 包在 `src/lib/server/openai.ts` | 集中 server-only 設定並方便 route 測試 mock |
| `/api/answer` 回傳 `conceptId`, `plainAnswer`, `exampleAnswer` | UI 可顯示雙層回答，deterministic reducer 可記錄概念計數 |
| 固定 30 requests/IP/10 minutes in-memory limit | 符合單 instance hackathon MVP 的最低濫用保護 |
| API model/voice 全由 env 控制並提供範例預設 | Railway 可無改碼切換模型，避免硬綁部署環境 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|

## Resources

- Product spec: `docs/superpowers/specs/2026-08-15-mobile-audio-map-design.md`
- Figma: https://www.figma.com/design/1rUwdEQ9iU5UN3DYZ599yc/
- OpenAI text guide: https://developers.openai.com/api/docs/guides/text
- OpenAI speech-to-text guide: https://developers.openai.com/api/docs/guides/speech-to-text
- OpenAI text-to-speech guide: https://developers.openai.com/api/docs/guides/text-to-speech
- Railway Dockerfile docs: https://docs.railway.com/builds/dockerfiles
- Railway GitHub autodeploy docs: https://docs.railway.com/deployments/github-autodeploys

## Visual/Browser Findings

- 背景是暖灰白 `#F4F3EE`，主色由淺薄荷到深綠：`#CCFAF5`, `#81D8D0`, `#67AEA8`, `#4E8781`, `#37615D`, `#1E3B39`。
- 視覺元素以大圓角 cards、細線、圓形節點、柔和陰影與大量留白為主。
- Home 使用 course cards；前測是五階段；map 是節點連線；podcast 使用 waveform 與下方控制；AI Agent detail 有 notes 與狀態。
- Mobile adaptation 採單欄 course/prequiz、垂直 zigzag map、橫向 snap episodes、full-width waveform、fixed bottom mic 與補救 bottom sheet。
