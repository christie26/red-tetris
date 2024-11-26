import { render, screen } from "@testing-library/react";
import ErrorPage from "../ErrorPage";
import React from "react";

describe("ErrorPage Component", () => {
  test("renders ErrorPage with correct text and styles", () => {
    render(<ErrorPage />);

    const titleElement = screen.getByText(/Red-Tetris/i);
    expect(titleElement).toBeInTheDocument();

    const paragraphElement = screen.getByText(
      /Acess to \/roomname\/playername/i,
    );
    expect(paragraphElement).toBeInTheDocument();

    const paragraph = screen.getByText(/Acess to \/roomname\/playername/i);
    expect(paragraph).toHaveStyle("font-size: 50px");
    expect(paragraph).toHaveStyle("color: gray");
  });
});
