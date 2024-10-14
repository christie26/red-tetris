import React from "react";
import { PlayerInfo } from "./PlayerInfo";

interface InfoBoxProps {
  roomname: string;
  players: string[];
  visible: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({ roomname, players, visible }) => {
  if (visible)
    return (
      <div id="info">
        <p id="room_info">{`Room: ${roomname}`}</p>{" "}
        {visible && <PlayerInfo players={players} />}
      </div>
    );
  else return null;
};

export default InfoBox;
