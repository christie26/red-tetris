import React from "react";

interface InfoBoxProps {
  roomname: string;
  players: string[];
  winner: string | null;
  isLeader: boolean;
  status: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  roomname,
  players,
  winner,
  isLeader,
  status,
}) => {
  let message = "";

  if (status == "waiting") {
    message = "They are playing. You should wait until it ends.";
  } else if (status == "ready") {
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts the game again.";
    }
  } else if (status == "end-play") {
    message = "Thanks for playing! ";
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts the game again.";
    }
  } else if (status == "end-wait") {
    message = "Thanks for waiting! ";
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts the game again.";
    }
  } else if (status === "waitServer") {
    message = "waiting for server ... refresh the page in a second";
  }
  if (status !== "ready" && message.length == 0) return null;
  return (
    <div className="info-wrapper">
      <div className="info-box">
        {status === "ready" && (
          <div className="info">
            <div>Room: {roomname}</div>
            <div>
              <div>Players:</div>
              {players.map((player, index) => (
                <div key={index}>{player}</div>
              ))}
            </div>
          </div>
        )}
        <div className="info">
          {winner && <div>Winner : {winner}</div>}
          <div>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
