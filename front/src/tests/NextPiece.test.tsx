import React from "react";
import { render, screen } from "@testing-library/react";
import NextPiece from "../components/NextPiece";
import { getTypeString } from "../components/functions";

jest.mock("../components/functions");

describe("NextPiece", () => {
  beforeEach(() => {
    (getTypeString as jest.Mock).mockImplementation((cell) => {
      switch (cell) {
        case 1:
          return "I_BLOCK";
        case 2:
          return "T_BLOCK";
        case 3:
          return "L_BLOCK";
        case 4:
          return "J_BLOCK";
        case 5:
          return "S_BLOCK";
        case 6:
          return "Z_BLOCK";
        case 7:
          return "O_BLOCK";
        default:
          return "";
      }
    });
  });

  it("renders empty grid when there is no nextPiece", () => {
    render(<NextPiece nextPiece={null} />);

    expect(screen.getByText(/Next Piece/i)).toBeInTheDocument();
    const cells = screen.getAllByRole("listitem");
    expect(cells).toHaveLength(16);
    cells.forEach((cell) => {
      expect(cell).not.toHaveClass();
    });
  });

  it("renders the next piece grid correctly when nextPiece is provided", () => {
    const nextPiece = {
      tiles: [
        { x: 0, y: 0, type: 1 },
        { x: 1, y: 0, type: 1 },
        { x: 0, y: 1, type: 1 },
        { x: 1, y: 1, type: 1 },
      ],
      type: 1,
    };

    render(<NextPiece nextPiece={nextPiece} />);

    expect(screen.getByText(/Next Piece/i)).toBeInTheDocument();
    const cells = screen.getAllByRole("listitem");
    expect(cells).toHaveLength(16);

    expect(cells[5]).toHaveClass("I_BLOCK");
    expect(cells[6]).toHaveClass("I_BLOCK");
    expect(cells[9]).toHaveClass("I_BLOCK");
    expect(cells[10]).toHaveClass("I_BLOCK");
  });

  it("renders a T_BLOCK correctly", () => {
    const nextPiece = {
      tiles: [
        { x: 0, y: 0, type: 2 },
        { x: 1, y: 0, type: 2 },
        { x: 2, y: 0, type: 2 },
        { x: 1, y: 1, type: 2 },
      ],
      type: 2,
    };

    render(<NextPiece nextPiece={nextPiece} />);

    const cells = screen.getAllByRole("listitem");
    expect(cells).toHaveLength(16);

    expect(cells[4]).toHaveClass("T_BLOCK");
    expect(cells[5]).toHaveClass("T_BLOCK");
    expect(cells[6]).toHaveClass("T_BLOCK");
    expect(cells[9]).toHaveClass("T_BLOCK");
  });

  it("calculates the correct average position for tiles", () => {
    const nextPiece = {
      tiles: [
        { x: 0, y: 0, type: 1 },
        { x: 1, y: 0, type: 1 },
        { x: 0, y: 1, type: 1 },
        { x: 1, y: 1, type: 1 },
      ],
      type: 1,
    };

    render(<NextPiece nextPiece={nextPiece} />);

    const cells = screen.getAllByRole("listitem");

    expect(cells[5]).toHaveClass("I_BLOCK");
    expect(cells[6]).toHaveClass("I_BLOCK");
    expect(cells[9]).toHaveClass("I_BLOCK");
    expect(cells[10]).toHaveClass("I_BLOCK");
  });
});
