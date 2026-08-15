export type Screen = "library" | "followUp" | "map" | "node" | "lesson";

export type NodeStatus = "unlearned" | "learned" | "stuck";

export interface LearningNode {
  id: string;
  conceptId: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  status: NodeStatus;
  kind: "core" | "checkpoint" | "remedial";
}

export interface QuestionRecord {
  id: string;
  transcript: string;
  conceptId: string;
  playbackPositionSeconds: number;
  plainAnswer: string;
  exampleAnswer: string;
  selectedAnswer: string;
  answerStyle: "plain" | "example";
  createdAt: string;
}

export interface Course {
  id: string;
  prompt: string;
  createdAt: string;
  followUpAnswers: string[];
  nodes: LearningNode[];
  episodeProgressSeconds: number;
  conceptQuestionCounts: Record<string, number>;
  questionRecords: QuestionRecord[];
  remedialNodeAdded: boolean;
}

export interface AppState {
  courses: Course[];
  activeCourseId: string | null;
  screen: Screen;
}

export type AppAction =
  | { type: "hydrated"; state: AppState }
  | {
      type: "courseCreated";
      id: string;
      prompt: string;
      createdAt: string;
    }
  | { type: "courseSelected"; id: string }
  | { type: "followUpAnswered"; value: string }
  | { type: "followUpBack" }
  | { type: "followUpCompleted" }
  | { type: "nodeOpened" }
  | { type: "lessonOpened" }
  | { type: "episodeProgressed"; seconds: number }
  | { type: "questionAnswered"; record: QuestionRecord }
  | { type: "remedialAccepted" }
  | { type: "episodeCompleted" }
  | { type: "navigateBack" }
  | { type: "reset" };

export interface FollowUpQuestion {
  id: string;
  eyebrow: string;
  question: string;
  description: string;
  options: string[];
}

export type ConceptNodeStatus = "root" | "learned" | "current" | "locked";

export interface ConceptGraphNode {
  id: string;
  title: string;
  status: ConceptNodeStatus;
  x: number;
  y: number;
}

export interface ConceptGraph {
  nodes: ConceptGraphNode[];
  edges: [string, string][];
}

export interface EpisodePreview {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
}
