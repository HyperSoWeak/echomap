import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders the learning application entry", () => {
    render(<Home />);

    expect(
      screen.getByRole("main", { name: "Learn Audio Map" }),
    ).toBeVisible();
  });
});
