# EchoMap UX 規格（Demo 版）

## 0. 範圍與前提

- 這份文件描述的是 **hackathon demo**，不接真的生成 API，內容全部是預先寫好的假資料。
- 但**資料的形狀要照真的長**（見 §7），之後把假資料換成 API 回應時不需要重寫畫面。
- 只有**一集 lesson** 可以進入播放頁，其餘集數在清單上可見但不可點（見 §6）。
- 核心賣點是 §5 的「打斷提問」，其他畫面都是為了讓這一幕成立而存在的鋪陳。

## 1. 資訊架構

```
Courses（所有課程）
  └─ Roadmap（概念圖，node = 一個概念 / domain）
       └─ Domain（單一概念頁）
            └─ Lessons（線性清單）
                 └─ Lesson = 一集 60 秒 podcast
```

四層下鑽。新增課程時中間插入 Intake（追問）與 Generating（生成中）兩個過場畫面，它們不屬於階層，是 modal 流程。

## 2. 導覽模型

**前提：這是 standalone PWA，iOS 沒有瀏覽器返回鍵，也沒有邊緣滑動返回手勢。** App 內必須自己提供每一層的退路，否則使用者會卡死。

- **左上角返回**：每一層唯一的上一層入口，帶上層名稱（`← 觀察與感知`）。iOS 慣例位置。
- **底部不是 tab bar**：四層下鑽的結構裡，「課程 / 地圖 / 筆記」做成平行分頁語意是假的（從 lesson 點「課程」是往上兩層，不是切分頁）。
- **底部是常駐 mini player**：正在播放時，離開 lesson 頁音訊不中斷，底部浮出一條迷你播放列，點擊展開回全螢幕播放器。這是 podcast app 的標準做法，也讓「一邊聽一邊瀏覽地圖」成立。

### 2.1 上方導覽列

每頁都有（Generating 除外），只做導覽，固定 52px 細身。

| 畫面 | 左 | 中 | 右 |
| --- | --- | --- | --- |
| Courses | ◉ EchoMap | — | 重設（有課程時才出現） |
| Intake | ✕ 放棄 | ●●●○○ | — |
| Generating | 整條不顯示 | | |
| Roadmap | ← 我的課程 | — | — |
| Domain | ← 學習地圖 | — | — |
| Lesson | ← 觀察與感知 | — | — |

1. **返回鍵標的是上一層的名字**，不是「返回」。使用者看得出會落到哪裡；在沒有系統返回鍵的 standalone PWA 裡，這是唯一的方向感來源。
2. **當前頁標題不放在 bar 上**，放在內容區的大標題，bar 保持細身。
3. **不透明**，加 1px 底線。半透明無 backdrop 會讓內容捲上去跟標題疊在一起。

### 2.2 下方插槽

同一時間只有一個佔用者，**永遠不是 tab bar**：

| 狀態 | 佔用者 |
| --- | --- |
| Lesson 頁 | 提問列 |
| 其他頁 + 正在播放 | mini player |
| 其他頁 + 沒在播放 | 收起，不佔空間 |
| Intake / Generating | 收起 |

**Mini player（56px）**

```
┌─────────────────────────────┐
│▔▔▔▔▔▔▔▔▔▔▔▔▔░░░░░░░░░░░░░░░│ ← 1px 進度線貼在上緣
│ ▎觀察與感知 · EP.02    ▶  ✕ │
└─────────────────────────────┘
```

點整條（按鈕除外）＝ 展開回 Lesson 頁；✕ ＝ 停止並收起。

**提問列（64px，Lesson 專用，隨狀態變形）**

```
idle      │ ⌨ 問點什麼…          [按住說] │
recording │ ▂▅▇▅▂  放開送出              │  ← 整條變色、長高
thinking  │ 正在整理回答…                 │  ← disabled
answered  │ [ ▶ 繼續播放 ]  再問一個  重播 │
```

最後一個狀態是刻意的：回答播完後「繼續播放」出現在拇指原本就在的位置，不必把手移到畫面中間找按鈕。

### 2.3 版面結構

現行實作的 `.screen { min-height: calc(100dvh - 76px) }` 寫死了 header 高度，但 header 實際是 `env(safe-area-inset-top) + 12px + 內容`。iPhone 瀏海機在 standalone 下 inset 約 59px，header 約 117px，於是**每一頁都固定多出約 41px 的可捲動空間**，捲一下又彈回來。改用 flex 讓瀏覽器自己算：

