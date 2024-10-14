import React from "react";

interface PlayerInfoProps {
  players: string[];
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ players }) => {
  if (players.length === 0) {
    return null;
  }

  return (
    <div id="player-info">
      <p>Players:</p>
      {players.map((player, index) => (
        <p key={index}>{player}</p>
      ))}
    </div>
  );
};

export { PlayerInfo };
