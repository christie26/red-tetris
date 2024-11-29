import React from "react";

interface ResultBoxProps {
  winner: string | null;
  myname: string;
  isLeader: boolean;
  status: string;
}

const ResultBox: React.FC<ResultBoxProps> = ({
  winner,
  myname,
  isLeader,
  status,
}) => {
  let message = "";

  if (status === "waiting") {
    message = "They are playing. You should wait until it ends.";
  } else if (status === "ready") {
    if (isLeader) {
      message += "You can click button to start a game.   ";
    } else {
      message += " Please wait until the leader starts a game.   ";
    }
  } else if (status === "end-play") {
    if (winner === myname) message = "🎉🎊 Congrat! You did it! 🏆🎉          ";
    else message = "😅 Oops! Better luck next time! 🍀 ";
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts a game.";
    }
  } else if (status === "end-wait") {
    message = "Thanks for waiting! ";
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts a game.";
    }
  } else if (status === "waitServer") {
    message =
      "waiting for server ... refresh the page in a few second. If it doesn't work for long, ask Yoonseo.";
  } else if (status === "error-invalidName") {
    message =
      "There is already a player with same name. Choose different name and try again.";
  } else if (status === "error-notready") {
    message = "Your server is not ready, try again in few seconds.";
  }
  if (status !== "ready" && status !== "error" && message.length === 0)
    return null;
  return (
    <div className="info-wrapper">
      <div className="info-box">
        <div className="info">
          {winner && status !== "error" && <div>Winner : {winner}</div>}
          <div>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default ResultBox;
