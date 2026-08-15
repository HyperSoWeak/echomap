import type { FollowUpQuestion, LearningNode } from "./types";

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

// Placeholder copy: these follow-ups stand in for the set a model will generate from the learner's prompt.
export const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  {
    id: "level",
    eyebrow: "先確認起點",
    question: "你對這個主題目前有多熟？",
    description: "決定第一個節點要從哪裡切入。",
    options: ["完全沒接觸", "看過一些", "已經動手做過"],
  },
  {
    id: "purpose",
    eyebrow: "確認用途",
    question: "你想拿它來做什麼？",
    description: "同一個主題，用途不同路徑就不同。",
    options: ["考試或修課", "工作專案", "純粹好奇"],
  },
  {
    id: "depth",
    eyebrow: "抓一下深度",
    question: "你想學到什麼程度？",
    description: "會影響節點數量與每集長度。",
    options: ["先抓重點", "能自己動手", "連原理一起懂"],
  },
  {
    id: "pace",
    eyebrow: "安排節奏",
    question: "每天大概能投入多久？",
    description: "先從能持續的小步驟開始。",
    options: ["5 分鐘", "15 分鐘", "30 分鐘"],
  },
];

export const DEMO_EPISODE = {
  title: "Episode 01｜AI Agent 如何看見並回應世界",
  description: "第一版的預先建立內容，用來展示聲音學習與即時提問流程。",
  durationSeconds: 48,
  audioSrc: "/audio/demo-lesson.wav",
  transcript:
    "AI Agent 會先觀察環境，再根據目標選擇行動，最後利用結果修正下一次決策。",
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
