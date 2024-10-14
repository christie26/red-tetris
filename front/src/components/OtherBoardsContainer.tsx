import React, { forwardRef, useImperativeHandle } from "react";
import { OtherBoard } from "./OtherBoard";

interface OtherBoardsContainerProps {
  players: string[];
  myname: string;
}
const OtherBoardsContainer = forwardRef(
  ({ players, myname }: OtherBoardsContainerProps, ref) => {
    const updateBoard = (newBoard: number[][], playername: string) => {
      console.log("playername", playername);
      console.log("newBoard", newBoard);
    };

    useImperativeHandle(ref, () => ({
      updateBoard,
    }));

    return (
      <div className="otherboard-container">
        {players
          .filter((player) => player !== myname)
          .map((player) => (
            <OtherBoard key={player} playername={player} />
          ))}
      </div>
    );
  },
);

OtherBoardsContainer.displayName = "OtherBoardsContainer";

export default OtherBoardsContainer;
