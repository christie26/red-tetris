import "./App.css";

function ErrorPage() {
  const style = {
    fontSize: "50px",
    color: "gray",
  };
  return (
    <div>
      <h1>Red-Tetris</h1>
      <div className="container">
        <p style={style}>Acess to /roomname/playername</p>
      </div>
    </div>
  );
}

export default ErrorPage;
