class FallingPiece {
    constructor(type, left, direction) {
        this.type = type; // 0-6
        this.left = left;
        this.top = 0;
        this.direction = direction;
        this.elements = Pieces[type];
    }
    // sprint = false;
    // fixxing = false;
    // fastSpeed = false;
}