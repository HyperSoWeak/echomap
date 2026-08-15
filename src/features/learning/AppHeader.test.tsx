import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "./AppHeader";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
  window.dispatchEvent(new Event("scroll"));
}

describe("AppHeader", () => {
  it("hides after the page scrolls down", async () => {
    render(<AppHeader />);

    const header = screen.getByRole("banner");
    expect(header).not.toHaveClass("app-header-hidden");

    setScrollY(24);

    await waitFor(() => expect(header).toHaveClass("app-header-hidden"));
  });

  it("uses consistent svg icons for header actions", () => {
    render(<AppHeader backLabel="返回" onBack={vi.fn()} onReset={vi.fn()} />);

    const back = screen.getByRole("button", { name: "返回" });
    expect(back.querySelector("svg")).not.toBeNull();
    expect(back).not.toHaveTextContent("←");

    const reset = screen.getByRole("button", { name: "重新開始" });
    expect(reset.querySelector("svg")).not.toBeNull();
  });
});
