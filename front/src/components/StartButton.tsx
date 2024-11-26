import React from "react";
import { Socket } from "socket.io-client";
import "../styles/Buttons.css";

interface StartButtonProps {
  socket: Socket | null;
  visible: boolean;
  speed: number;
}

const StartButton: React.FC<StartButtonProps> = ({
  socket,
  visible,
  speed,
}) => {
  const handleClick = () => {
    socket?.emit("leaderClick", { speed: speed });
  };
  if (visible)
    return (
      <button className="button" onClick={handleClick}>
        Start
      </button>
    );
  else return null;
};

export default StartButton;
