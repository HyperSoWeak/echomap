export type Screen = "library" | "preQuiz" | "map" | "lesson";

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
  title: string;
  createdAt: string;
  preQuizAnswers: string[];
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
      title: string;
      createdAt: string;
    }
  | { type: "courseSelected"; id: string }
  | { type: "preQuizAnswered"; value: string }
  | { type: "preQuizBack" }
  | { type: "preQuizCompleted" }
  | { type: "lessonOpened" }
  | { type: "episodeProgressed"; seconds: number }
  | { type: "questionAnswered"; record: QuestionRecord }
  | { type: "remedialAccepted" }
  | { type: "episodeCompleted" }
  | { type: "navigateBack" }
  | { type: "reset" };

export interface QuizStep {
  id: string;
  eyebrow: string;
  question: string;
  description: string;
  options: string[];
}
