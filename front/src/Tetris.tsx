import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Myboard } from "./components/Myboard";
import StartButton from "./components/StartButton";
import InfoBox from "./components/InfoBox";
import OtherBoardsContainer from "./components/OtherBoardsContainer";

function Tetris() {
  const { room: myroom, player: myname } = useParams();
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
    if (!myroom || !myname) {
      console.error("Room or player is undefined");
      return;
    }
    fetch(`http://localhost:8000/${myroom}/${myname}`).then((res) => {
      if (res.status === 200) {
        const newSocket = io("http://localhost:8000", {
          query: { room: myroom, player: myname },
          reconnection: false,
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("Connected to server");
        });
        newSocket.on("join", (data) => {
          if (data.roomname !== myroom || data.player !== myname) return;
          console.log(`Joined as ${data.player}`);
          setInfoVisible(true);
          if (data.type == "leader") {
            setButtonVisible(true);
          }
        });
        newSocket.on("playerList", (data) => {
          if (data.roomname !== myroom) return;
          if (data.playerList) {
            updatePlayers(data.playerList);
          } else {
            console.log("Player list is not available.");
          }
        });
        newSocket.on("startgame", (data) => {
          if (data.roomname !== myroom) return;
          if (data.playerList.find((pl: string) => pl === myname)) {
            setButtonVisible(false);
            setInfoVisible(false);
          }
        });
        newSocket.on("updateboard", (data) => {
          if (data.roomname !== myroom) return;
          if (data.player == myname) {
            myboardRef.current?.updateBoard(data.board);
          }
          //  else if (data.type == "fixed")
          //   otherboardRef.current?.updateBoard(data.board, data.player);
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
  }, [myroom, myname]);

  if (!myroom || !myname || !socket) return null;
  return (
    <div>
      <h1>Red-Tetris</h1>
      <div className="container">
        <OtherBoardsContainer players={players} myname={myname} />
        <div id="myboard-container">
          <div id="myboard-wrapper">
            <InfoBox
              roomname={myroom}
              players={players}
              visible={infoVisible}
            />
            <Myboard ref={myboardRef} />
          </div>
          <div id="under-wrapper">
            {myname}
            <StartButton
              socket={socket}
              roomname={myroom}
              playername={myname}
              visible={isButtonVisible}
            ></StartButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tetris;
