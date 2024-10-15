import React from "react";

interface WaitBoxProps {
  roomname: string;
  visible: boolean;
}

const WaitBox: React.FC<WaitBoxProps> = ({ roomname, visible }) => {
  if (visible)
    return (
      <div id="info">
        <div id="room-info">{`Room: ${roomname}`}</div>{" "}
        <div id="player-info">
          <div>They are playing. You should wait until it finishes.</div>
        </div>
      </div>
    );
  else return null;
};

export default WaitBox;
