import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OtherBoard } from '../components/OtherBoard';

describe('OtherBoard Component', () => {
  const mockProps = {
    playername: 'Player1',
    board: [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1],
    ],
    status: 'active',
  };

  describe('Rendering Tests', () => {
    test('renders the player name', () => {
      render(<OtherBoard {...mockProps} />);
      expect(screen.getByText('Player1')).toBeInTheDocument();
    });
  });

  describe('Class Application Tests', () => {
    test('applies the correct status class to the board wrapper', () => {
      render(<OtherBoard {...mockProps} />);
      const boardWrapper = screen.getByText('Player1').previousElementSibling;
      expect(boardWrapper).toHaveClass('otherboard active');
    });
  });

  describe('Cell Rendering Tests', () => {
    test('renders the correct number of cells based on the board array', () => {
      render(<OtherBoard {...mockProps} />);
      const cells = screen.getAllByRole('listitem');
      expect(cells).toHaveLength(mockProps.board.flat().length);

      mockProps.board.flat().forEach((cell, index) => {
        if (cell) {
          expect(cells[index]).toHaveClass('filled');
        } else {
          expect(cells[index]).not.toHaveClass('filled');
        }
      });
    });
  });
});