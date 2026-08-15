import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const iconSourceFiles = [
  "src/features/learning/AppHeader.tsx",
  "src/features/learning/CourseLibrary.tsx",
  "src/features/learning/LessonPlayer.tsx",
  "src/features/learning/VoiceQuestion.tsx",
  "src/app/globals.css",
];

describe("learning UI icon usage", () => {
  it("uses icon components instead of inline svg, image icons, emoji, or CSS-drawn icons", () => {
    const source = iconSourceFiles
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).not.toContain("<svg");
    expect(source).not.toContain('src="/icons/');
    expect(source).not.toContain("▶");
    expect(source).not.toContain("Ⅱ");
    expect(source).not.toContain("♥");
    expect(source).not.toContain("mic-symbol");
  });

  it("keeps the graph visualization svg free of icon glyphs", () => {
    const source = readFileSync("src/features/learning/NodeDetail.tsx", "utf8");

    expect(source).toContain('className="concept-graph-lines"');
    expect(source).not.toContain("▶");
    expect(source).not.toContain("Ⅱ");
    expect(source).not.toContain("♥");
  });
});
