import React from "react";

interface OtherBoardProps {
  playername: string;
  board: number[][];
  status: string;
}
const OtherBoard: React.FC<OtherBoardProps> = ({
  playername,
  board,
  status,
}) => {
  if (!board) return null;

  return (
    <div>
      <div className={"otherboard " + status} id={playername}>
        {board.flat().map((cell, index) => (
          <li key={index} className={cell ? "filled" : undefined} />
        ))}
      </div>
      {playername}
    </div>
  );
};
export { OtherBoard };
