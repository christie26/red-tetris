import React, { forwardRef, useImperativeHandle, useState } from "react";
import { OtherBoard } from "./OtherBoard";

interface OtherBoardsContainerProps {
  players: string[];
  myname: string;
}
const OtherBoardsContainer = forwardRef(
  ({ players, myname }: OtherBoardsContainerProps, ref) => {
    const [boards, setBoards] = useState<{ [key: string]: number[][] }>({});

    const updateBoard = (newBoard: number[][], playername: string) => {
      for (let col = 0; col < 20; col++) {
        for (let row = 0; row < 10; row++) {
          if (newBoard[col][row]) {
            for (let target_col = col; target_col < 20; target_col++) {
              newBoard[target_col][row] = 1;
            }
          }
        }
      }
      setBoards((prevBoards) => ({
        ...prevBoards,
        [playername]: newBoard,
      }));
    };

    useImperativeHandle(ref, () => ({
      updateBoard,
    }));

    return (
      <div className="otherboard-container">
        {players
          .filter((player) => player !== myname)
          .map((player) => (
            <OtherBoard
              key={player}
              playername={player}
              board={boards[player]}
            />
          ))}
      </div>
    );
  },
);

OtherBoardsContainer.displayName = "OtherBoardsContainer";

export default OtherBoardsContainer;
