import Game from "./";
import { render, fireEvent } from "@testing-library/react";
import { WIN_SCORE } from "../../constants";

describe("Game", () => {
  it("should render the game", () => {
    const { getByText, queryByText } = render(<Game />);
    expect(getByText("Health: 100")).toBeInTheDocument();
    expect(getByText("Level 1")).toBeInTheDocument();
    expect(getByText(`Score: 0 / ${WIN_SCORE}`)).toBeInTheDocument();
    expect(queryByText("Game Over!")).toBeNull();
    expect(queryByText("Restart")).toBeNull();
    expect(queryByText("Game Paused")).toBeNull();
    expect(queryByText("Resume")).toBeNull();
  });

  it("should handle player movement", () => {
    const { getByText } = render(<Game />);
    fireEvent.keyDown(document.body, { key: "ArrowUp" });
    expect(getByText("Health: 100")).toBeInTheDocument();
  });

  it.skip("should handle enemy movement", async () => {
    const { getByTestId } = render(<Game />);
    expect(getByTestId("enemy-0")).toBeInTheDocument();

    let i = 0;
    setInterval(() => Promise.resolve().then(() => console.log(++i)), 5000);

    await vi.advanceTimersByTimeAsync(1000);
    vi.advanceTimersByTime(20000);
    expect(getByTestId("enemy-1")).toBeInTheDocument();
    vi.advanceTimersByTime(10000);
    expect(getByTestId("enemy-1")).toHaveAttribute("data-x", "1");
    expect(getByTestId("enemy-1")).toHaveAttribute("data-y", "1");
  });

  it.skip("should handle enemy collision", () => {
    const { getByTestId, getByText } = render(<Game />);
    fireEvent.keyDown(document.body, { key: "ArrowUp" });
    vi.useFakeTimers();
    vi.advanceTimersByTime(10000);
    expect(getByTestId("enemy-0")).toBeInTheDocument();
    fireEvent.click(getByTestId("enemy-0"));
    expect(getByTestId("enemy-0")).not.toBeInTheDocument();
    expect(getByText("Health:")).toHaveTextContent("Health: 9");
  });
});
