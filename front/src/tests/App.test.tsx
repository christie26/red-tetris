import { render, screen, waitFor} from "@testing-library/react";
import { MemoryRouter } from 'react-router-dom'; 
import App from "../App";
import React from "react";

test("renders Tetris components with a valid link", async () => {
  render(
    <MemoryRouter initialEntries={['/room/1/playerA']}> {/* Simulating URL */}
      <App />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByText(/Tetris/i)).toBeInTheDocument());
});

