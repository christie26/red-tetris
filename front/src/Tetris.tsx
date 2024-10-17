import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Myboard } from "./components/Myboard";
import StartButton from "./components/StartButton";
import InfoBox from "./components/InfoBox";
import OtherBoardsContainer from "./components/OtherBoardsContainer";
import MessageBox from "./components/MessageBox";

function keyDownHandler(
  e: globalThis.KeyboardEvent,
  type: string,
  socket: Socket | null,
) {
  if (socket) {
    socket.emit("keyboard", { type: type, key: e.key });
  }
}

function Tetris() {
  const { room: myroom, player: myname } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isButtonVisible, setButtonVisible] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("ready");

  const myboardRef = useRef<{
    updateBoard: (newBoard: number[][]) => void;
  } | null>(null);
  const otherboardRef = useRef<{
    updateBoard: (newBoard: number[][], playername: string) => void;
    updateStatus: (newStatus: string, playername: string) => void;
  } | null>(null);
  // fetch
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
  // socket event listener
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("join", (data) => {
      if (data.roomname !== myroom) return;
      setPlayers(data.playerlist);
      if (data.type === "waiter") {
        console.log("join as waiter", data.playerlist);
        setStatus("waiting");
        for (const player of data.playerlist) {
          const empty = Array.from({ length: 20 }, () => Array(10).fill(0));
          otherboardRef.current?.updateBoard(empty, player);
        }
      }
      if (data.type === "leader") setButtonVisible(true);
    });
    socket.on("leave", (data) => {
      if (data.roomname !== myroom) return;
      if (status === "ready") {
        setPlayers(data.playerlist);
      } else otherboardRef.current?.updateStatus("offline", data.player);
    });
    socket.on("startgame", (data) => {
      if (data.roomname !== myroom) return;
      setWinner(null);
      if (data.playerlist.includes(myname)) {
        setButtonVisible(false);
        setStatus("playing");
      }
      for (const player of data.playerlist) {
        const empty = Array.from({ length: 20 }, () => Array(10).fill(0));
        otherboardRef.current?.updateBoard(empty, player);
        otherboardRef.current?.updateStatus("", player);
      }
    });
    socket.on("updateboard", (data) => {
      if (data.roomname !== myroom) return;
      if (data.player === myname) {
        myboardRef.current?.updateBoard(data.board);
      } else if (data.type === "fixed") {
        otherboardRef.current?.updateBoard(data.board, data.player);
      }
    });
    socket.on("disconnect", () => {
      console.log("disconnected from server");
    });
    socket.on("setleader", (data) => {
      if (data.roomname === myroom && data.playername === myname)
        setButtonVisible(true);
    });

    socket.on("gameover", (data) => {
      if (data.roomname !== myroom || status === "ready") return;
      otherboardRef.current?.updateStatus("died", data.dier);
    });
    socket.on("endgame", (data) => {
      if (data.type === "solo") {
        if (status === "playing") setStatus("solo-play");
        else if (status === "waiting") setStatus("solo-wait");
      } else setWinner(data.winner);
    });
    return () => {
      socket.off("connect");
      socket.off("join");
      socket.off("startgame");
      socket.off("updateboard");
      socket.off("disconnect");
      socket.off("setleader");
      socket.off("leave");
      socket.off("gameover");
      socket.off("endgame");
    };
  }, [socket, myname, myroom, status]);

  useEffect(() => {
    const keyDownListener = (e: KeyboardEvent) =>
      keyDownHandler(e, "down", socket);
    const keyUpListener = (e: KeyboardEvent) => keyDownHandler(e, "up", socket);

    document.addEventListener("keydown", keyDownListener);
    document.addEventListener("keyup", keyUpListener);

    return () => {
      document.removeEventListener("keydown", keyDownListener);
      document.removeEventListener("keyup", keyUpListener);
    };
  }, [socket]);

  if (!myroom || !myname || !socket) return null;
  return (
    <div>
      <h1>Red-Tetris</h1>
      <div className="container">
        <OtherBoardsContainer
          ref={otherboardRef}
          players={players}
          myname={myname}
          gamestatus={status}
        />
        <div id="myboard-container">
          <div id="myboard-wrapper">
            <InfoBox
              roomname={myroom}
              players={players}
              visible={status === "ready"}
            />
            <MessageBox roomname={myroom} winner={winner} status={status} />
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