```css
.app-shell { display: flex; flex-direction: column; min-height: 100dvh; }

.app-bar {
  flex: 0 0 auto;
  padding-top: env(safe-area-inset-top);   /* 不要再跟 12px 用 max() 混在一起 */
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.app-bar > .row { min-height: 52px; }      /* 觸控目標 ≥44px */

.screen { flex: 1 1 auto; }                /* 不再有任何 100dvh 減法 */

.app-dock {
  position: sticky; bottom: 0;
  flex: 0 0 auto;
  padding-bottom: env(safe-area-inset-bottom);
}
```

底部用 `sticky` 而不是 `fixed`：shell 有 `max-width: 480px` 置中，`fixed` 就得像現行 `.remedial-sheet` 那樣寫 `right: max(12px, calc((100vw - 480px) / 2 + 12px))`。sticky 在 flex column 裡自動貼齊容器底部，兩側對齊正確，也不需要在 `.screen` 補假的 padding。

### 2.4 元件結構

兩條 bar 由 `LearningApp` render 一次，**放在 screen 外面**，不要像現行那樣每個 screen 各自 `<AppHeader />`：

```tsx
<main className="app-shell">
  <AppBar {...barPropsFor(state.screen)} />
  <Screen />                {/* 只負責內容 */}
  <AppDock />               {/* 依 state 決定 mini player / 提問列 / 收起 */}
</main>
```

一次解決三件事：切畫面時 bar 不重繪、mini player 能跨畫面持續存在、播放狀態不必往下傳進每個 screen。

## 3. 畫面規格

### 3.1 Courses

一進 App 的首頁。

```
┌─────────────────────────────┐
│ ◉ EchoMap                   │
├─────────────────────────────┤
│  我的課程                2 門 │
│  ┌───────────────────────┐  │
│  │ AI Agent 入門          │  │
│  │ ▓▓▓▓▓░░░░░░░  3/12 集  │  │
│  │ 繼續收聽 EP.03  04:20  │  │  ← 回訪的一鍵入口
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 量子力學速成            │  │
│  │ ░░░░░░░░░░░░  尚未開始  │  │
│  └───────────────────────┘  │
│                             │
│      ＋ 建立新課程           │
└─────────────────────────────┘
```

- 預設塞 2 門課：一門有進度、一門全新，讓「回訪」與「初次」兩種狀態同時被看見。
- 卡片顯示：主題、集數進度條、以及**上次中斷點**（`繼續收聽 EP.03 04:20`）。點卡片直接進 Roadmap，不是直接跳播放。
- 空狀態（使用者按過「重設」）：只留大按鈕與一句說明。

### 3.2 Intake（建立課程的追問）

全螢幕 modal 流程，5 題單選。

- 頂部進度用點狀指示（`●●●○○`），不用「3 / 5」數字。
- 可「上一題」，可中離（返回時確認「要放棄建立嗎？」）。
- 第一步先問主題（文字輸入），其後 4 題問背景、目標、可投入時間、偏好深度。
- 答完直接進 Generating，不需要「送出」按鈕，選完最後一題即前進。

### 3.3 Generating（假的生成過場）

**這一幕是刻意保留的，即使資料是假的。** 它負責讓使用者相信這張地圖是為他生成的。

```
        ◌  ◌  ◌
   正在打造你的課程

   ✓ 分析你的回答
   ✓ 建立學習地圖
   ⟳ 準備第一集內容
```

- 總長約 2.5 秒，三行字依序打勾。
- 不可返回、不可跳過。
- 未來接真 API 時，這個畫面的三個階段直接對應三次呼叫，不用改設計。

### 3.4 Roadmap（垂直蛇形路徑）

```
   ┌─────────────────────────┐
   │ ← 我的課程               │
   ├─────────────────────────┤
   │  AI Agent 入門           │
   │  7 個概念 · 12 集 · 已完成 3│
   │                         │
   │        ●  什麼是 Agent   │  已完成
   │       ╱                 │
   │      ◉    觀察與感知     │  ← 進行中（環狀進度）＋「下一步」標記
   │       ╲                 │
   │        ○  規劃與決策     │  未開始
   │       ╱                 │
   │      ◍    行動與執行     │  卡住
   │       ╲                 │
   │        ○  反思與修正     │
   │        │                │
   │        ◇  檢核點        │
   ├─────────────────────────┤
   │ ▎觀察與感知 EP.3    ▶  ✕ │  ← mini player
   └─────────────────────────┘
```

