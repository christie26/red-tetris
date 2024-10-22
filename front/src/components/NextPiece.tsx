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
  if (!nextPiece) {
    return <div>No next piece</div>;
  }

  return (
    <div>
      <h3>Next Piece</h3>
      <div id="nextboard">
        {nextPiece.tiles.map((tile, index) => (
          <li key={index} className={getTypeString(tile.type)} />
        ))}
      </div>
    </div>
  );
};


export default NextPiece;
