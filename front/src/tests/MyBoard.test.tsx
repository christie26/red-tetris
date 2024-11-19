import React from "react";
import { render, screen, act } from "@testing-library/react";
import { Myboard, MyboardRef } from "../components/MyBoard";
import { getTypeString } from "../components/functions";

jest.mock("../components/functions");

describe("Myboard", () => {
  it("renders a 20x10 board with no pieces correctly", () => {
    (getTypeString as jest.Mock).mockImplementation(() => "empty");

    render(<Myboard />);

    const cells = screen.getAllByRole("listitem");
    expect(cells).toHaveLength(200);
    cells.forEach((cell) => {
      expect(cell).toHaveClass("empty");
    });
  });

  it("renders correctly when a block is placed on the board", () => {
    (getTypeString as jest.Mock).mockImplementation((cell) => {
      if (cell === 1) return "I_BLOCK";
      if (cell === 2) return "T_BLOCK";
      return "empty";
    });

    const initialBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
    initialBoard[0][0] = 1;
    initialBoard[1][1] = 2;

    const ref = React.createRef<MyboardRef>(); 
    render(<Myboard ref={ref} />);

    act(() => {
      if (ref.current) {
        ref.current.updateBoard(initialBoard); 
      }
    });

    const cells = screen.getAllByRole("listitem");
    expect(cells[0]).toHaveClass("I_BLOCK");
    expect(cells[11]).toHaveClass("T_BLOCK");
    expect(cells).toHaveLength(200);
  });

  it("updates the board when updateBoard is called", () => {
    (getTypeString as jest.Mock).mockImplementation((cell) => {
      if (cell === 1) return "I_BLOCK";
      return "empty";
    });

    const initialBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
    initialBoard[0][0] = 1;

    const ref = React.createRef<MyboardRef>();
    render(<Myboard ref={ref} />);

    act(() => {
      if (ref.current) {
        ref.current.updateBoard(initialBoard);
      }
    });

    let cells = screen.getAllByRole("listitem");
    expect(cells[0]).toHaveClass("I_BLOCK");

    const newBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
    newBoard[1][1] = 1;

    act(() => {
      if (ref.current) {
        ref.current.updateBoard(newBoard);
      }
    });

    cells = screen.getAllByRole("listitem");
    expect(cells[11]).toHaveClass("I_BLOCK");
    expect(cells[0]).not.toHaveClass("I_BLOCK");
  });
});
