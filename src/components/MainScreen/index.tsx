import appLogo from "../../assets/app-logo.svg";
import { HighScoreEntry, formatHighScoreDate } from "../../helpers/highScores";
import "./MainScreen.css";

type MainScreenProps = {
  highScores: HighScoreEntry[];
  onStart: () => void;
};

export const MainScreen = ({ highScores, onStart }: MainScreenProps) => {
  return (
    <div className="main-screen">
      <div className="main-screen__panel">
        <img
          className="main-screen__logo"
          src={appLogo}
          alt="React Shooter Game Engine"
          width={96}
          height={96}
        />
        <p className="main-screen__eyebrow">React Shooter</p>
        <h1 className="main-screen__title">Game Engine</h1>
        <p className="main-screen__subtitle">
          Enjoy!
        </p>

        <button className="main-screen__start" type="button" onClick={onStart}>
          Start Game
        </button>

        <section className="main-screen__highscores" aria-label="High scores">
          <h2>High Scores</h2>
          {highScores.length === 0 ? (
            <p className="main-screen__empty">No records yet. Be the first!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((entry, index) => (
                  <tr key={`${entry.initials}-${entry.date}`}>
                    <td>{index + 1}</td>
                    <td>{entry.initials}</td>
                    <td>{entry.score}</td>
                    <td>{entry.level}</td>
                    <td>{formatHighScoreDate(entry.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};
