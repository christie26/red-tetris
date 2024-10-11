import React, { useEffect } from "react";
import { PlayerInfo } from "./PlayerInfo";

interface MyboardProps {
  roomname: string;
  playername: string;
  isUnique: boolean;
}

const Myboard: React.FC<MyboardProps> = ({
  roomname,
  playername,
  isUnique,
}) => {
  useEffect(() => {
    // TODO-in case of non-unique -> show guide to change playername
    const myboard = document.getElementById("myboard");

    if (myboard) {
      myboard.innerHTML = "";

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          const cellElement = document.createElement("li");
          myboard.appendChild(cellElement);
        }
      }
    }
  }, [roomname, playername]);

  return (
    <div id="myboard-wrapper">
      <div id="myboard" />
      <div id="info">
        <p id="room_info">{`Room: ${roomname}`}</p>
        <PlayerInfo />
      </div>
    </div>
  );
};

export { Myboard };
