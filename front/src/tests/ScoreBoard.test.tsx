import React from "react";
import { render, screen } from "@testing-library/react";
import ScoreBoard from "../components/ScoreBoard";

describe("ScoreBoard Component", () => {
  test("renders the Score Board heading", () => {
    render(<ScoreBoard scores={new Map()} />);
    const heading = screen.getByText(/score board/i);
    expect(heading).toBeInTheDocument();
  });

  test("displays 'no data' when scores map is empty", () => {
    render(<ScoreBoard scores={new Map()} />);
    const noDataMessage = screen.getByText(/no data/i);
    expect(noDataMessage).toBeInTheDocument();
  });

  test("renders a table with player scores when scores are provided", () => {
    const scores = new Map([
      ["Player1", 10],
      ["Player2", 5],
    ]);

    render(<ScoreBoard scores={scores} />);

    expect(screen.getByRole("columnheader", { name: /player/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /score/i })).toBeInTheDocument();

    expect(screen.getByRole("cell", { name: "Player1" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "10" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Player2" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "5" })).toBeInTheDocument();

  });

  test("applies correct row classes for even and odd rows", () => {
    const scores = new Map([
      ["Player1", 10],
      ["Player2", 20],
    ]);

    render(<ScoreBoard scores={scores} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveClass("even");
    expect(rows[2]).toHaveClass("odd");
  });
});