- **垂直蛇形**，捲動即前進。手機上最好讀、節點夠大好點。
- **不鎖**：任何節點都可以點進去，只用「下一步」標記引導主線。成人自學者常常想跳著聽，硬鎖只會惹惱人；demo 現場評審也一定會亂點。
- 節點四種狀態：已完成 `●` / 進行中 `◉`（環狀進度）/ 未開始 `○` / 卡住 `◍`。
- 圖例固定顯示在路徑下方。

### 3.5 Domain（單一概念頁）

點節點**不直接跳進第一集**，先給概念頁。

```
┌─────────────────────────────┐
│ ← 學習地圖                   │
├─────────────────────────────┤
│  概念 02                    │
│  觀察與感知                  │
│  Agent 要先能把世界變成訊號，  │
│  才談得上決策。這一節拆解...   │
│                             │
│  4 集 · 約 4 分鐘            │
│  ┌───────────────────────┐  │
│  │ EP.01 感知的三種來源  ✓ │  │
│  │ EP.02 訊號與雜訊    ▶  │  │  ← demo 唯一可進入的一集
│  │ EP.03 從觀察到理解      │  │  ← 不可點
│  │ EP.04 小結與練習        │  │  ← 不可點
│  └───────────────────────┘  │
│         ▶ 開始收聽           │
└─────────────────────────────┘
```

- 概念頁說明「這個概念在講什麼、為什麼排在這裡」，這是「地圖是為你生成的」這個敘事的支點。
- Lesson 清單是**線性**的：集號、標題、時長、聽過的進度。
- 主要按鈕「開始收聽 / 繼續收聽」，永遠指向該概念的當前集。

### 3.6 Lesson（播放頁）— 核心畫面

上半是播放器，下半是逐字稿與所有打斷紀錄。

```
┌─────────────────────────────┐
│ ← 觀察與感知                 │
├─────────────────────────────┤
│  EP.02 · 訊號與雜訊          │
│   ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁▂▃▅     │  波形
│   ━━━━━━━●───────────────    │  時間軸
│   0:24                1:00  │
│      ⟲15    ▶/Ⅱ    15⟳     │
│                    下一集 →  │
├─────────────────────────────┤
│  逐字稿                      │
│  ...感知不是把所有東西都看     │
│  進來，而是挑出有意義的部分。  │  ← 播到哪就 highlight 哪一段
│                             │
│   ╭─────────────────────╮   │
│   │ 🎤 你 · 0:24         │   │  ← 打斷插在時間軸的對應位置
│   │ 什麼叫有意義的部分？   │   │
│   ├─────────────────────┤   │
│   │ 🔊 EchoMap           │   │
│   │ 就是跟你當下目標有關的 │   │
│   │ 訊號。像你在找人的時候 │   │
│   │ ...                  │   │
│   │ ▶ 重播回答            │   │
│   ╰─────────────────────╯   │
│                             │
│  ...所以第一步是設定過濾器。  │
├─────────────────────────────┤
│  ⌨  問點什麼…      [ 按住說 ] │  ← 固定底部提問列
└─────────────────────────────┘
```

**設計決定：打斷紀錄內嵌在逐字稿中，而不是另外開一個列表。** 問題發生在講到哪一句，回覆就長在那一句下面，重聽時脈絡是完整的。（若之後覺得太雜，備案是逐字稿與提問紀錄分成兩個 tab，但 demo 建議用內嵌，敘事更強。）

- 每集 60 秒，單人旁白。
- 「下一集」按鈕永遠可見；播完自動停在結尾並把「下一集」變成主要按鈕，**不自動接下一集**。
- 底部提問列固定，兩種輸入並存：左邊文字輸入、右邊按住說話。文字輸入不是備案而是一級入口 —— demo 現場環境吵、麥克風權限可能出狀況，打字是保底路徑。

## 4. 核心互動：打斷提問

這是整個產品的 key feature，狀態流程要精確。

