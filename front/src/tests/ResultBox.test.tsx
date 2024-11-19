import ResultBox from "../components/ResultBox";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("ResultBox Component", () => {
  test("renders waiting message when status is 'waiting'", () => {
    render(<ResultBox winner={null} myname="Player1" isLeader={false} status="waiting" />);
    expect(screen.getByText(/they are playing\. you should wait until it ends\./i)).toBeInTheDocument();
  });

  test("renders leader's ready message when status is 'ready' and user is leader", () => {
    render(<ResultBox winner={null} myname="Player1" isLeader={true} status="ready" />);
    expect(screen.getByText(/you can click button to start a game/i)).toBeInTheDocument();
  });

  test("renders non-leader's ready message when status is 'ready' and user is not leader", () => {
    render(<ResultBox winner={null} myname="Player1" isLeader={false} status="ready" />);
    expect(screen.getByText(/please wait until the leader starts a game/i)).toBeInTheDocument();
  });

  test("renders win message when user is the winner and status is 'end-play'", () => {
    render(<ResultBox winner="Player1" myname="Player1" isLeader={false} status="end-play" />);
    expect(screen.getByText(/🎉🎊 congrat! you did it! 🏆🎉/i)).toBeInTheDocument();
    expect(screen.getByText(/please wait until the leader starts a game\./i)).toBeInTheDocument();
  });

  test("renders win message when Leader is the winner and status is 'end-play'", () => {
    render(<ResultBox winner="Player1" myname="Player1" isLeader={true} status="end-play" />);
    expect(screen.getByText(/🎉🎊 congrat! you did it! 🏆🎉/i)).toBeInTheDocument();
    expect(screen.getByText(/You can click button to start a game\./i)).toBeInTheDocument();
  });

  test("renders lose message when user is not the winner and status is 'end-play'", () => {
    render(<ResultBox winner="Player2" myname="Player1" isLeader={false} status="end-play" />);
    expect(screen.getByText(/😅 oops! better luck next time! 🍀/i)).toBeInTheDocument();
    expect(screen.getByText(/please wait until the leader starts a game\./i)).toBeInTheDocument();
  });

  test("renders end-wait message for leader when status is 'end-wait'", () => {
    render(<ResultBox winner={null} myname="Player1" isLeader={true} status="end-wait" />);
    expect(screen.getByText(/thanks for waiting!/i)).toBeInTheDocument();
    expect(screen.getByText(/you can click button to start a game\./i)).toBeInTheDocument();
  });

  test("renders end-wait message for user when status is 'end-wait'", () => {
    render(<ResultBox winner={null} myname="Player1" isLeader={false} status="end-wait" />);
    expect(screen.getByText(/thanks for waiting!/i)).toBeInTheDocument();
    expect(screen.getByText(/Please wait until the leader starts a game\./i)).toBeInTheDocument();
  });

  test("renders error message when status is 'error'", () => {
    render(<ResultBox winner={null} myname="Player1" isLeader={false} status="error" />);
    expect(screen.getByText(/there is already a player with same name\. choose different name and try again\./i)).toBeInTheDocument();
  });

  test("renders server waiting message when status is 'waitServer'", () => {
    render(<ResultBox winner={null} myname="Player1" isLeader={false} status="waitServer" />);
    expect(screen.getByText(/waiting for server \.\.\. refresh the page in a few second/i)).toBeInTheDocument();
  });

  test("does not render anything when status is not valid", () => {
    const { container } = render(<ResultBox winner={null} myname="Player1" isLeader={false} status="unknown" />);
    expect(container.firstChild).toBeNull();
  });
});
