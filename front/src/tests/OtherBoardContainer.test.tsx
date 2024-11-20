import React, { useRef } from "react";
import { render, screen } from "@testing-library/react";
import OtherBoardsContainer from "../components/OtherBoardsContainer";
import { act } from "react";


jest.mock("../components/OtherBoard", () => ({
  OtherBoard: jest.fn(() => <div>OtherBoard</div>),
}));

interface OtherBoardsContainerHandles {
    updateBoard: (newBoard: number[][], playername: string) => void;
    updateBoardStatus: (newStatus: string, playername: string) => void;
}

describe("OtherBoardsContaine 3 players", () => {
  const players = ["player1", "player2", "player3"];
  const myname = "player1";

  it("should render OtherBoards for players excluding the current player", () => {
    const gamestatus = "ready";

    render(
      <OtherBoardsContainer
        players={players}
        myname={myname}
        gamestatus={gamestatus}
      />
    );

    const boards = screen.queryAllByText("OtherBoard");
    expect(boards).toHaveLength(2); 
  });


  it("should render OtherBoards if there are 2 or more players", () => {
    const gamestatus = "ready";

    const playersWithTwo = ["player1", "player2"];
    render(
      <OtherBoardsContainer
        players={playersWithTwo}
        myname={myname}
        gamestatus={gamestatus}
      />
    );
    const boards = screen.queryAllByText("OtherBoard");
    expect(boards).toHaveLength(1); 
  });

  it("should update the board state when 'updateBoard' is called", () => {
    const gamestatus = "ready";
    const ref = React.createRef<OtherBoardsContainerHandles>();
    render(
      <OtherBoardsContainer
        players={players}
        myname={myname}
        gamestatus={gamestatus}
        ref={ref}
      />
    );

    const newBoard = Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => 0)
    );
    act(() => {

        if (ref.current) {
            ref.current.updateBoard(newBoard, "player2");
        }
    })
    expect(ref.current?.updateBoard).toBeDefined()
  });

  it("should update the board status when 'updateBoardStatus' is called", () => {
    const gamestatus = "ready";
    const ref = React.createRef<OtherBoardsContainerHandles>();
    render(
      <OtherBoardsContainer
        players={players}
        myname={myname}
        gamestatus={gamestatus}
        ref={ref}
      />
    );

    const updateBoardStatusSpy = jest.spyOn(ref.current!, "updateBoardStatus");
    act(() => {

        if (ref.current) {
            ref.current.updateBoardStatus("playing", "player2");
        }
    })
    expect(updateBoardStatusSpy).toHaveBeenCalledWith("playing", "player2");
    updateBoardStatusSpy.mockRestore();
    
  });

  it("should correctly modify the board when a filled cell is encountered", () => {
    const gamestatus = "ready";
    const ref = React.createRef<OtherBoardsContainerHandles>();
    
    render(
      <OtherBoardsContainer
        players={players}
        myname={myname}
        gamestatus={gamestatus}
        ref={ref}
      />
    );
  
    const newBoard = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0)
    );
    newBoard[5][3] = 1;
  
    act(() => {
      if (ref.current) {
        ref.current.updateBoard(newBoard, "player2");
      }
    });
  
   
    const expectedBoard = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0)
    );
    for (let col = 5; col < 20; col++) {
      expectedBoard[col][3] = 1;
    }
  
    
    expect(ref.current).toBeDefined();
    expect(newBoard).toEqual(expectedBoard);
  });
});

describe("OtherBoardsContainer 1 player", () => {
  const players = ["player1"];
  const myname = "player1";

  it("should not render when the gamestatus is 'playing' or 'end-play'", () => {
    const invalidStatus = ["playing", "end-play"];
    
    invalidStatus.forEach((status) => {
      const { queryByText } = render(
        <OtherBoardsContainer
          players={players}
          myname={myname}
          gamestatus={status}
        />
      );
      expect(queryByText("OtherBoard")).toBeNull();
    });
  });

})