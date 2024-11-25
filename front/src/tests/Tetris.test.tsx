import Tetris from "../Tetris";
import App from "../App";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  within,
} from "@testing-library/react";
import React, { Dispatch } from "react";
import { io, Socket } from "socket.io-client";
import { useState } from "react";

const originalReact = jest.requireActual("react");

jest.mock("socket.io-client", () => {
  const mockIo = jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  }));
  return {
    io: mockIo,
  };
});

jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useState: jest.fn(),
  };
});

describe("Tetris Component Error Connection", () => {
  const setStatus = jest.fn();
  const useStatusMock: any = (initState: any) => [initState, setStatus];

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 400,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;
  });

  test("calls setStatus with 'error' when server returns 400", async () => {
    jest.spyOn(React, "useState").mockImplementation(useStatusMock);

    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/room/player",
      );
    });

    expect(setStatus).toHaveBeenCalledWith("error");

    jest.restoreAllMocks();
  });
});

describe("Tetris Component Good Connection", () => {
  let mockSocket: Socket;

  beforeEach(() => {
    const useStateMock = jest.requireMock("react").useState;
    const setStatusMock = jest.fn();
    useStateMock.mockImplementation((initialValue: string) => {
      if (initialValue === "ready") {
        return ["ready", setStatusMock];
      }
      return originalReact.useState(initialValue);
    });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;

    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;

    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Render Tetris with initial UI elements", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));

    expect(screen.getByText("Red-Tetris")).toBeInTheDocument();
    expect(screen.getByText("Room Info")).toBeInTheDocument();
    expect(screen.getByText("Next Piece")).toBeInTheDocument();
    expect(screen.getByText("Score Board")).toBeInTheDocument();
  });

  // test("Handles socket events: join, connect, disconnect", async () => {
  //   render(
  //     <MemoryRouter initialEntries={["/room/player"]}>
  //       <Routes>
  //         <Route path="/:room/:player" element={<Tetris />} />
  //       </Routes>
  //     </MemoryRouter>,
  //   );

  //   await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

  //   const mockSocket = (io as jest.Mock).mock.results[0].value;

  //   // Simulate socket events
  //   const mockPlayerList = ["player1", "player2"];
  //   type EventHandler = [event: string, handler: (...args: any[]) => void];
  //   await act(async () => {
  //     mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
  //       if (event === "join") {
  //         // console.log("join is called with ", mockPlayerList)
  //         handler({ playerlist: mockPlayerList, type: "leader" });
  //       }
  //     });
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByText("player1")).toBeInTheDocument();
  //     expect(screen.getByText("player2")).toBeInTheDocument();
  //   });

  //   expect(mockSocket.on).toHaveBeenCalledWith("join", expect.any(Function));
  //   expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
  //   expect(mockSocket.on).toHaveBeenCalledWith(
  //     "disconnect",
  //     expect.any(Function),
  //   );
  // });

  test("fetches room data on mount, verifing connection to the back", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/room/player",
      );
    });
  });

  test("Handles keyboard events and emits them via socket", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    fireEvent.keyUp(document, { key: "ArrowLeft" });

    expect(mockSocket.emit).toHaveBeenCalledWith("keyboard", {
      type: "down",
      key: "ArrowLeft",
    });
    expect(mockSocket.emit).toHaveBeenCalledWith("keyboard", {
      type: "up",
      key: "ArrowLeft",
    });
  });

  /*
  test("Renders dynamic content based on game status", async () => {
    jest.spyOn(React, 'useState').mockImplementation(useStateMock);

    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    const mockSocket = (io as jest.Mock).mock.results[0].value;
    const mockPlayer = "Player"
    type EventHandler = [event: string, handler: (...args: any[]) => void];
    // await act (async() => {
    //     mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
    //         if (event === "gameover") handler({ dier: mockPlayer });
    //     });
    // })

    act (() => {
        const gameoverHandler = mockSocket.on.mock.calls.find(
        ([event]: [string]) => event === "gameover"
        )?.[1]; 
        if (gameoverHandler) {
          gameoverHandler({ dier: mockPlayer });
        }
      });
      // screen.debug()
      await waitFor(() => {
      expect(setState).toHaveBeenCalledWith("died");
    });
  });*/
});

