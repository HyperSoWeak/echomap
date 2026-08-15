import type { AppState, Screen } from "./types";

export const STORAGE_VERSION = 2;
export const STORAGE_KEY = "learn-audio-map:v1";

const SCREENS: Screen[] = ["library", "followUp", "map", "lesson"];

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<AppState>;
  return (
    Array.isArray(candidate.courses) &&
    (typeof candidate.activeCourseId === "string" ||
      candidate.activeCourseId === null) &&
    typeof candidate.screen === "string" &&
    SCREENS.includes(candidate.screen as Screen)
  );
}

export function loadState(): AppState | null {
  if (typeof window === "undefined") {
    return null;
  }
  const rawState = window.localStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    return null;
  }

  try {
    const stored = JSON.parse(rawState) as {
      version?: unknown;
      state?: unknown;
    };
    return stored.version === STORAGE_VERSION && isAppState(stored.state)
      ? stored.state
      : null;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, state }),
  );
}

export function clearState(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
