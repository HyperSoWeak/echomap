import type {
  ConceptGraph,
  EpisodePreview,
  FollowUpQuestion,
  LearningNode,
} from "./types";

export const DEMO_CONCEPT_IDS = [
  "ai-model",
  "llm",
  "ai-agent",
  "agent-loop",
  "goal-clarification",
  "task-decomposition",
  "tool-selection",
  "working-memory",
  "result-validation",
  "safe-agent",
  "agent-workflow",
] as const;

export const PRIMARY_CONCEPT_ID = "ai-agent";

export const DEMO_NODES: LearningNode[] = [
  {
    id: "ai-model",
    conceptId: "ai-model",
    title: "人工智慧模型",
    subtitle: "輸入、輸出與指令",
    durationMinutes: 4,
    status: "learned",
    kind: "core",
  },
  {
    id: "llm",
    conceptId: "llm",
    title: "大型語言模型",
    subtitle: "文字脈絡如何影響回答",
    durationMinutes: 5,
    status: "learned",
    kind: "core",
  },
  {
    id: "ai-agent",
    conceptId: "ai-agent",
    title: "AI Agent",
    subtitle: "為目標規劃並執行多個步驟",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "agent-loop",
    conceptId: "agent-loop",
    title: "Agent 循環",
    subtitle: "觀察、決策、行動再讀取結果",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "goal-clarification",
    conceptId: "goal-clarification",
    title: "目標澄清",
    subtitle: "目標、限制與完成條件",
    durationMinutes: 5,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "task-decomposition",
    conceptId: "task-decomposition",
    title: "任務分解",
    subtitle: "拆成有依賴的小步驟",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "tool-selection",
    conceptId: "tool-selection",
    title: "工具選擇",
    subtitle: "選工具、填參數、讀結果",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "working-memory",
    conceptId: "working-memory",
    title: "記憶管理",
    subtitle: "工作記憶、長期記憶與隱私",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "result-validation",
    conceptId: "result-validation",
    title: "結果驗證",
    subtitle: "完成動作不等於完成任務",
    durationMinutes: 6,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "safe-agent",
    conceptId: "safe-agent",
    title: "安全 AI Agent",
    subtitle: "最小權限、提示注入與人類確認",
    durationMinutes: 7,
    status: "unlearned",
    kind: "core",
  },
  {
    id: "agent-workflow",
    conceptId: "agent-workflow",
    title: "完整 Agent 工作流程",
    subtitle: "釐清、分解、執行、驗證與回報",
    durationMinutes: 7,
    status: "unlearned",
    kind: "checkpoint",
  },
];

export const DEMO_REMEDIAL_NODE: LearningNode = {
  id: "ai-agent-remedial",
  conceptId: "ai-agent",
  title: "AI Agent 補強練習",
  subtitle: "用旅行規劃重建 Agent 和自動化的差異",
  durationMinutes: 4,
  status: "unlearned",
  kind: "remedial",
};

export const DEMO_CONCEPT_GRAPH: ConceptGraph = {
  nodes: [
    { id: "input-output", title: "輸入與輸出", status: "root", x: 12, y: 18 },
    { id: "instruction", title: "指令", status: "root", x: 31, y: 18 },
    { id: "ai-model", title: "人工智慧模型", status: "learned", x: 22, y: 35 },
    { id: "llm", title: "大型語言模型", status: "learned", x: 43, y: 35 },
    { id: "context", title: "文字脈絡", status: "root", x: 61, y: 18 },
    { id: "goal", title: "目標", status: "root", x: 78, y: 18 },
    { id: "ai-agent", title: "AI Agent", status: "current", x: 62, y: 52 },
    { id: "agent-loop", title: "Agent 循環", status: "locked", x: 82, y: 52 },
    { id: "goal-clarification", title: "目標澄清", status: "locked", x: 17, y: 69 },
    { id: "task-decomposition", title: "任務分解", status: "locked", x: 38, y: 69 },
    { id: "tool-selection", title: "工具選擇", status: "locked", x: 59, y: 69 },
    { id: "result-validation", title: "結果驗證", status: "locked", x: 80, y: 69 },
    { id: "least-privilege", title: "最小權限", status: "locked", x: 17, y: 88 },
    { id: "prompt-injection-risk", title: "提示注入風險", status: "locked", x: 38, y: 88 },
    { id: "human-approval", title: "人類確認", status: "locked", x: 59, y: 88 },
    { id: "agent-workflow", title: "完整工作流程", status: "locked", x: 80, y: 88 },
  ],
  edges: [
    ["input-output", "ai-model"],
    ["instruction", "ai-model"],
    ["ai-model", "llm"],
    ["context", "llm"],
    ["llm", "ai-agent"],
    ["goal", "ai-agent"],
    ["ai-agent", "agent-loop"],
    ["ai-agent", "goal-clarification"],
    ["goal-clarification", "task-decomposition"],
    ["task-decomposition", "tool-selection"],
    ["tool-selection", "result-validation"],
    ["least-privilege", "agent-workflow"],
    ["prompt-injection-risk", "agent-workflow"],
    ["human-approval", "agent-workflow"],
    ["result-validation", "agent-workflow"],
  ],
};