```
播放中
  │
  ├── 按住麥克風 ──────┐
  └── 送出文字訊息 ────┤
                      ▼
              podcast 立刻暫停
                      │
              （語音）辨識中…  ~1.2s
                      │
                 整理回答中…   ~0.8s
                      │
        ┌─────────────┴─────────────┐
        │ 回覆同時出現文字 + 播放語音  │
        └─────────────┬─────────────┘
                      │
              回答播畢，停住
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ▶ 繼續播放     再問一個      重播回答
```

規則：

1. **暫停是立即的**，在辨識完成之前就要停，不能讓 podcast 繼續講。
2. **回覆一定是「音訊 + 文字」同時**。文字先出現（可讀），語音接著播（可聽）。
3. **回答播完不自動續播**，由使用者按「繼續播放」決定。這是刻意的：使用者可能想接著追問。
4. **追問**在回答後可直接再次提問，不必先續播。
5. 回答播放期間，提問列 disabled，避免狀態交錯。
6. 每一次打斷都記錄：時間戳、輸入方式（語音 / 文字）、問題文字、回答文字、回答音訊，並內嵌到逐字稿對應位置。
7. 續播時從**打斷當下的秒數**繼續，不是從段落開頭。

Demo 的假資料策略：問題文字做關鍵字比對，命中就給對應的預寫回答，沒命中給一則通用回答。底部同時提供 2–3 個建議問題按鈕，確保 demo 現場一定打得中。

## 5. Demo 假資料規劃

| 項目 | 內容 |
| --- | --- |
| 課程 | 2 門（AI Agent 入門：進度 3/12；量子力學速成：未開始） |
| 建立新課程 | 不論輸入什麼主題，都導向同一份 canned roadmap |
| Roadmap 節點 | 7 個，狀態涵蓋已完成 / 進行中 / 未開始 / 卡住 |
| 每節點集數 | 2–4 集，清單完整顯示（標題、時長） |
| 可播放的 lesson | **只有 1 集**（觀察與感知 EP.02） |
| 其他 lesson | 顯示但不可點，標示「Demo 未開放」，點擊無反應或輕量提示 |
| 音訊 | `SpeechSynthesis` 唸預寫講稿，不需要音檔、不花錢、不用等 |
| 打斷回答 | 預寫的問答對，關鍵字比對 |

**唯一可播放的那一集要做滿**：完整逐字稿、可打斷、回覆有音訊有文字、有下一集按鈕（點了給提示或回概念頁）。其餘畫面只要能走通不出錯即可。

## 6. 資料模型草案

```ts
type Screen = "library" | "intake" | "generating" | "roadmap" | "domain" | "lesson";

interface Course {
  id: string;
  prompt: string;          // 使用者輸入的主題
  title: string;           // 顯示用標題
  createdAt: string;
  intakeAnswers: string[];
  domains: Domain[];
  lastPlayed?: { lessonId: string; positionSeconds: number };
}

interface Domain {          // roadmap 上的一個節點
  id: string;
  title: string;
  summary: string;
  status: "unlearned" | "inProgress" | "learned" | "stuck";
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  durationSeconds: number;  // demo 一律 60
  playable: boolean;        // demo 只有一集為 true
  positionSeconds: number;
  transcript: TranscriptSegment[];
  interruptions: Interruption[];
}

interface TranscriptSegment {
  id: string;
  startSeconds: number;
  text: string;
}

interface Interruption {
  id: string;
  atSeconds: number;
  source: "voice" | "text";
  question: string;
  answerText: string;
  createdAt: string;
}
```

與現況的落差：目前 `Course` 是一層扁平的 `nodes`，node 直接等於一集；新模型多了 Domain / Lesson 兩層，`screen` 列舉要加 `generating` 與 `domain`，`demo-data.ts` 要整份重寫成上面的形狀。`storage.ts` 的 `STORAGE_VERSION` 必須跟著 bump，否則舊的 localStorage 會被靜默丟棄。

## 7. 之後接真 API 的接縫

Demo 的假資料集中在一個模組，未來每一項各對應一次呼叫：

| 假資料 | 未來對應 |
| --- | --- |
| canned roadmap | 由 intake 答案生成 domains |
| canned lesson 清單 | 由 domain 生成 lessons |
| canned 逐字稿 | 由 lesson 生成講稿 |
| `SpeechSynthesis` | `/api/speech`（已可用） |
| 關鍵字比對的回答 | `/api/transcribe` + `/api/answer`（已可用且驗證過） |

