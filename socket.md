# Socket events

## Error Handling

Each error, no matter from what event, is sent through the "error" event and respect this structure:

```js
{
    errorMsg: String | String[],
    origin: {
        event: String,
        data: Object
    }
}
```

## Game

Connection

```js
socket.io;
namespace: 'game';
```

### Server to Client

Informations about the game (received at connection)

```js
/* EVENT */
"init"
{
    config: {
        board: {
            width: Number,
            height: Number
        },
        pieces[]: {
            type: String,
            class: String
        },
    },
    players[]: [
        name: String
    ],
    room: Number,
    state: typeof "update" event,
    idx?: Number // if client is player
}
```

Current game state (received each time it changes)

```js
/* EVENT */
"piece"
    piece: {
        left: Number,
        top: Number,
        direction: Number,
        element: [],
    },
// falling piece
```

```js
/* EVENT */
"fixPiece"
    piece: {
        left: Number,
        top: Number,
        direction: Number,
        element: [],
    },
// fix this piece
```

```js
/* EVENT */
"board"
board: {
    elements: [
        class: Number,  // second digit = status & first digit = block type
    ],
}
// update my board
```

```js
/* EVENT */
"spectrum"
{
    player: String,
    spectrum: Number[],
}
// when a player change their terrain
```

```js
/* EVENT */
"penalty"
{
    player: String, // who cause penalty -> no penalty to them
    lines: Number,  // number of penalty lines
}
// when a player complete more than 2 lines
```

```js
/* EVENT */
"game manage"
{
    winner: String,
    started: Boolean,
    ended: Boolean,
    gameAdmin: {
        restart: Boolean,
    }
}
/* ACK (Accuse de reception) */
true;
```

### Client to Server

```js
/* EVENT */
"startGame";
{
    player: String,
    room: Number,
}
// to start game
```

```js
/* EVENT */
"keyboard";
{
    key: String,
    type: String,  // keyup, keydown
}
// Update key event
```
