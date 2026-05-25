import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatInitials } from "../../helpers/highScores";
import "./HighScoreEntry.css";

type HighScoreEntryProps = {
  totalScore: number;
  level: number;
  onSubmit: (initials: string) => void;
};

export const HighScoreEntry = ({
  totalScore,
  level,
  onSubmit,
}: HighScoreEntryProps) => {
  const [initials, setInitials] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (initials.length !== 3) {
      return;
    }

    onSubmit(initials);
  };

  return createPortal(
    <div className="highscore-entry">
      <div
        className="highscore-entry__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="highscore-title"
      >
        <p className="highscore-entry__label">New High Score</p>
        <h2 id="highscore-title">{totalScore}</h2>
        <p className="highscore-entry__meta">Level reached: {level}</p>

        <form onSubmit={handleSubmit}>
          <label className="highscore-entry__input-label" htmlFor="initials">
            Enter your 3-letter name
          </label>

          <div className="highscore-entry__letters">
            {Array.from({ length: 3 }, (_, index) => (
              <span
                key={index}
                className={
                  initials[index]
                    ? "highscore-entry__letter highscore-entry__letter--filled"
                    : "highscore-entry__letter"
                }
              >
                {initials[index] ?? ""}
              </span>
            ))}
          </div>

          <input
            ref={inputRef}
            id="initials"
            className="highscore-entry__input"
            type="text"
            value={initials}
            maxLength={3}
            autoComplete="off"
            spellCheck={false}
            aria-label="Three letter name"
            onChange={(event) =>
              setInitials(formatInitials(event.target.value))
            }
          />

          <button type="submit" disabled={initials.length !== 3}>
            Save Score
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
