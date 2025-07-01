import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Popup } from "./Popup";

describe("Popup", () => {
  it("should render popup with title", () => {
    render(<Popup />);

    expect(screen.getByText("Report Generator")).toBeInTheDocument();
  });

  it("should display generate report button", () => {
    render(<Popup />);

    expect(
      screen.getByRole("button", { name: /generate report/i })
    ).toBeInTheDocument();
  });

  it("should display current tab information", () => {
    render(<Popup />);

    expect(screen.getByText(/current page/i)).toBeInTheDocument();
  });
});
