import React, { useState, useImperativeHandle, forwardRef } from "react";
import { getTypeString } from "./functions";
import "../styles/tile.css";
import "../styles/MyBoard.css";

export interface MyboardRef {
  updateBoard: (newBoard: number[][]) => void;
}

const Myboard = forwardRef<MyboardRef>((_, ref) => {
  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: 20 }, () => Array(10).fill(0)),
  );

  const updateBoard = (newBoard: number[][]) => {
    setBoard(newBoard);
  };

  useImperativeHandle(ref, () => ({
    updateBoard,
  }));

  return (
    <div className="myboard ">
      {board.flat().map((cell, index) => (
        <li key={index} className={getTypeString(cell)} />
      ))}
    </div>
  );
});

Myboard.displayName = "Myboard";

export { Myboard };