export const DEMO_EPISODES: EpisodePreview[] = [
  {
    id: "ep-01",
    title: "第一課：回答問題和完成任務有何不同",
    description: "用高雄旅行例子區分一般回答、腳本自動化與 AI Agent。",
    durationMinutes: 6,
    completed: true,
  },
  {
    id: "ep-02",
    title: "第二課：先把模糊願望變成可完成的目標",
    description: "把目標、限制條件與完成條件說清楚。",
    durationMinutes: 5,
    completed: false,
  },
  {
    id: "ep-03",
    title: "第三課：把大任務拆成能執行的小步驟",
    description: "理解子任務、依賴關係、計畫與重新規劃。",
    durationMinutes: 6,
    completed: false,
  },
  {
    id: "ep-04",
    title: "第四課：工具讓 Agent 接觸外部世界",
    description: "選工具、填參數，並檢查工具結果是否可信。",
    durationMinutes: 6,
    completed: false,
  },
  {
    id: "ep-05",
    title: "第五課：記憶不是把所有資料永久保存",
    description: "分辨工作記憶、長期記憶、保存政策與隱私風險。",
    durationMinutes: 6,
    completed: false,
  },
  {
    id: "ep-06",
    title: "第六課：完成動作不代表完成任務",
    description: "用行事曆例子理解事實驗證、結果驗證與可觀察性。",
    durationMinutes: 6,
    completed: false,
  },
  {
    id: "ep-07",
    title: "第七課：外部內容不一定是可信指令",
    description: "學會把可信指令和網頁、信件等外部資料分開。",
    durationMinutes: 6,
    completed: false,
  },
  {
    id: "ep-08",
    title: "第八課：什麼時候要讓人類接手",
    description: "根據風險、權限與可逆性設計確認點。",
    durationMinutes: 6,
    completed: false,
  },
  {
    id: "ep-09",
    title: "第九課：組合完整的 Agent 工作流程",
    description: "把釐清、分解、工具、驗證、調整與回報串起來。",
    durationMinutes: 7,
    completed: false,
  },
];

export const DEMO_CONCEPT_EPISODES: Record<string, EpisodePreview[]> = {
  "ai-agent": [
    DEMO_EPISODES[0],
    {
      id: "ai-agent-extra-01",
      title: "補充：Agent 和自動化腳本差在哪裡",
      description: "用固定流程、工具呼叫與目標導向調整做比較。",
      durationMinutes: 5,
      completed: false,
    },
  ],
  "agent-loop": [
    DEMO_EPISODES[0],
    DEMO_EPISODES[8],
  ],
  "goal-clarification": [
    DEMO_EPISODES[1],
    {
      id: "goal-clarification-extra-01",
      title: "練習：把整理信件說清楚",
      description: "補上信件範圍、分類方式與輸出格式。",
      durationMinutes: 4,
      completed: false,
    },
  ],
  "task-decomposition": [
    DEMO_EPISODES[2],
    {
      id: "task-decomposition-extra-01",
      title: "練習：替十人會議排出依賴順序",
      description: "指出哪些任務必須先完成，哪些能平行處理。",
      durationMinutes: 5,
      completed: false,
    },
  ],
  "tool-selection": [
    DEMO_EPISODES[3],
    {
      id: "tool-selection-extra-01",
      title: "練習：什麼情況該用工具",
      description: "比較查天氣、讀行事曆、計算費用與單純整理文字。",
      durationMinutes: 5,
      completed: false,
    },
  ],
  "result-validation": [
    DEMO_EPISODES[5],
    {
      id: "result-validation-extra-01",
      title: "練習：檢查行事曆是否真的建立正確",
      description: "回讀日期、時區、對象與重複事件。",
      durationMinutes: 5,
      completed: false,
    },
  ],
  "prompt-injection-risk": [
    DEMO_EPISODES[6],
    {
      id: "prompt-injection-risk-extra-01",
      title: "練習：把網頁文字當資料而不是指令",
      description: "辨認惡意內容如何試圖改變 Agent 的目標。",
      durationMinutes: 5,
      completed: false,
    },
  ],
  "agent-workflow": [
    DEMO_EPISODES[8],
    {
      id: "agent-workflow-extra-01",
      title: "收束：設計一個安全、可驗證的簡單 Agent",
      description: "替資料蒐集助理寫出權限、工具、驗證與確認點。",
      durationMinutes: 7,
      completed: false,
    },
  ],
};

