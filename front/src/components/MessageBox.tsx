import React from "react";

interface MessageBoxProps {
  roomname: string;
  winner: string | null;
  status: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  roomname,
  winner,
  status,
}) => {
  let message = null;
  if (winner) {
    if (status === "playing") {
      message = "Thanks for playing!";
    } else if (status === "waiting") {
      message = "Thanks for waiting!";
    }
    message += " Please wait until the leader starts the game again.";
  } else if (status === "waiting") {
    message = "They are playing. You should wait until it ends.";
  } else if (status === "solo-play") {
    message = "Well played! Ask your friend to join!";
  } else if (status === "solo-wait") {
    message =
      "The game has ended. Please wait until the leader starts the game again.";
  } else if (status === "waitServer") {
    message = "waiting for server ...";
  }

  if (message)
    return (
      <div className="info-wrapper">
        <div className="info">
          <div>Room: {roomname}</div>
          {winner && <div>Winner : {winner}</div>}
          <div>{message}</div>
        </div>
      </div>
    );
  // if (winner)
  //   return (
  //     <div className="info-wrapper">
  //       <div className="info">
  //         <div>Room: {roomname}</div>
  //         <div>Winner : {winner}</div>
  //         <div>{message2} Please wait until leader starts a game again.</div>
  //       </div>
  //     </div>
  //   );
  // else if (status === "waiting")
  //   return (
  //     <div className="info-wrapper">
  //       <div className="info">
  //         <div>Room: {roomname}</div>
  //         <div>They are playing. You should wait until it ends.</div>
  //       </div>
  //     </div>
  //   );
  // else if (status === "solo")
  //   return (
  //     <div className="info-wrapper">
  //       <div className="info">
  //         <div>Room: {roomname}</div>
  //         <div>Bien joue! Ask you friend to join!</div>
  //       </div>
  //     </div>
  //   );
  else return null;
};

export default MessageBox;
