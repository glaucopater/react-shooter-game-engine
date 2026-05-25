import { useCallback, useState } from "react";
import "./App.css";
import Game from "./components/Game";
import { MainScreen } from "./components/MainScreen";
import { HighScoreEntry } from "./components/HighScoreEntry";
import {
  addHighScore,
  loadHighScores,
  qualifiesForHighScore,
  type GameEndResult,
  type HighScoreEntry as HighScoreRecord,
} from "./helpers/highScores";

type AppScreen = "main" | "game";

function App() {
  const [screen, setScreen] = useState<AppScreen>("main");
  const [highScores, setHighScores] = useState<HighScoreRecord[]>(() =>
    loadHighScores()
  );
  const [pendingHighScore, setPendingHighScore] =
    useState<GameEndResult | null>(null);

  const handleStartGame = useCallback(() => {
    setPendingHighScore(null);
    setScreen("game");
  }, []);

  const handleGameEnd = useCallback(
    (result: GameEndResult) => {
      if (qualifiesForHighScore(result.totalScore, highScores)) {
        setPendingHighScore(result);
      }
    },
    [highScores]
  );

  const handleHighScoreSubmit = useCallback(
    (initials: string) => {
      if (!pendingHighScore) {
        return;
      }

      const updated = addHighScore(
        {
          initials,
          score: pendingHighScore.totalScore,
          level: pendingHighScore.level,
        },
        highScores
      );

      setHighScores(updated);
      setPendingHighScore(null);
      setScreen("main");
    },
    [highScores, pendingHighScore]
  );

  const handleMainMenu = useCallback(() => {
    setPendingHighScore(null);
    setScreen("main");
  }, []);

  return (
    <div className="app">
      {screen === "main" && (
        <MainScreen highScores={highScores} onStart={handleStartGame} />
      )}
      {screen === "game" && (
        <>
          <Game onGameEnd={handleGameEnd} onMainMenu={handleMainMenu} />
          {pendingHighScore && (
            <HighScoreEntry
              totalScore={pendingHighScore.totalScore}
              level={pendingHighScore.level}
              onSubmit={handleHighScoreSubmit}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
