import React, {useState, useEffect} from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { io, Socket } from 'socket.io-client';

function Tetris() {
  const { room, player } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);

  fetch(`http://localhost:8000/${room}/${player}`)
  .then((res) => {
    if (res.status === 200) {
      console.log('good');
    } else if (res.status === 400) {
      console.log('bad');
    }
  });

  useEffect(() => {
    console.log('I will make new socket yeah~')
    const newSocket = io('http://localhost:8000', { query: { room: 'someRoom', player: 'somePlayer' } });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    // Cleanup function to disconnect the socket
    return () => {
      newSocket.disconnect();
      console.log('Disconnected from server');
    };
  }, []);



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