describe("Tetris Component socket-join", () => {

  let mockSocket: Socket;

  beforeEach(() => {
    const useStateMock = jest.requireMock("react").useState;
    const setStatusMock = jest.fn();
    useStateMock.mockImplementation((initialValue: string) => {
      if (initialValue === "ready") {
        return ["ready", setStatusMock];
      }
      return originalReact.useState(initialValue);
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;

    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;
    (io as jest.Mock).mockReturnValue(mockSocket);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("socket-join leader", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    const mockSocket = (io as jest.Mock).mock.results[0].value;
    const mockPlayerList = ["player1", "player2"];

    type EventHandler = [event: string, handler: (...args: any[]) => void];
    await act(async () => {
      mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
        if (event === "join") {
          handler({ playerlist: mockPlayerList, type: "leader" });
        }
      });
    });

    await waitFor(() => {
      const startButton = screen.getByRole("button", { name: /start/i });
      expect(startButton).toBeInTheDocument();
    });
  });
  test("socket-join waiter", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    const mockSocket = (io as jest.Mock).mock.results[0].value;
    const mockPlayerList = ["player1", "player2"];

    type EventHandler = [event: string, handler: (...args: any[]) => void];
    await act(async () => {
      mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
        if (event === "join") {
          handler({ playerlist: mockPlayerList, type: "waiter" });
        }
      });
    });
    screen.debug();

    await waitFor(() => {
      // const message = screen.getByText("playing");
      // expect(message).toBeInTheDocument();
      // TODO - haven't figured it out.
    });
  });
  test("socket-join setPlayers", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    const mockSocket = (io as jest.Mock).mock.results[0].value;
    const mockPlayerList = ["alice", "bob"];

    type EventHandler = [event: string, handler: (...args: any[]) => void];
    await act(async () => {
      mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
        if (event === "join") {
          handler({ playerlist: mockPlayerList, type: "leader" });
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.getByText("bob")).toBeInTheDocument();
    });
  });
});
describe("Tetris Component socket-setleader", () => {
  let mockSocket: Socket;

  beforeEach(() => {
    const useStateMock = jest.requireMock("react").useState;
    const setStatusMock = jest.fn();
    useStateMock.mockImplementation((initialValue: string) => {
      if (initialValue === "ready") {
        return ["ready", setStatusMock];
      }
      return originalReact.useState(initialValue);
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;

    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;
    (io as jest.Mock).mockReturnValue(mockSocket);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("socket-setleader setIsLeader", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    const mockSocket = (io as jest.Mock).mock.results[0].value;
    const mockPlayername = "player";

    await act(async () => {
      mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
        if (event === "setleader") {
          handler({ playername: mockPlayername });
        }
      });
    });

    type EventHandler = [event: string, handler: (...args: any[]) => void];
    await act(async () => {
      mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
        if (event === "setleader") {
          handler({ playername: mockPlayername });
        }
      });
    });
    await waitFor(() => {
      const startButton = screen.getByRole("button", { name: /start/i }); // Case-insensitive match
      expect(startButton).toBeInTheDocument();
    });
  });
});
describe("Tetris Component socket-leave", () => {
  let mockSocket: Socket;

  beforeEach(() => {
    const useStateMock = jest.requireMock("react").useState;
    const setStatusMock = jest.fn();
    useStateMock.mockImplementation((initialValue: string) => {
      if (initialValue === "ready") {
        return ["ready", setStatusMock];
      }
      return originalReact.useState(initialValue);
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;

    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;
    (io as jest.Mock).mockReturnValue(mockSocket);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("socket-leave setPlayers", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    const mockSocket = (io as jest.Mock).mock.results[0].value;
    const mockPlayerList = ["alice", "bob"];
    const mockPlayer = "someonewholeft";

    type EventHandler = [event: string, handler: (...args: any[]) => void];
    await act(async () => {
      mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
        if (event === "leave") {
          handler({ playerlist: mockPlayerList, player: mockPlayer });
        }
      });
    });
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.getByText("bob")).toBeInTheDocument();
    });
  });
  // TODO test("socket-leve update other's board")
});

describe("Tetris useState-startgame", () => {
  let mockSocket: Socket;

  beforeEach(() => {
    const useStateMock = jest.requireMock("react").useState;
    const setStatusMock = jest.fn();
    useStateMock.mockImplementation((initialValue: string) => {
      if (initialValue === "ready") {
        return ["ready", setStatusMock];
      }
      return originalReact.useState(initialValue);
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;

    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;
    (io as jest.Mock).mockReturnValue(mockSocket);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("setPlayers, socket event-startgame", async () => {
    render(
      <MemoryRouter initialEntries={["/room/player"]}>
        <Routes>
          <Route path="/:room/:player" element={<Tetris />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));

    const mockSocket = (io as jest.Mock).mock.results[0].value;
    const mockPlayerList = ["alice", "bob"];

    type EventHandler = [event: string, handler: (...args: any[]) => void];
    await act(async () => {
      mockSocket.on.mock.calls.forEach(([event, handler]: EventHandler) => {
        if (event === "startgame") {
          handler({ playerlist: mockPlayerList });
        }
      });
    });
    await waitFor(() => {
      const elementsAlice = screen.getAllByText("alice");
      expect(elementsAlice).toHaveLength(2);
      const elementsBob = screen.getAllByText("bob");
      expect(elementsBob).toHaveLength(2);
    });
  });
});
