import React from "react";

interface InfoBoxProps {
  roomname: string;
  players: string[];
  visible: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({ roomname, players, visible }) => {
  if (visible)
    return (
      <div id="info">
        <div id="room-info">{`Room: ${roomname}`}</div>{" "}
        <div id="player-info">
          <div>Players:</div>
          {players.map((player, index) => (
            <div key={index}>{player}</div>
          ))}
        </div>
      </div>
    );
  else return null;
};

export default InfoBox;
