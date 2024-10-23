import React from 'react';
import { getTypeString } from "./functions";
import "../styles/NextPiece.css"

interface Tile {
  x: number;
  y: number;
  type: number;
}

interface NextPieceProps {
  nextPiece: {
    tiles: Tile[];
    type: number;
  } | null;
}

const NextPiece: React.FC<NextPieceProps> = ({ nextPiece }) => {
  const empty = Array.from({ length: 4 }, () => Array(4).fill(0));

  if (!nextPiece || !nextPiece.tiles) {
    return (
      <div className="nextpiece-container">
        <h3>Next Piece</h3>
        <div className="nextpiece">
          {empty.flat().map((cell, index) => (
            <li key={index} className={getTypeString(cell)} />
          ))}
        </div>
      </div>
    );
  }

  let totalX = 0;
  let totalY = 0;
  
  for (const { x, y } of nextPiece.tiles) {
    totalX += x;
    totalY += y;
  }
  
  const avgX = totalX / 4;
  const avgY = totalY / 4;
  
  for (const { x, y, type } of nextPiece.tiles) {
    empty[Math.ceil(y - avgY + 1)][Math.ceil(x - avgX + 1)] = type;
  }

  return (
    <div className="nextpiece-container">
      <h3>Next Piece</h3>
      <div className="nextpiece">
        {empty.flat().map((cell, index) => (
          <li key={index} className={getTypeString(cell)} />
        ))}
      </div>
    </div>
  );
};


export default NextPiece;
