import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { io } from "socket.io-client";
import { Myboard } from "./components/Myboard";
import { updatePlayers } from "./components/PlayerInfo";

function Tetris() {
  const { room, player } = useParams();
  const [isUnique, setIsUnique] = useState<boolean>(false);

  useEffect(() => {
    fetch(`http://localhost:8000/${room}/${player}`).then((res) => {
      if (res.status === 200) {
        setIsUnique(true);
        const socket = io("http://localhost:8000", {
          query: { room: room, player: player },
          reconnection: false,
        });
        socket.on("connect", () => {
          console.log("Connected to server");
        });
        socket.on("join", (data) => {
            console.log(data)
          if (data.roomname !== room) return;
          if (data.player === player) {
            if (data.type === "leader") {
                console.log(`You joinned ${room} as ${player} as a leader.`);
                console.log(typeof(data.playerList))
                if (Array.isArray(data.playerList)){
                    updatePlayers(data.playerList);
                }
              // toastr.success("You're the leader of this room");
              // createButton()
            } else if (data.type === "normal") {
              console.log(`You joinned ${room} as ${player} as a player.`);
              updatePlayers(data.playerList);
              // toastr.success("You join the room, we are waiting the leader to begin the game")
            } else if (data.type === "wait") {
              console.log(`You joinned ${room} as ${player} as a waiter.`);
              // player_info.innerHTML = ''
              // const text1 = document.createElement('text');
              // text1.textContent = 'A game is already playing...'
              // player_info.appendChild(text1)
              // const text2 = document.createElement('text');
              // text2.textContent = 'You should wait until it ends'
              // player_info.appendChild(text2)
            }
          } else {
            if (data.type !== "wait") updatePlayers(data.playerList);
          }
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
        setIsUnique(false);
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
          {room && player && (
            <Myboard roomname={room} playername={player} isUnique={isUnique} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Tetris;
