import React, { useEffect } from "react";
import "./App.css";

function ErrorPage() {
  useEffect(() => {
    fetch(`http://localhost:8000/error`).then((res) => res.json());
    console.log("message from server");
  }, []);

  return (
    <div>
      <h1>Red-Tetris</h1>
      <div className="container">Acess to /roomname/playername</div>
    </div>
  );
}

export default ErrorPage;
