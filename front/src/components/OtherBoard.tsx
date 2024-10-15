import React from "react";

interface OtherBoardProps {
  playername: string;
  board: number[][];
}
const OtherBoard: React.FC<OtherBoardProps> = ({ playername, board }) => {
  if (!board) return null;

  return (
    <div className="otherboard" id={playername}>
      {board.flat().map((cell, index) => (
        <li key={index} className={cell ? "filled" : undefined} />
      ))}
    </div>
  );
};
export { OtherBoard };
