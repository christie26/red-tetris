import React from "react";
import { Socket } from "socket.io-client";
import "../styles/Buttons.css";

interface StartButtonProps {
  socket: Socket | null;
  visible: boolean;
}

const StartButton: React.FC<StartButtonProps> = ({ socket, visible }) => {
  const handleClick = () => {
    console.log("Leader button clicked");
    socket?.emit("leaderClick");
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
