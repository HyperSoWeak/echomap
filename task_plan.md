# Task Plan: Mobile Audio Learning Map MVP

## Goal

交付可在本機以 Docker 開發、可由 GitHub `main` 自動部署到 Railway 的 Next.js mobile-first MVP，包含固定 demo 課程流程與真實 OpenAI 語音問答。

## Current Phase

Phase 6

## Phases

### Phase 1: Plan & Scaffold

- [x] 確認使用者需求、Figma workflow 與 MVP 邊界
- [x] 建立逐步 implementation plan
- [x] 建立 Next.js、TypeScript、pnpm 與測試基礎
- **Status:** complete

### Phase 2: Domain State & Guided Flow

- [x] 以 TDD 建立 course reducer、固定 demo dataset 與 versioned localStorage
- [x] 實作課程列表、新增課程與五步前測
- [x] 實作學習地圖、節目播放器、筆記與補救節點流程
- **Status:** complete

### Phase 3: Real AI Voice Q&A

- [x] 建立 server-only OpenAI client、request validation 與 rate limit
- [x] 實作 `/api/transcribe`、`/api/answer`、`/api/speech`
- [x] 實作 push-to-talk、文字答案、TTS 播放與課程續播
- **Status:** complete

### Phase 4: Deployment & Documentation

- [x] 建立 development/production multi-stage Dockerfile 與 Compose
- [x] 建立 Railway production 設定與 GitHub `main` autodeploy 指引
- [x] 補齊 `.env.example`、README 與 health endpoint
- **Status:** complete

### Phase 5: Verification & Review

- [x] 執行 lint、typecheck 與 production build
- [x] 依使用者指示略過新增與執行 automated tests / E2E
- [x] 建置並 smoke-test production Docker image
- [ ] 整合回 `main`
- **Status:** in_progress

### Phase 6: Delivery

- [ ] 稽核所有 acceptance criteria 與 git 狀態
- [ ] 提供 Railway 一次性連線步驟與環境變數清單
- [ ] 標記目標完成並交付
- **Status:** pending

## Key Questions

1. 如何在沒有 runtime course generation 的前提下讓任意課程標題呈現「已建立」？固定 demo dataset，保留輸入標題作 display name。
2. Railway 如何在 push `main` 後部署？使用 root Dockerfile，Railway 服務一次性連結 GitHub repo 並設定 branch 為 `main`。
3. 哪些內容是真實 AI？只讓即時語音轉錄、回答與 TTS 使用 OpenAI；課程內容、節點狀態與補救規則保持 deterministic。

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Next.js App Router 單一 container | UI 與三個 API routes 同一部署單位，符合最快 Railway MVP |
| 手寫 CSS design tokens，不引入 UI framework | 精準延續 Figma 視覺語言並降低依賴與抽象 |
| Reducer + versioned localStorage | 無資料庫版本仍可支援多課程、狀態轉移與重設 |
| OpenAI server-side SDK | API key 不暴露於 browser，三段語音流程易測試與替換模型 |
| Docker development target + production target | 本機 `pnpm dev` hot reload 與 Railway production image 共用一份 Dockerfile |

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| pnpm 11 blocked `unrs-resolver` build script | 1 | Add the locked native resolver to `pnpm.onlyBuiltDependencies`, then reinstall |
| pnpm 11 ignored legacy package.json build allowlist | 2 | Use `pnpm-workspace.yaml` `allowBuilds`, the v11 configuration location |
| Planning log patch used an English sentence that did not match its zh-TW source | 1 | Locate the exact text with `rg` and patch the existing line |
| ESLint 10 and TypeScript 7 exceeded transitive plugin peer ranges | 1 | Pin latest supported majors: ESLint 9.39.5 and TypeScript 6.0.3 |
| Storage tests resolved bare `localStorage` to Node 24's incomplete web-storage global | 1 | Investigate global vs jsdom window before changing the test boundary |
| Using `window.localStorage` still resolved the Vitest global in Node 25 | 2 | Override the test global with Vitest's internal `jsdom.window.localStorage` during setup |
| Progress patch used non-matching or overlapping context | 1–2 | Split plan and progress changes, then patch exact phase blocks |
| Figma MCP Starter plan rate-limited detail and podcast context | 1 | Use the already inspected screenshots/spec plus complete Home/Map context; do not retry the capped call |
| Large UI patch contained JavaScript template interpolation | 1 | Split UI changes into smaller patches and avoid nested template literals |
| React 19 lint rejected sync hydration state and render-time ref access | 1 | Defer localStorage hydration to a microtask and pass render state directly |
| Docker host could not create bridge veth | 1 | Use host networking for local build/smoke verification; Railway remains unaffected |
| Next standalone omitted `@swc/helpers` ESM exports | 2 | Add the runtime dependency and explicit `outputFileTracingIncludes` pattern |

## Notes

- 所有檔案修改使用 `apply_patch`。
- 不把 API key、音訊內容或完整 prompt 寫入 log。
- 依使用者最新指示略過 tests，以 lint、typecheck、build 與 container smoke check 快速驗證 demo。
