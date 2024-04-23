class Board {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    // this.socket = socket;
    this.board = new Array(200).fill(0);
    this.interval = null;
    this.fallingPiece = {
      type: 0,
      left: 0,
      top: 0,
      direction: 0,
      elements: null,
    };
    
    clearInterval(this.interval);
  }

    // newGame(socket)
    // moveDown(fallingPiece)


}
