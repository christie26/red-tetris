import React from "react";

interface ResultBoxProps {
  roomname: string;
  winner: string | null;
}

const ResultBox: React.FC<ResultBoxProps> = ({ roomname, winner }) => {
  if (winner)
    return (
      <div className="info-wrapper">
        <div className="info">
          <div>Room: {roomname}</div>
          <div>Winner : {winner}</div>
          <div>
            Thanks for playing! Please wait until leader starts a game again.
          </div>
        </div>
      </div>
    );
  else return null;
};

export default ResultBox;
