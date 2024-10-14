import React, { forwardRef, useImperativeHandle, useState } from "react";
import { OtherBoard } from "./OtherBoard";

// [problem]
// I have to create and change other players' board dynamically.
// and with react system I can't find clear way.
// 1. dynamically make state from OtherBoardsContainer and pass it to each OtherBoard.

interface OtherBoardsContainerProps {
  players: string[];
  myname: string;
}
const OtherBoardsContainer = forwardRef(
  ({ players, myname }: OtherBoardsContainerProps, ref) => {
    const [boards, setBoards] = useState<{ [key: string]: number[][] }>({});

    const updateBoard = (newBoard: number[][], playername: string) => {
      // TODO: add logic to make it silhouette
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
