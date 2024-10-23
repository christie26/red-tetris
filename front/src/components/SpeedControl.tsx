import React, { useState } from "react";
import { Socket } from "socket.io-client";
import "../styles/Buttons.css"

interface SpeedControlProps {
  socket: Socket | null;
  visible: boolean;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ socket, visible }) => {
  const [speed, setSpeed] = useState<number>(1);

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number(event.target.value);
    setSpeed(newSpeed);

    if (socket) {
      socket.emit("changespeed", { speed: newSpeed });
      console.log(`Speed changed to ${newSpeed}`);
    }
  };

  if (!visible) return null;
  return (
    <div className="speedControl">
      <label htmlFor="speedControl">Speed: {speed}x</label>
      <input
        id="speedControl"
        type="range"
        min="0.5"
        max="2"
        step="0.25"
        value={speed}
        onChange={handleSpeedChange}
      />
    </div>
  );
};

export default SpeedControl;
