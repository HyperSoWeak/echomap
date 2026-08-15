import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without `globals: true` React Testing Library never registers its own auto cleanup,
// so rendered trees would stack up inside one document.
afterEach(cleanup);

const testGlobal = globalThis as typeof globalThis & {
  jsdom?: { window: Window };
};

if (testGlobal.jsdom) {
  Object.defineProperty(testGlobal, "localStorage", {
    configurable: true,
    value: testGlobal.jsdom.window.localStorage,
  });
}
