import React, {useState, useEffect} from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Tetris from './Tetris';

function ErrorPage() {
  useEffect(() => {
    fetch(`http://localhost:8000/error`)
      .then((res) => res.json())
      .then((data) => {});
    console.log('message from server')
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
        bad page
      </a>
    </header>
  </div>
  )
}
function App() {
  return (
    <Routes>
        <Route path="/:room/:player" element={<Tetris />} />
        <Route path="*" element={<ErrorPage />} />
    </Routes>

  );
}

export default App;
