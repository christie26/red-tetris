import React, { useState, useImperativeHandle, forwardRef } from "react";
import { getTypeString } from "./functions";

const Myboard = forwardRef((_, ref) => {
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
    <ul id="myboard">
      {board.flat().map((cell, index) => (
        <li key={index} className={getTypeString(cell)} />
      ))}
    </ul>
  );
});

Myboard.displayName = "Myboard";

export { Myboard };
