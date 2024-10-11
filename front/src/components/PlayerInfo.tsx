import React, { useEffect, useState } from "react";

let updatePlayers: (newPlayers: string[]) => void;

const PlayerInfo: React.FC = () => {
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    updatePlayers = (newPlayers: string[]) => {
        console.log('updatePlayers called')
      setPlayers(newPlayers);
    };
  }, []);

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

export { PlayerInfo, updatePlayers };
