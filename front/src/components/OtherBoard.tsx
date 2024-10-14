import React from "react";
import { getTypeString } from "./functions";

interface OtherBoardProps {
  playername: string;
  board: number[][];
}
const OtherBoard: React.FC<OtherBoardProps> = ({ playername, board }) => {
  if (!board) return null;

  return (
    <div className="otherboard" id={playername}>
      {board.flat().map((cell, index) => (
        <li key={index} className={getTypeString(cell)} />
      ))}
    </div>
  );
};
export { OtherBoard };

// const OtherBoard = forwardRef(({ playername }: OtherBoardProps, ref) => {
//   const [board, setBoard] = useState<number[][]>(
//     Array.from({ length: 20 }, () => Array(10).fill(0)),
//   );
//   const container = document.getElementsByClassName("otherboard-container");
//   useEffect(() => {
//     const container = document.createElement("div");
//     container.classList.add("otherboard-container");
//     const board = document.createElement("div");
//     board.id = playername;
//     board.classList.add("otherboard");
//     const playerName = document.createElement("p");
//     playerName.textContent = playername;

//     container.appendChild(container);
//     container.appendChild(board);
//     container.appendChild(playerName);
//   }, [container]);

//   const updateBoard = (newBoard: number[][], playername: string) => {
//     console.log("playername", playername);
//     console.log("newBoard", newBoard);
//   };

//   useImperativeHandle(ref, () => ({
//     updateBoard,
//   }));

//   return (
//     <div className="otherboard" id={playername}>
//       {board.flat().map((cell, index) => (
//         <li key={index} className={getTypeString(cell)} />
//       ))}
//     </div>
//   );
// });

// OtherBoard.displayName = "OtherBoard";
