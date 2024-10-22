import React from "react";
import "../styles/ScoreBoard.css";

interface ScoreBoardProps {
  scores: Map<string, number>;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores }) => {
  return (
    <div className="scoreboard-container">
      <h2>Score Board</h2>
      {scores.size > 0 ? (
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(scores).map(([player, score], index) => (
              <tr key={player} className={index % 2 === 0 ? "even" : "odd"}>
                <td>{player}</td>
                <td>{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Empty</p>
      )}
    </div>
  );
};

export default ScoreBoard;
