import "@testing-library/jest-dom/vitest";

const testGlobal = globalThis as typeof globalThis & {
  jsdom?: { window: Window };
};

if (testGlobal.jsdom) {
  Object.defineProperty(testGlobal, "localStorage", {
    configurable: true,
    value: testGlobal.jsdom.window.localStorage,
  });
}
