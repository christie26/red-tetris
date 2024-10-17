import React from "react";

interface InfoBoxProps {
  roomname: string;
  players: string[];
  visible: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({ roomname, players, visible }) => {
  if (visible)
    return (
      <div className="info-wrapper">
        <div className="info">
          <div>Room: {roomname}</div>
          <div>
            <div>Players:</div>
            {players.map((player, index) => (
              <div key={index}>{player}</div>
            ))}
          </div>
        </div>
      </div>
    );
  else return null;
};

export default InfoBox;
