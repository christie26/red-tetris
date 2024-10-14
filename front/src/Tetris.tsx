import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Myboard } from "./components/Myboard";
import StartButton from "./components/StartButton";
import InfoBox from "./components/InfoBox";

function Tetris() {
  const { room, player } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isButtonVisible, setButtonVisible] = useState<boolean>(false);
  const [infoVisible, setInfoVisible] = useState<boolean>(false);

  const myboardRef = useRef<{
    updateBoard: (newBoard: number[][]) => void;
  } | null>(null);
  const updatePlayers = (newPlayers: string[]) => {
    setPlayers(newPlayers);
  };
  useEffect(() => {
    if (!room || !player) {
      console.error("Room or player is undefined");
      return;
    }
    fetch(`http://localhost:8000/${room}/${player}`).then((res) => {
      if (res.status === 200) {
        const newSocket = io("http://localhost:8000", {
          query: { room: room, player: player },
          reconnection: false,
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("Connected to server");
        });
        newSocket.on("join", (data) => {
          if (data.roomname !== room || data.player !== player) return;
          console.log(`Joined as ${data.player}`);
          setInfoVisible(true);
          if (data.type == "leader") {
            setButtonVisible(true);
          }
        });
        newSocket.on("playerList", (data) => {
          if (data.roomname !== room) return;
          if (data.playerList) {
            updatePlayers(data.playerList);
          } else {
            console.log("Player list is not available.");
          }
        });
        newSocket.on("startgame", (data) => {
          if (data.roomname !== room) return;
          if (data.playerList.find((pl: string) => pl === player)) {
            setButtonVisible(false);
            setInfoVisible(false);
          }
        });
        newSocket.on("updateboard", (data) => {
          if (data.roomname !== room) return;
          if (data.player == player) {
            myboardRef.current?.updateBoard(data.board);
          }
          // else if (data.type == "fixed") renderOtherBoard(data);
        });
        newSocket.on("disconnect", () => {
          console.log("disconnected from server");
        });
        return () => {
          newSocket.disconnect();
        };
      } else if (res.status === 400) {
        console.log("bad");
      }
    });
  }, [room, player]);

  return (
    <div>
      <h1>Red-Tetris</h1>
      <div className="container">
        <div id="containerWrapper"></div>
        <div id="myboard-container">
          <div id="myboard-wrapper">
            {room && (
              <InfoBox
                roomname={room}
                players={players}
                visible={infoVisible}
              />
            )}
            <Myboard ref={myboardRef} />
          </div>
          <div id="under-wrapper">
            {player}
            {room && player && socket && (
              <StartButton
                socket={socket}
                roomname={room}
                playername={player}
                visible={isButtonVisible}
              ></StartButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tetris;
