# Task Plan: Mobile Audio Learning Map MVP

## Goal

交付可在本機以 Docker 開發、可由 GitHub `main` 自動部署到 Railway 的 Next.js mobile-first MVP，包含固定 demo 課程流程與真實 OpenAI 語音問答。

## Current Phase

Phase 1

## Phases

### Phase 1: Plan & Scaffold

- [x] 確認使用者需求、Figma workflow 與 MVP 邊界
- [x] 建立逐步 implementation plan
- [ ] 建立 Next.js、TypeScript、pnpm 與測試基礎
- **Status:** in_progress

### Phase 2: Domain State & Guided Flow

- [ ] 以 TDD 建立 course reducer、固定 demo dataset 與 versioned localStorage
- [ ] 實作課程列表、新增課程與五步前測
- [ ] 實作學習地圖、節目播放器、筆記與補救節點流程
- **Status:** pending

### Phase 3: Real AI Voice Q&A

- [ ] 建立 server-only OpenAI client、request validation 與 rate limit
- [ ] 實作 `/api/transcribe`、`/api/answer`、`/api/speech`
- [ ] 實作 push-to-talk、文字答案、TTS 串流播放與課程續播
- **Status:** pending

### Phase 4: Deployment & Documentation

- [ ] 建立 development/production multi-stage Dockerfile 與 Compose
- [ ] 建立 Railway production 設定與 GitHub `main` autodeploy 指引
- [ ] 補齊 `.env.example`、README 與 health endpoint
- **Status:** pending

### Phase 5: Verification & Review

- [ ] 執行 unit、route、component、E2E、lint、typecheck 與 build
- [ ] 以 390px browser 驗證主要 workflow 與視覺
- [ ] 建置並 smoke-test production Docker image
- [ ] 完成 code review、修正問題並整合回 `main`
- **Status:** pending

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

## Notes

- 所有檔案修改使用 `apply_patch`。
- 不把 API key、音訊內容或完整 prompt 寫入 log。
- 每完成一個邏輯單位就執行對應測試並建立 Conventional Commit。
