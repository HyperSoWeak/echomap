import type { LearningNode, QuizStep } from "./types";

export const DEMO_CONCEPT_IDS = [
  "orientation",
  "agent-loop",
  "sensing",
  "planning",
  "action",
  "reflection",
  "checkpoint",
] as const;

export const PRIMARY_CONCEPT_ID = "agent-loop";

export const DEMO_NODES: LearningNode[] = [
  {
    id: "orientation",
    conceptId: "orientation",
    title: "開始之前",
    subtitle: "建立你的學習方向",
    durationMinutes: 3,
    status: "learned",
    kind: "core",
  },
  {
    id: "agent-loop",
    conceptId: "agent-loop",
    title: "AI Agent",
    subtitle: "觀察、思考與行動",
    durationMinutes: 8,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "sensing",
    conceptId: "sensing",
    title: "感知環境",
    subtitle: "把世界變成訊號",
    durationMinutes: 7,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "planning",
    conceptId: "planning",
    title: "規劃路徑",
    subtitle: "從目標選擇下一步",
    durationMinutes: 9,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "action",
    conceptId: "action",
    title: "採取行動",
    subtitle: "將決策化為動作",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "reflection",
    conceptId: "reflection",
    title: "反思與修正",
    subtitle: "利用結果更新策略",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "checkpoint",
    conceptId: "checkpoint",
    title: "學習檢查點",
    subtitle: "串起完整 Agent loop",
    durationMinutes: 5,
    status: "unlearned",
    kind: "checkpoint",
  },
];

export const DEMO_REMEDIAL_NODE: LearningNode = {
  id: "agent-loop-remedial",
  conceptId: "agent-loop",
  title: "AI Agent 補強練習",
  subtitle: "用生活例子重建概念",
  durationMinutes: 4,
  status: "unlearned",
  kind: "remedial",
};

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "identity",
    eyebrow: "讓我們先認識你",
    question: "哪一個身分最接近你？",
    description: "我們會用這個答案調整解釋方式。",
    options: ["大學生", "高中生", "自學者"],
  },
  {
    id: "interest",
    eyebrow: "找到你的切入點",
    question: "你最想先理解哪一類內容？",
    description: "第一版會使用相同 demo 內容展示流程。",
    options: ["AI 與機器人", "工程實作", "核心觀念"],
  },
  {
    id: "medium",
    eyebrow: "選擇舒服的節奏",
    question: "你偏好的學習媒介是？",
    description: "課程會以聲音為主，搭配可視化地圖。",
    options: ["Podcast", "圖像摘要", "問答互動"],
  },
  {
    id: "objective",
    eyebrow: "設定今天的目標",
    question: "這堂課最重要的成果是？",
    description: "你的選擇會保存在這台裝置。",
    options: ["理解概念", "能向別人解釋", "完成快速複習"],
  },
  {
    id: "daily-time",
    eyebrow: "安排學習時間",
    question: "每天想投入多少時間？",
    description: "先從能持續的小步驟開始。",
    options: ["5 分鐘", "15 分鐘", "30 分鐘"],
  },
];

export const DEMO_EPISODE = {
  title: "Episode 01｜AI Agent 如何看見並回應世界",
  description: "這是第一版的預先建立內容佔位符，用來展示聲音學習與即時提問流程。",
  durationSeconds: 48,
  audioSrc: "/audio/demo-lesson.wav",
  transcript:
    "這是一段 demo 課程內容。AI Agent 會先觀察環境，再根據目標選擇行動，最後利用結果修正下一次決策。",
} as const;

export const SUGGESTED_QUESTIONS = [
  "AI Agent 和一般程式有什麼不同？",
  "可以用掃地機器人解釋 Agent loop 嗎？",
] as const;

export const FALLBACK_ANSWERS = {
  plain: "AI Agent 可以把觀察、決策與行動串成持續循環，並根據結果調整下一步。",
  example:
    "想像掃地機器人：它用感測器發現牆壁，決定轉向，移動後再觀察新位置；這就是一個簡化的 Agent loop。",
} as const;
