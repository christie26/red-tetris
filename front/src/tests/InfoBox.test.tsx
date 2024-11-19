import InfoBox from "../components/InfoBox";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

describe("InfoBox", () => {
  const mockSetSpeed = jest.fn();

  const defaultProps = {
    roomname: "Test Room",
    players: ["Player1", "Player2"],
    speed: 1,
    setSpeed: mockSetSpeed,
    isLeader: true,
    status: "waiting",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the room name correctly", () => {
    render(<InfoBox {...defaultProps} />);
    expect(screen.getByText(/Room: Test Room/i)).toBeInTheDocument();
  });

  it("renders the list of players correctly", () => {
    render(<InfoBox {...defaultProps} />);
    expect(screen.getByText(/Players:/i)).toBeInTheDocument();
    expect(screen.getByText("Player1")).toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
  });

  it("does not render players section if the players array is empty", () => {
    render(<InfoBox {...defaultProps} players={[]} />);
    expect(screen.queryByText(/Players:/i)).toBeNull();
  });

  it("renders the speed control slider when the user is the leader and status is not 'playing'", () => {
    render(<InfoBox {...defaultProps} />);
    expect(screen.getByLabelText(/Speed: 1x/i)).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("does not render the speed control slider when the user is not the leader", () => {
    render(<InfoBox {...defaultProps} isLeader={false} />);
    expect(screen.queryByLabelText(/Speed:/i)).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("does not render the speed control slider when the status is 'playing'", () => {
    render(<InfoBox {...defaultProps} status="playing" />);
    expect(screen.queryByLabelText(/Speed:/i)).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("calls setSpeed when the speed slider value changes", () => {
    render(<InfoBox {...defaultProps} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "1.5" } });
    expect(mockSetSpeed).toHaveBeenCalledWith(1.5);
  });

  it("handles minimum and maximum values of the speed slider", () => {
    render(<InfoBox {...defaultProps} />);
    const slider = screen.getByRole("slider");

    fireEvent.change(slider, { target: { value: "0.5" } });
    expect(mockSetSpeed).toHaveBeenCalledWith(0.5);

    fireEvent.change(slider, { target: { value: "2" } });
    expect(mockSetSpeed).toHaveBeenCalledWith(2);
  });
});
