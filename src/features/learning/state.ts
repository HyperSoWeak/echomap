import {
  DEMO_NODES,
  DEMO_REMEDIAL_NODE,
  FOLLOW_UP_QUESTIONS,
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
  prompt: string,
  createdAt: string,
): Course {
  return {
    id,
    prompt,
    createdAt,
    followUpAnswers: [],
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
          createCourse(action.id, action.prompt, action.createdAt),
        ],
        activeCourseId: action.id,
        screen: "followUp",
      };

    case "courseSelected": {
      const course = state.courses.find(({ id }) => id === action.id);
      if (!course) {
        return state;
      }
      return {
        ...state,
        activeCourseId: course.id,
        screen:
          course.followUpAnswers.length === FOLLOW_UP_QUESTIONS.length
            ? "map"
            : "followUp",
      };
    }

    case "followUpAnswered":
      return updateActiveCourse(state, (course) => {
        if (course.followUpAnswers.length >= FOLLOW_UP_QUESTIONS.length) {
          return course;
        }
        return {
          ...course,
          followUpAnswers: [...course.followUpAnswers, action.value],
        };
      });

    case "followUpBack":
      return updateActiveCourse(state, (course) => ({
        ...course,
        followUpAnswers: course.followUpAnswers.slice(0, -1),
      }));

    case "followUpCompleted": {
      const course = selectActiveCourse(state);
      return course?.followUpAnswers.length === FOLLOW_UP_QUESTIONS.length
        ? { ...state, screen: "map" }
        : state;
    }

    case "nodeOpened":
      if (!selectActiveCourse(state)) {
        return state;
      }
      return updateActiveCourse(
        { ...state, screen: "node" },
        (course) => ({
          ...course,
          nodes: course.nodes.map((node) =>
            node.conceptId === action.conceptId && node.status === "unlearned"
              ? { ...node, status: "visited" }
              : node,
          ),
        }),
      );

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
      if (state.screen === "node") {
        return { ...state, screen: "map" };
      }
      if (state.screen === "map" || state.screen === "followUp") {
        return { ...state, activeCourseId: null, screen: "library" };
      }
      return state;

    case "reset":
      return createInitialState();
  }
}
