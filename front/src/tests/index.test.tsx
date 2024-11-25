import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(),
}));

describe("index.tsx", () => {
  let mockRender: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRender = jest.fn();

    (ReactDOM.createRoot as jest.Mock).mockReturnValue({
      render: mockRender,
    });
  });

  test("renders App component inside BrowserRouter", () => {
    const mockRoot = document.createElement("div");
    mockRoot.setAttribute("id", "root");
    document.body.appendChild(mockRoot);

    require("../index");

    expect(ReactDOM.createRoot).toHaveBeenCalledWith(
      document.getElementById("root"),
    );

    expect(mockRender).toHaveBeenCalledWith(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
  });

  test("does not throw if root element is missing", () => {
    document.body.innerHTML = "";

    require("../index");

    expect(ReactDOM.createRoot).not.toHaveBeenCalled();
  });
});
