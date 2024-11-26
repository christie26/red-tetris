import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Socket } from "socket.io-client";
import StartButton from "../components/StartButton";

const mockEmit = jest.fn();
jest.mock("socket.io-client", () => {
  return {
    Socket: jest.fn(() => ({
      emit: mockEmit,
    })),
  };
});

describe("StartButton Component", () => {
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockSocket = { emit: mockEmit };
    mockEmit.mockClear();
  });

  test("renders the Start button when it's Leader", () => {
    render(
      <StartButton socket={mockSocket as Socket} visible={true} speed={1} />,
    );
    const button = screen.getByRole("button", { name: /start/i });
    expect(button).toBeInTheDocument();
  });

  test("does not render the Start button when it's not Leader", () => {
    render(
      <StartButton socket={mockSocket as Socket} visible={false} speed={1} />,
    );
    const button = screen.queryByRole("button", { name: /start/i });
    // queryByRole -> locate elements based on their roles
    expect(button).not.toBeInTheDocument();
  });

  test("emits leaderClick event with speed when button is clicked", () => {
    const speed = 2;
    render(
      <StartButton
        socket={mockSocket as Socket}
        visible={true}
        speed={speed}
      />,
    );
    const button = screen.getByRole("button", { name: /start/i });
    // getByRole -> locate elements based on their roles
    fireEvent.click(button);

    expect(mockEmit).toHaveBeenCalledWith("leaderClick", { speed });
  });
});
