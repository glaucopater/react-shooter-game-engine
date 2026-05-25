export type HighScoreEntry = {
  initials: string;
  score: number;
  level: number;
  date: number;
};

export type GameEndResult = {
  level: number;
  score: number;
  totalScore: number;
  didWin: boolean;
};

export const HIGH_SCORES_STORAGE_KEY = "react-game-engine-high-scores";
export const MAX_HIGH_SCORES = 10;

export const loadHighScores = (): HighScoreEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(HIGH_SCORES_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as HighScoreEntry[];
    return sortHighScores(parsed).slice(0, MAX_HIGH_SCORES);
  } catch {
    return [];
  }
};

export const saveHighScores = (entries: HighScoreEntry[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    HIGH_SCORES_STORAGE_KEY,
    JSON.stringify(sortHighScores(entries).slice(0, MAX_HIGH_SCORES))
  );
};

export const sortHighScores = (entries: HighScoreEntry[]) =>
  [...entries].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return right.date - left.date;
  });

export const qualifiesForHighScore = (
  score: number,
  entries: HighScoreEntry[],
  maxEntries: number = MAX_HIGH_SCORES
) => {
  if (score <= 0) {
    return false;
  }

  if (entries.length < maxEntries) {
    return true;
  }

  const lowestScore = entries[entries.length - 1]?.score ?? 0;
  return score > lowestScore;
};

export const addHighScore = (
  entry: Omit<HighScoreEntry, "date"> & { date?: number },
  entries: HighScoreEntry[] = loadHighScores()
) => {
  const nextEntry: HighScoreEntry = {
    ...entry,
    initials: entry.initials.toUpperCase().slice(0, 3),
    date: entry.date ?? Date.now(),
  };
  const updated = sortHighScores([...entries, nextEntry]).slice(0, MAX_HIGH_SCORES);

  saveHighScores(updated);
  return updated;
};

export const formatInitials = (value: string) =>
  value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);

export const formatHighScoreDate = (timestamp: number) => {
  if (!timestamp) {
    return "—";
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
