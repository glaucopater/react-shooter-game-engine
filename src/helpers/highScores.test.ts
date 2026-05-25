import {
  addHighScore,
  formatInitials,
  formatHighScoreDate,
  qualifiesForHighScore,
  sortHighScores,
  type HighScoreEntry,
} from "./highScores";

const createEntry = (
  initials: string,
  score: number,
  level: number,
  date: number
): HighScoreEntry => ({
  initials,
  score,
  level,
  date,
});

describe("highScores", () => {
  it("sorts entries by score descending", () => {
    const entries = [
      createEntry("BOB", 10, 1, 2),
      createEntry("AAA", 50, 3, 1),
      createEntry("ZED", 30, 2, 3),
    ];

    expect(sortHighScores(entries).map((entry) => entry.initials)).toEqual([
      "AAA",
      "ZED",
      "BOB",
    ]);
  });

  it("qualifies when the board is not full or the score is higher", () => {
    expect(qualifiesForHighScore(20, [])).toBe(true);
    expect(qualifiesForHighScore(0, [])).toBe(false);

    const fullBoard = Array.from({ length: 10 }, (_, index) =>
      createEntry("A" + index, 100 - index, 4, index)
    );

    expect(qualifiesForHighScore(95, fullBoard)).toBe(true);
    expect(qualifiesForHighScore(90, fullBoard)).toBe(false);
  });

  it("formats initials to three uppercase letters", () => {
    expect(formatInitials("ab1c")).toBe("ABC");
    expect(formatInitials("xy")).toBe("XY");
  });

  it("formats score dates for display", () => {
    expect(formatHighScoreDate(0)).toBe("—");
    expect(formatHighScoreDate(Date.UTC(2026, 4, 25))).toMatch(/2026/);
  });

  it("adds a new entry and keeps only the top scores", () => {
    const existing = Array.from({ length: 10 }, (_, index) =>
      createEntry("A" + index, 100 - index, 4, index)
    );

    const updated = addHighScore(
      { initials: "new", score: 95, level: 4 },
      existing
    );

    expect(updated).toHaveLength(10);
    expect(updated.some((entry) => entry.initials === "NEW")).toBe(true);
    expect(updated.some((entry) => entry.score === 90)).toBe(false);
  });
});
