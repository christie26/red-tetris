# red-tetris 📚
Tetris Network with Red Pelicans Sauce

## Description 🔍

The goal of this project is to develop a multiplayer tetris game on the network with a set of software exclusively from Full Stack Javascript. 

## Dependencies 🛠️


## Installation 📦

## Running the program 💻

### static-tetris 
You can either use vscode extension named `live server` or 
```
firefox static_tetris/index.html
```
or whatever! 

### server-client 

```
npm i
npm run start
npm run dev

```

## class definition
1. **Pieces**
2. **FallingPiece**
3. **Board**\
when board is changed? 
    1. new falling piece is fixed 
    2. line is complete 
    3. penalty 


```javascript
class Board {
    // 200 array 
    // each index has 2-digit int.
    // first digit:  status; 0:falling,1:fixed,2:penalty
    // second digit: type of piese

}
```

```javascript
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
```
```javascript
const Pieces = {
  oBlock: [
    [0, 1, 10, 11], // Direction 0
    [0, 1, 10, 11], // Direction 1
    [0, 1, 10, 11], // Direction 2
    [0, 1, 10, 11], // Direction 3
  ],
  tBlock: [
    [11, 0, 1, 2],
    [11, 2, 12, 22],
    [11, 20, 21, 22],
    [11, 0, 10, 20],
  ],
  jBlock: [
    [11, 0, 10, 12],
    [11, 1, 2, 21],
    [11, 10, 12, 22],
    [11, 20, 21, 1],
  ],
  lBlock: [
    [11, 20, 10, 12],
    [11, 1, 0, 21],
    [11, 10, 12, 2],
    [11, 22, 21, 1],
  ],
  sBlock: [
    [11, 1, 2, 10],
    [11, 22, 12, 1],
    [11, 12, 20, 21],
    [11, 0, 10, 21],
  ],
  zBlock: [
    [11, 1, 0, 12],
    [11, 2, 12, 21],
    [11, 10, 21, 22],
    [11, 1, 10, 20],
  ],
  iBlock: [
    [1, 0, 2, 3],
    [11, 1, 21, 31],
    [1, 0, 2, 3],
    [11, 1, 21, 31],
  ],
};
```


## Authors 👩‍💻
Names of contributors :
 * @balkisous
 * @christie26

## Version history ✅
* Made at 42Paris 

## Subject 📝
You will find the subject in the repository.
