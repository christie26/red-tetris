import Pieces from './Pieces.mjs';

class FallingPiece {
    constructor(type, left, direction) {
        this.type = type; // 0-6
        this.left = left;
        this.top = 0;
        this.direction = direction;
        this.elements = Pieces[type];
        this.sprint = false;
        this.fixxing = false;
        this.fastSpeed = false;
    }

    moveDown() {
        this.top++;
    }
    moveUp() {
        this.top--;
    }
    moveLeft() {
        this.left--;
    }
    moveRight() {
        this.left++;
    }
}

export default FallingPiece;
