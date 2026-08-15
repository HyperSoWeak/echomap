# Learn Audio Map

Mobile-first hackathon demo：新增多門課程、完成五步前測、查看學習地圖，並在課程中用語音向 AI 即時提問。

目前任意課程名稱都使用同一份固定 demo 內容。課程本體暫以瀏覽器 `SpeechSynthesis` 播放佔位文字；使用者提問則會呼叫 OpenAI transcription、structured answer 與 TTS API。

## Local

需要 Node.js 24、pnpm 11 與 OpenAI API key。

```bash
cp .env.example .env.local
# 編輯 .env.local，填入 OPENAI_API_KEY
pnpm install
pnpm dev
```

開啟 <http://localhost:3000>。沒有 API key 時仍可走完主要 UI；建議問題會顯示固定 fallback 回答，但即時語音辨識與 TTS 不可用。

## Docker development

```bash
cp .env.example .env.local
# 編輯 .env.local，填入 OPENAI_API_KEY
docker compose up --build
```

`compose.yaml` 直接執行 `pnpm dev`，程式碼變更會即時更新。

## Railway production

1. 將 repository 推到 GitHub。
2. 在 Railway 建立 project，選擇 **Deploy from GitHub repo**，branch 設為 `main`。
3. 在 service variables 加入 `OPENAI_API_KEY`；其餘 model variables 可沿用 `.env.example`。
4. 產生 public domain。

Railway 會自動使用根目錄的 `Dockerfile` 與 `railway.json`。完成一次 GitHub 連結後，每次 push 到 `main` 都會自動 build、檢查 `/api/health`，再部署 production container。

## Commands

```bash
pnpm typecheck
pnpm lint
pnpm build
```
