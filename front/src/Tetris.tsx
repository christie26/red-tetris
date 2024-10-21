import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Myboard } from "./components/Myboard";
import StartButton from "./components/StartButton";
import InfoBox from "./components/InfoBox";
import OtherBoardsContainer from "./components/OtherBoardsContainer";
import SpeedControl from "./components/SpeedControl";

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
  const [isLeader, SetIsLeader] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("ready");

  const myboardRef = useRef<{
    updateBoard: (newBoard: number[][]) => void;
  } | null>(null);
  const otherboardRef = useRef<{
    updateBoard: (newBoard: number[][], playername: string) => void;
    updateStatus: (newStatus: string, playername: string) => void;
  } | null>(null);
  // fetch from server
  useEffect(() => {
    if (!myroom || !myname) {
      console.error("Room or player is undefined");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/${myroom}/${myname}`);

        if (res.status === 200) {
          const newSocket = io("http://localhost:8000", {
            query: { room: myroom, player: myname },
            reconnection: false,
          });

          newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
          });

          newSocket.on("disconnect", (reason) => {
            console.warn("Socket disconnected:", reason);
          });

          setSocket(newSocket);

          return () => {
            newSocket.disconnect();
          };
        } else if (res.status === 400) {
          setStatus("error");
          console.error("Bad request: Room or player invalid");
        } else {
          console.error(`Unexpected response status: ${res.status}`);
        }
      } catch (error) {
        setStatus("waitServer");
        console.log("Fetch or connection error:", error);
      }
    };

    fetchData();
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
      if (data.type === "leader") SetIsLeader(true);
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
      setPlayers(data.playerlist);
      if (data.playerlist.includes(myname)) {
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
        SetIsLeader(true);
    });
    socket.on("gameover", (data) => {
      if (data.roomname !== myroom || status === "ready") return;
      otherboardRef.current?.updateStatus("died", data.dier);
    });
    socket.on("endgame", (data) => {
      if (status === "playing") setStatus("end-play");
      else if (status === "waiting") setStatus("end-wait");
      if (data.winner) setWinner(data.winner);
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

  if (!myroom || !myname) return <div>{"wait for server"}</div>;
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
              winner={winner}
              isLeader={isLeader}
              status={status}
            />
            <Myboard ref={myboardRef} />
          </div>
          {socket && (
            <div id="under-wrapper">
              <div>{myname}</div>
              <StartButton
                socket={socket}
                visible={isLeader && status !== "playing"}
              />
              <SpeedControl
                socket={socket}
                visible={isLeader && status === "playing"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tetris;
