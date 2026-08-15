import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import {
  clearState,
  loadState,
  saveState,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "./storage";

describe("learning state storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores matching versioned state", () => {
    const state = createInitialState();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, state }),
    );

    expect(loadState()).toEqual(state);
  });

  it("discards an unsupported schema version", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION - 1,
        state: { courses: [{ invalid: true }] },
      }),
    );

    expect(loadState()).toBeNull();
  });

  it("discards malformed stored state", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");

    expect(loadState()).toBeNull();
  });

  it("saves and clears state", () => {
    const state = createInitialState();
    saveState(state);
    expect(loadState()).toEqual(state);

    clearState();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
