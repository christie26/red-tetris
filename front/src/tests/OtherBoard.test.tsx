import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OtherBoard } from '../components/OtherBoard';

describe('OtherBoard Component', () => {
  const mockProps = {
    playername: 'Player1',
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    ],
    status: 'active',
  };

  describe('Rendering Tests', () => {
    test('renders the player name', () => {
      render(<OtherBoard {...mockProps} />);
      expect(screen.getByText('Player1')).toBeInTheDocument();
    });

    test('returns null if board is not provided', () => {
      const { container } = render(
        <OtherBoard playername="Player1" board={null} status="active" />
      );
      expect(container.firstChild).toBeNull(); // No content should be rendered
    });

    test('returns null if board is undefined', () => {
    const { container } = render(
      <OtherBoard playername="Player1" board={undefined} status="active" />
    );
    expect(container.firstChild).toBeNull(); // No content should be rendered
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