Generating 畫面的三個階段就是預留給前三項的。

## 8. 工作拆解與平行度

### Wave 0 — 先擋在前面的（單一負責人，不可平行）

所有人都相依於這一步，越快合併越好：

1. `types.ts`：§6 的新資料模型、`Screen` 列舉加 `generating` / `domain`。
2. `state.ts`：**先把所有 action 一次宣告齊**（即使 case 內容還是空的）。這樣後續各線只填自己的 case，不會互相搶同一個 union type。
3. `demo-data.ts` 拆檔骨架：`demo/courses.ts`、`demo/lesson.ts`、`demo/qa.ts`，先給空殼與型別。
4. 播放控制器的介面（`play/pause/seek/current` 這種），只要介面，不必實作 —— Lesson 頁與 mini player 都要吃它。
5. `storage.ts` 的 `STORAGE_VERSION` bump。
6. 決定現有 3 個失敗測試要修還是刪（改資料模型後會壞更多），別讓每條線各自繞路。

| # | 工作 | 檔案 |
| --- | --- | --- |
| W0-1 | 新資料模型：`Course` / `Domain` / `Lesson` / `TranscriptSegment` / `Interruption`；`Screen` 加 `generating`、`domain` | `types.ts` |
| W0-2 | 一次宣告完整的 `AppAction` union，未實作的 case 先 `return state` | `state.ts` |
| W0-3 | 假資料拆檔骨架：`demo/courses.ts`、`demo/roadmap.ts`、`demo/lesson.ts`、`demo/qa.ts` | 新增 |
| W0-4 | 播放控制器介面（`play` / `pause` / `seek` / `next` / `current` / `position` / `isPlaying`），只定義不實作 | 新增 |
| W0-5 | `STORAGE_VERSION` bump 到 2 | `storage.ts` |
| W0-6 | 決定 3 個過時測試要修還是刪 | `LearningApp.test.tsx` |
| W0-7 | （建議）`globals.css` 拆成 `styles/*.css`，避免後續四線衝突 | `globals.css` |

### Wave 1 — 四條線可同時開工

**T1 版面骨架**（相依：`Screen` 列舉）

| # | 工作 |
| --- | --- |
| T1-1 | `.app-shell` 改 flex column，移除 `calc(100dvh - 76px)` 與所有寫死高度 |
| T1-2 | `AppBar` 元件：left / center / right 三插槽，實色底 + 1px 底線 |
| T1-3 | `AppDock` 元件：`sticky bottom` + safe-area，內容空時不佔空間 |
| T1-4 | `LearningApp` 改成兩條 bar 在 screen 外 render 一次 |
| T1-5 | `barPropsFor(screen)` 對照表（§2.1） |
| T1-6 | `.remedial-sheet` 定位改到 dock 之上（bottom offset + z-index） |
| T1-7 | 移除舊的 `.app-header` 樣式與 `AppHeader.tsx` |

**T2 內容寫作**（零程式相依，可立即開始）

| # | 工作 |
| --- | --- |
| T2-1 | 兩門課的文案：標題、描述、進度數字、中斷點 |
| T2-2 | 7 個概念節點：標題、一句摘要、四種狀態的分配 |
| T2-3 | 每節點 2–4 集的集名與時長 |
| T2-4 | 主打那一集的 60 秒逐字稿，切成 6–10 段並標 `startSeconds` |
| T2-5 | 打斷問答對 6–8 組：關鍵字、回答文字（口語、每則 ≤120 字） |
| T2-6 | 3 個建議問題（demo 現場保底用） |
| T2-7 | Intake 5 題的題目與選項 |
| T2-8 | Generating 的三行進度文案 |

**T3 Roadmap**（相依：型別）

| # | 工作 |
| --- | --- |
| T3-1 | 垂直蛇形路徑版面：左右交錯 + 連接線 |
| T3-2 | 節點四種狀態樣式（已完成／進行中環狀進度／未開始／卡住） |
| T3-3 | 「下一步」引導標記 |
| T3-4 | 頂部統計列：概念數、集數、已完成 |
| T3-5 | 狀態圖例 |
| T3-6 | 點節點 → `domainOpened` |

**T4 清單頁**（相依：型別）

