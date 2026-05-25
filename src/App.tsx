import { useCallback, useState } from "react";
import packageJson from "../package.json";
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

const githubRepoUrl = packageJson.repository.url.replace(/\.git$/, "");

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
      <div className="app-main">
        {screen === "main" && (
          <MainScreen highScores={highScores} onStart={handleStartGame} />
        )}
        {screen === "game" && (
          <>
            <Game
              onGameEnd={handleGameEnd}
              onMainMenu={handleMainMenu}
              suppressEndModals={!!pendingHighScore}
            />
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
      <footer className="app-footer">
        <span className="app-footer__name">{packageJson.description}</span>
        <span className="app-footer__separator">·</span>
        <a
          className="app-footer__link"
          href={githubRepoUrl}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <span className="app-footer__separator">·</span>
        <span className="app-footer__version">v{packageJson.version}</span>
      </footer>
    </div>
  );
}

export default App;
