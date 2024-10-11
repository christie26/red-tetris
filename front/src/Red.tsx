import React, { useEffect } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "toastr/build/toastr.min.css";

const RedTetris = () => {
  useEffect(() => {
    // Configure toastr options

    // Connect to socket.io
    const socket = io("/socket.io");

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

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
};

export default RedTetris;
