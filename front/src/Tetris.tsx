import React, {useState, useEffect} from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { io, Socket } from 'socket.io-client';

function Tetris() {
  const { room, player } = useParams();
  useEffect(() => {
        fetch(`http://localhost:8000/${room}/${player}`)
      .then((res) => {
        if (res.status === 200) {
          const socket = io('http://localhost:8000', { query: { room: room, player: player }, reconnection: false });

          socket.on('connect', () => {
            console.log('Connected to server');
          });

          socket.on("connect_error", (error) => {
            if (socket.active) {
              console.log("reconnection")
              // temporary failure, the socket will automatically try to reconnect
            } else {
              // the connection was denied by the server
              // in that case, `socket.connect()` must be manually called in order to reconnect
              console.log("error from socket io", error.message);
            }
          });
          socket.on("disconnect", (reason, details) => {
            console.log("disconection socket");
            
          });

        } else if (res.status === 400) {
          console.log('bad');
        }
      });
    
  }, [room, player]);


  return     (
    <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Good page
      </a>
    </header>
  </div>
  )
}

export default Tetris

