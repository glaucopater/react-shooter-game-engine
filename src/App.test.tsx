import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the main screen with high scores", () => {
    render(<App />);

    expect(screen.getByText("Game Engine")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Game" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "High Scores" })).toBeInTheDocument();
    expect(screen.getByText("v1.0.1")).toBeInTheDocument();
  });

  it("starts the game from the main screen", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Start Game" }));

    expect(screen.getByText("Level 1")).toBeInTheDocument();
    expect(screen.queryByText("Game Engine")).not.toBeInTheDocument();
  });
});
