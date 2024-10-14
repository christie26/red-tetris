import React, { useState, useImperativeHandle, forwardRef } from "react";
import { getTypeString } from "./functions";

interface OtherBoardProps {
  playername: string;
}

const OtherBoard = forwardRef(({ playername }: OtherBoardProps, ref) => {
  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: 20 }, () => Array(10).fill(0)),
  );

  const updateBoard = (newBoard: number[][], playername: string) => {
    console.log("playername", playername);
    console.log("newBoard", newBoard);
  };

  useImperativeHandle(ref, () => ({
    updateBoard,
  }));

  return (
    <div className="otherboard" id={playername}>
      {board.flat().map((cell, index) => (
        <li key={index} className={getTypeString(cell)} />
      ))}
    </div>
  );
});

OtherBoard.displayName = "OtherBoard";

export { OtherBoard };
