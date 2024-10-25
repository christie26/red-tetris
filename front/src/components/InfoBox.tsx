import React from "react";
import "../styles/InfoBox.css";

interface InfoBoxProps {
  roomname: string;
  players: string[];
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  isLeader: boolean;
  status: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  roomname,
  players,
  speed,
  setSpeed,
  isLeader,
  status,
}) => {
  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number(event.target.value);
    setSpeed(newSpeed);
  };

  return (
    <div className="InfoBox-container">
      <h3>Room Info</h3>
      <div>
        <p>Room: {roomname}</p>
        {players.length > 0 && (
          <>
            <p>Players:</p>
            {players.map((player, index) => (
              <p key={index}>{player}</p>
            ))}
          </>
        )}
      </div>
      {isLeader && status !== "playing" && (
        <div className="speedControl">
          <label htmlFor="speedControl">Speed: {speed}x</label>
          <input
            id="speedControl"
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={speed}
            onChange={handleSpeedChange}
          />
        </div>
      )}
    </div>
  );
};

export default InfoBox;
