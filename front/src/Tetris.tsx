import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Myboard } from "./components/Myboard";
import StartButton from "./components/StartButton";
import InfoBox from "./components/InfoBox";
import OtherBoardsContainer from "./components/OtherBoardsContainer";
import WaitBox from "./components/WaitBox";

function Tetris() {
  const { room: myroom, player: myname } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isButtonVisible, setButtonVisible] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("ready");

  const myboardRef = useRef<{
    updateBoard: (newBoard: number[][]) => void;
  } | null>(null);
  const otherboardRef = useRef<{
    updateBoard: (newBoard: number[][], playername: string) => void;
    updateStatus: (newStatus: string, playername: string) => void;
  } | null>(null);

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
        return () => {
          newSocket.disconnect();
        };
      } else if (res.status === 400) {
        console.log("bad");
      }
    });
  }, [myroom, myname]);

  socket?.on("connect", () => {
    console.log("Connected to server");
  });
  socket?.on("join", (data) => {
    if (data.roomname !== myroom || data.player !== myname) return;
    console.log(`Joined as ${data.player}`);
    if (data.type === "leader") {
      setButtonVisible(true);
    } else if (data.type === "waiter") {
      setStatus("waiting");
    }
  });
  socket?.on("playerlist", (data) => {
    if (data.roomname !== myroom || status !== "ready") return;
    if (data.playerlist) {
      setPlayers(data.playerlist);
    } else {
      console.log("Player list is not available.");
    }
  });
  socket?.on("startgame", (data) => {
    if (data.roomname !== myroom) return;
    if (data.playerlist.find((pl: string) => pl === myname)) {
      setButtonVisible(false);
      setStatus("playing");
    }
    for (const player of data.playerlist) {
      const empty = Array.from({ length: 20 }, () => Array(10).fill(0));
      otherboardRef.current?.updateBoard(empty, player);
    }
  });
  socket?.on("updateboard", (data) => {
    if (data.roomname !== myroom) return;
    if (data.player === myname) {
      myboardRef.current?.updateBoard(data.board);
    } else if (data.type === "fixed") {
      otherboardRef.current?.updateBoard(data.board, data.player);
    }
  });
  socket?.on("disconnect", () => {
    console.log("disconnected from server");
  });
  socket?.on("newleader", (data) => {
    if (data.roomname === myroom && data.playername === myname)
      setButtonVisible(true);
  });
  socket?.on("leave", (data) => {
    if (data.roomname !== myroom || status === "ready") return;
    otherboardRef.current?.updateStatus("offline", data.player);
  });
  socket?.on("gameover", (data) => {
    console.log("gameover", data);
    if (data.roomname !== myroom || status === "ready") return;
    otherboardRef.current?.updateStatus("died", data.dier);
  });
  socket?.on("endgame", (data) => {
    console.log("endgame", data);
    // TODO:show toaster with the game result.
  });
  function keyDownHandler(e: globalThis.KeyboardEvent, type: string) {
    if (socket) {
      socket.emit("keyboard", { type: type, key: e.key });
    }
  }

  document.addEventListener("keydown", (e) => keyDownHandler(e, "down"));
  document.addEventListener("keyup", (e) => keyDownHandler(e, "up"));

  if (!myroom || !myname || !socket) return null;
  return (
    <div>
      <h1>Red-Tetris</h1>
      <div className="container">
        <OtherBoardsContainer
          ref={otherboardRef}
          players={players}
          myname={myname}
        />
        <div id="myboard-container">
          <div id="myboard-wrapper">
            <InfoBox
              roomname={myroom}
              players={players}
              visible={status === "ready"}
            />
            <WaitBox roomname={myroom} visible={status === "waiting"} />
            <Myboard ref={myboardRef} />
          </div>
          <div id="under-wrapper">
            <StartButton socket={socket} visible={isButtonVisible} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tetris;
