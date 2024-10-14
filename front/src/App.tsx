import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Tetris from "./Tetris";
import ErrorPage from "./ErrorPage";

function App() {
  return (
    <Routes>
      <Route path="/:room/:player" element={<Tetris />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
