import {
  DEMO_NODES,
  DEMO_REMEDIAL_NODE,
  PRIMARY_CONCEPT_ID,
} from "./demo-data";
import type { AppAction, AppState, Course } from "./types";

export function createInitialState(): AppState {
  return {
    courses: [],
    activeCourseId: null,
    screen: "library",
  };
}

export function selectActiveCourse(state: AppState): Course | undefined {
  return state.courses.find((course) => course.id === state.activeCourseId);
}

function updateActiveCourse(
  state: AppState,
  update: (course: Course) => Course,
): AppState {
  if (!state.activeCourseId) {
    return state;
  }

  return {
    ...state,
    courses: state.courses.map((course) =>
      course.id === state.activeCourseId ? update(course) : course,
    ),
  };
}

function createCourse(
  id: string,
  title: string,
  createdAt: string,
): Course {
  return {
    id,
    title,
    createdAt,
    preQuizAnswers: [],
    nodes: DEMO_NODES.map((node) => ({ ...node })),
    episodeProgressSeconds: 0,
    conceptQuestionCounts: {},
    questionRecords: [],
    remedialNodeAdded: false,
  };
}

export function learningReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "hydrated":
      return action.state;

    case "courseCreated":
      return {
        courses: [
          ...state.courses,
          createCourse(action.id, action.title, action.createdAt),
        ],
        activeCourseId: action.id,
        screen: "preQuiz",
      };

    case "courseSelected": {
      const course = state.courses.find(({ id }) => id === action.id);
      if (!course) {
        return state;
      }
      return {
        ...state,
        activeCourseId: course.id,
        screen: course.preQuizAnswers.length === 5 ? "map" : "preQuiz",
      };
    }

    case "preQuizAnswered":
      return updateActiveCourse(state, (course) => {
        if (course.preQuizAnswers.length >= 5) {
          return course;
        }
        return {
          ...course,
          preQuizAnswers: [...course.preQuizAnswers, action.value],
        };
      });

    case "preQuizBack":
      return updateActiveCourse(state, (course) => ({
        ...course,
        preQuizAnswers: course.preQuizAnswers.slice(0, -1),
      }));

    case "preQuizCompleted": {
      const course = selectActiveCourse(state);
      return course?.preQuizAnswers.length === 5
        ? { ...state, screen: "map" }
        : state;
    }

    case "lessonOpened":
      return selectActiveCourse(state) ? { ...state, screen: "lesson" } : state;

    case "episodeProgressed":
      return updateActiveCourse(state, (course) => ({
        ...course,
        episodeProgressSeconds: Math.max(0, action.seconds),
      }));

    case "questionAnswered":
      return updateActiveCourse(state, (course) => {
        const questionCount =
          (course.conceptQuestionCounts[action.record.conceptId] ?? 0) + 1;
        return {
          ...course,
          conceptQuestionCounts: {
            ...course.conceptQuestionCounts,
            [action.record.conceptId]: questionCount,
          },
          questionRecords: [...course.questionRecords, action.record],
          nodes: course.nodes.map((node) =>
            node.conceptId === action.record.conceptId && questionCount >= 2
              ? { ...node, status: "stuck" }
              : node,
          ),
        };
      });

    case "remedialAccepted":
      return updateActiveCourse(state, (course) => {
        const stuckIndex = course.nodes.findIndex(
          (node) =>
            node.conceptId === PRIMARY_CONCEPT_ID && node.status === "stuck",
        );
        if (course.remedialNodeAdded || stuckIndex === -1) {
          return course;
        }
        const nodes = [...course.nodes];
        nodes.splice(stuckIndex + 1, 0, { ...DEMO_REMEDIAL_NODE });
        return { ...course, nodes, remedialNodeAdded: true };
      });

    case "episodeCompleted":
      return updateActiveCourse(state, (course) => ({
        ...course,
        nodes: course.nodes.map((node) =>
          node.conceptId === PRIMARY_CONCEPT_ID && node.status !== "stuck"
            ? { ...node, status: "learned" }
            : node,
        ),
      }));

    case "navigateBack":
      if (state.screen === "lesson") {
        return { ...state, screen: "map" };
      }
      if (state.screen === "map" || state.screen === "preQuiz") {
        return { ...state, activeCourseId: null, screen: "library" };
      }
      return state;

    case "reset":
      return createInitialState();
  }
}