| # | 工作 |
| --- | --- |
| T4-1 | Courses 卡片：進度條 + 「繼續收聽 EP.03 04:20」 |
| T4-2 | Courses 空狀態 |
| T4-3 | 「建立新課程」入口 |
| T4-4 | Domain 頁頭：概念名、摘要、集數統計 |
| T4-5 | Domain 的 lesson 線性清單，含不可點集數的呈現 |
| T4-6 | 主要按鈕「開始／繼續收聽」 |

### Wave 2 — T1 合併後可同時開工

**T5 Lesson 頁**（相依：T1、播放控制器）— 最大的一塊，也是關鍵路徑

| # | 工作 |
| --- | --- |
| T5-1 | 播放器：波形、時間軸、時間顯示 |
| T5-2 | Transport：播放／暫停、±15 秒 |
| T5-3 | 「下一集」按鈕與 demo 行為 |
| T5-4 | 逐字稿渲染，跟著播放 highlight 當前段 |
| T5-5 | 提問列 idle 態：文字輸入（16px 防 iOS 聚焦縮放）＋ 按住說話 |
| T5-6 | 錄音態：整條變形、波形、放開送出 |
| T5-7 | 假的 transcribing（~1.2s）／answering（~0.8s）延遲 |
| T5-8 | 回覆呈現：文字先出 + `SpeechSynthesis` 播音 |
| T5-9 | answered 態：繼續播放／再問一個／重播回答 |
| T5-10 | 續播從打斷當下的秒數繼續，不是段落開頭 |
| T5-11 | 打斷卡片內嵌進逐字稿的對應位置 |
| T5-12 | 回答播放期間鎖住提問列 |
| T5-13 | 關鍵字比對假回答 + 通用 fallback |
| T5-14 | 建議問題按鈕 |

**T5 不要再拆。** 播放器與打斷互動共用同一個狀態機、同一個檔案，拆成兩人是淨損失。排最強的人、最早開始。

**T6 Mini player**（相依：T1、播放控制器）

| # | 工作 |
| --- | --- |
| T6-1 | Dock 內的 mini player UI ＋ 上緣 1px 進度線 |
| T6-2 | 點整條展開回 Lesson 頁 |
| T6-3 | ✕ 停止並收起 |
| T6-4 | 跨畫面持續播放（接播放控制器） |
| T6-5 | 在 Lesson 頁時隱藏 |

**T7 Intake / Generating**（相依：型別）

| # | 工作 |
| --- | --- |
| T7-1 | 主題輸入（第一步） |
| T7-2 | 4 題單選 + 點狀進度指示 |
| T7-3 | 上一題、放棄建立的確認 |
| T7-4 | Generating 的 2.5 秒三階段動畫 |
| T7-5 | 完成 → 進入 Roadmap |

### 收尾（序列，最後做）

| # | 工作 |
| --- | --- |
| Z-1 | iOS 真機走查：safe area、sticky dock、錄音、`SpeechSynthesis` |
| Z-2 | `sw.js` 的 `CACHE` 版本 bump（precache 資產已變） |
| Z-3 | 更新 `README.md` 與 `CLAUDE.md` 的架構描述 |
| Z-4 | 清掉舊 `demo-data.ts` 遺留與死碼 |

### 會撞車的地方

- **`globals.css` 是單一大檔**，四條線同時改必然衝突。約定每條線只 append 自己的區塊（加註解 banner），或在 Wave 0 就拆成 `styles/*.css`。
- **`state.ts`**：靠 Wave 0 先宣告齊 action 來避免。
- **`demo-data.ts`**：靠 Wave 0 拆檔來避免，讓寫文案的人與寫程式的人不碰同一個檔。

### 不用動的

PWA（`manifest.ts`、`sw.js`、icons）、三個 `/api` route、`openai.ts` 在這一輪都不需要改。

## 9. 未決事項

- **打斷提問在 demo 要不要走真的 API？** 本文件按「全部假資料」撰寫，但 `/api/transcribe` + `/api/answer` + `/api/speech` 三條路徑目前是通的、且 iOS 錄音格式問題已修好。若要讓 demo 的這一幕是真的，只需要把 §4 的資料來源換掉，畫面規格完全不變。
- 「卡住」狀態的補救流程（同一概念問兩次 → 節點標記卡住 → 提供補充一集）在新架構下要放在 Domain 頁還是 Roadmap 上，尚未決定。
- 「下一集」在 demo 中點下去的行為（提示 vs 回概念頁）待定。
