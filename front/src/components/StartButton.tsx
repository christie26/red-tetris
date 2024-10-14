import React from "react";
import { Socket } from "socket.io-client";

interface StartButtonProps {
  socket: Socket;
  roomname: string;
  playername: string;
  visible: boolean;
}

const StartButton: React.FC<StartButtonProps> = ({
  socket,
  roomname,
  playername,
  visible,
}) => {
  const handleClick = () => {
    console.log("Leader button clicked");
    socket.emit("leaderClick", { roomname: roomname, playername: playername });
  };
  if (visible)
    return (
      <button id="leaderButton" className="button leader" onClick={handleClick}>
        Start Game
      </button>
    );
  else return null;
};

export default StartButton;
