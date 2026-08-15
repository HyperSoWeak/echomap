import type { ConceptGraph, EpisodePreview, LearningNode, QuizStep } from "./types";

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

export const DEMO_CONCEPT_GRAPH: ConceptGraph = {
  nodes: [
    { id: "linear-algebra", title: "線性代數", status: "root", x: 14, y: 26 },
    { id: "llm-basics", title: "LLM 基礎", status: "learned", x: 38, y: 26 },
    { id: "prompt-design", title: "Prompt 設計", status: "current", x: 62, y: 26 },
    { id: "tool-calling", title: "工具呼叫", status: "learned", x: 86, y: 26 },
    { id: "probability", title: "機率統計", status: "locked", x: 14, y: 78 },
    { id: "reinforcement", title: "強化學習", status: "locked", x: 38, y: 78 },
    { id: "memory", title: "記憶管理", status: "locked", x: 62, y: 78 },
    { id: "multi-agent", title: "多代理協作", status: "locked", x: 86, y: 78 },
  ],
  edges: [
    ["linear-algebra", "llm-basics"],
    ["llm-basics", "prompt-design"],
    ["prompt-design", "tool-calling"],
    ["linear-algebra", "probability"],
    ["llm-basics", "reinforcement"],
    ["prompt-design", "memory"],
    ["tool-calling", "multi-agent"],
  ],
};

// All cards open the same fixed demo lesson (see CourseLibrary's "固定 demo 內容" note) —
// only the first episode ships real audio/transcript today.
export const DEMO_EPISODES: EpisodePreview[] = [
  { id: "ep-01", title: "EP.01 觀察與感知", description: "AI Agent 如何把環境變成可用的訊號。", durationMinutes: 8, completed: true },
  { id: "ep-02", title: "EP.02 決策與規劃", description: "從目標拆解出下一步該做的行動。", durationMinutes: 9, completed: false },
  { id: "ep-03", title: "EP.03 行動與回饋", description: "把決策化為動作，並觀察結果。", durationMinutes: 7, completed: false },
  { id: "ep-04", title: "EP.04 記憶與修正", description: "利用回饋更新策略，準備下一輪循環。", durationMinutes: 8, completed: false },
];

// Keyed by DEMO_CONCEPT_GRAPH node id — selecting a concept swaps the episode list below it.
export const DEMO_CONCEPT_EPISODES: Record<string, EpisodePreview[]> = {
  "linear-algebra": [
    { id: "linear-algebra-ep-01", title: "EP.01 向量與矩陣", description: "用向量表示資料，用矩陣描述轉換。", durationMinutes: 10, completed: false },
    { id: "linear-algebra-ep-02", title: "EP.02 內積與相似度", description: "衡量兩筆資料有多相像。", durationMinutes: 8, completed: false },
  ],
  "llm-basics": [
    { id: "llm-basics-ep-01", title: "EP.01 語言模型是什麼", description: "從預測下一個字，到理解語意。", durationMinutes: 9, completed: false },
    { id: "llm-basics-ep-02", title: "EP.02 Token 與嵌入", description: "文字如何變成模型看得懂的數字。", durationMinutes: 8, completed: false },
  ],
  "prompt-design": [
    { id: "prompt-design-ep-01", title: "EP.01 指令的結構", description: "把任務拆成模型容易遵循的步驟。", durationMinutes: 7, completed: false },
    { id: "prompt-design-ep-02", title: "EP.02 少樣本示範", description: "用範例引導模型輸出想要的格式。", durationMinutes: 9, completed: false },
  ],
  "tool-calling": [
    { id: "tool-calling-ep-01", title: "EP.01 讓模型呼叫工具", description: "從純文字回答到實際採取行動。", durationMinutes: 8, completed: false },
    { id: "tool-calling-ep-02", title: "EP.02 工具結果回填", description: "把工具回傳的資料再交給模型判斷。", durationMinutes: 7, completed: false },
  ],
  probability: [
    { id: "probability-ep-01", title: "EP.01 不確定性的語言", description: "用機率描述模型沒把握的答案。", durationMinutes: 8, completed: false },
    { id: "probability-ep-02", title: "EP.02 貝氏更新", description: "根據新證據修正原本的判斷。", durationMinutes: 9, completed: false },
  ],
  reinforcement: [
    { id: "reinforcement-ep-01", title: "EP.01 獎勵與策略", description: "用回饋訓練 Agent 做出更好的選擇。", durationMinutes: 9, completed: false },
    { id: "reinforcement-ep-02", title: "EP.02 探索與利用", description: "該嘗試新方法，還是用已知最好的？", durationMinutes: 8, completed: false },
  ],
  memory: [
    { id: "memory-ep-01", title: "EP.01 短期與長期記憶", description: "Agent 如何記得對話中發生過的事。", durationMinutes: 8, completed: false },
    { id: "memory-ep-02", title: "EP.02 記憶的取捨", description: "不是所有東西都值得記住。", durationMinutes: 7, completed: false },
  ],
  "multi-agent": [
    { id: "multi-agent-ep-01", title: "EP.01 分工的 Agent 們", description: "把大任務拆給多個角色協作完成。", durationMinutes: 9, completed: false },
    { id: "multi-agent-ep-02", title: "EP.02 溝通與協調", description: "Agent 之間如何交換資訊、避免衝突。", durationMinutes: 8, completed: false },
  ],
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
