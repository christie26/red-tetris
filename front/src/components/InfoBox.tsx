import React from "react";
import "../styles/InfoBox.css";

interface InfoBoxProps {
  roomname: string;
  players: string[];
}

const InfoBox: React.FC<InfoBoxProps> = ({ roomname, players }) => {
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
    </div>
  );
};

export default InfoBox;
