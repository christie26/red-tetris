import React from "react";

interface WaitBoxProps {
  roomname: string;
  visible: boolean;
}

const WaitBox: React.FC<WaitBoxProps> = ({ roomname, visible }) => {
  if (visible)
    return (
      <div className="info-wrapper">
        <div className="info">
          <div>Room: {roomname}</div>
          <div>They are playing. You should wait until it ends.</div>
        </div>
      </div>
    );
  else return null;
};

export default WaitBox;
