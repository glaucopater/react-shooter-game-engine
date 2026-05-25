import { render, screen, fireEvent } from "@testing-library/react";
import { HighScoreEntry } from "./index";

describe("HighScoreEntry", () => {
  it("submits a three-letter name", () => {
    const onSubmit = vi.fn();

    render(
      <HighScoreEntry totalScore={42} level={2} onSubmit={onSubmit} />
    );

    fireEvent.change(screen.getByLabelText("Three letter name"), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Score" }));

    expect(onSubmit).toHaveBeenCalledWith("ABC");
  });
});