export const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  {
    id: "agent-difference",
    eyebrow: "概念檢查",
    question: "AI Agent 和一般問答系統最大的差別可能是什麼？",
    description: "確認你是否抓到 Agent 的目標導向與多步驟特性。",
    options: [
      "Agent 能為目標規劃並執行多個步驟",
      "Agent 一定有機器人的身體",
      "Agent 永遠不會犯錯",
    ],
  },
  {
    id: "weather-tool",
    eyebrow: "工具判斷",
    question: "Agent 要查詢即時天氣，最適合怎麼做？",
    description: "即時資料需要可靠外部來源，而不是靠模型記憶猜測。",
    options: [
      "使用可靠的天氣工具取得資料",
      "只靠記憶猜測",
      "隨機產生答案",
    ],
  },
  {
    id: "email-approval",
    eyebrow: "風險控制",
    question: "Agent 準備替使用者寄出重要信件前，應該優先做什麼？",
    description: "高風險、對外產生影響的動作應該先讓人確認。",
    options: [
      "顯示內容並取得確認",
      "不經檢查立刻寄出",
      "把信件永久刪除",
    ],
  },
  {
    id: "tool-error",
    eyebrow: "錯誤處理",
    question: "工具執行失敗時，Agent 應該怎麼做？",
    description: "失敗要被辨認、記錄，並選擇安全的下一步。",
    options: [
      "辨認錯誤、嘗試安全替代方案或請求協助",
      "假裝已經成功",
      "一直重複相同操作",
    ],
  },
  {
    id: "agent-project",
    eyebrow: "學習落點",
    question: "你最想先設計哪一種 Agent？",
    description: "最後會用你的選擇收束成安全、可驗證的工作流程。",
    options: [
      "資料蒐集與摘要助理",
      "行程規劃助理",
      "任務追蹤與提醒助理",
    ],
  },
];

export const DEMO_EPISODE = {
  title: "第一課：回答問題和完成任務有何不同",
  description: "從高雄兩日旅行規劃理解 AI Agent 和一般聊天機器人的差異。",
  durationSeconds: 360,
  audioSrc: "/audio/demo-lesson.wav",
  transcript:
    "想像你問一個聊天系統：「去高雄旅行要準備什麼？」它整理出一份建議，任務便結束了。如果你交給 Agent 的目標是：「依照我的預算，規劃高雄兩日行程」，它可能要先確認日期與偏好，再查詢天氣、交通和營業時間，接著比較方案並整理結果。Agent 的重點不只是產生一段文字，而是圍繞目標進行多個步驟。它會觀察目前資訊、決定下一步、採取行動，再閱讀結果。這叫做 Agent 循環。不過，Agent 不一定越自主越好。查資料可以自動進行；替你刷卡訂房，則應先取得確認。這一課請記得：模型產生輸出，Agent 則圍繞目標反覆觀察、決策與行動。",
} as const;

export const SUGGESTED_QUESTIONS = [
  "所以只要會呼叫工具，就算 Agent 嗎？",
  "讓 Agent 自己決定越多，不是越聰明嗎？",
  "可以用一句話總結好的 Agent 嗎？",
] as const;

export const FALLBACK_ANSWERS = {
  plain:
    "不一定。單次按照固定規則呼叫工具，也可能只是一段自動化流程。Agent 通常會根據目標與目前結果，判斷下一步、選擇行動，並在環境改變時調整計畫。",
  example:
    "以旅行規劃來說，固定腳本只會照順序查資料；Agent 會先確認日期和偏好，遇到景點休館時重新安排，訂房或付款前再請你確認。",
} as const;
