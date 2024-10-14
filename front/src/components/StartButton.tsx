import React from "react";
import { Socket } from "socket.io-client";

interface StartButtonProps {
  socket: Socket;
  roomname: string;
  playername: string;
  visible: boolean;
  setButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const StartButton: React.FC<StartButtonProps> = ({
  socket,
  roomname,
  playername,
  visible,
  setButtonVisible,
}) => {
  const handleClick = () => {
    console.log("Leader button clicked");
    socket.emit("leaderClick", { roomname: roomname, playername: playername });
    setButtonVisible(false);
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
