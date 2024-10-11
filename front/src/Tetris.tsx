import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { io } from "socket.io-client";
import "./style.css";

function Tetris() {
  const { room, player } = useParams();
  useEffect(() => {
    fetch(`http://localhost:8000/${room}/${player}`).then((res) => {
      if (res.status === 200) {
        const socket = io("http://localhost:8000", {
          query: { room: room, player: player },
          reconnection: false,
        });

        socket.on("connect", () => {
          console.log("Connected to server");
        });
        socket.on("connect_error", (error) => {
          if (socket.active) {
            console.log("reconnection");
          } else {
            console.log("error from socket io", error.message);
          }
        });
        socket.on("disconnect", () => {
          console.log("disconection socket");
        });
      } else if (res.status === 400) {
        console.log("bad");
      }
    });
  }, [room, player]);

  return (
    <div className="container">
      <h1>Red-Tetris</h1>
      <div id="containerWrapper"></div>
      <div id="myboard-container">
        <div id="myboard-wrapper">
          <div id="info">
            <text id="room-info"></text>
            <div id="player-info"></div>
          </div>
          <div id="myboard"></div>
        </div>
        <div id="under-wrapper"></div>
      </div>
    </div>
  );
}

export default Tetris;
