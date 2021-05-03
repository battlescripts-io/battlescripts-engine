// Simple Tic-Tac-Toe
let state = null;
let turn = 0;
let firstTurn = 0;
let turns = 0;
let logs=[];
let log = function(...m) {
  m.forEach(mm=>{
    if (typeof mm==="object") {
      mm=JSON.stringify(mm);
    }
    logs.push(mm);
  });
};

function directive(o) {
  o = o || {};
  o.state = state;
  if (logs.length) {
    o.log = logs;
    logs = [];
  }
  return o;
}

function getNextTurn() {
  state.player = turn;
  return directive({
    getTurn: {
      [turn]: state
    }
  });
}

function gameOver(winnerId, message) {
  state.message = message;
  log("Game over!");
  return directive({
    gameOver: true,
    results: {
      [1-winnerId]: 0,
      [winnerId]: 1
    }
  });
}

function checkWin(a) {
  let b = state.board;
  let c = b[a[0]][a[1]];
  if (c!==null && b[a[2]][a[3]]===c && b[a[4]][a[5]]===c) {
    return c;
  }
  return null;
}

function winner() {
  let w,wins = [
    [0,0,1,0,2,0],
    [0,1,1,1,2,1],
    [0,2,1,2,2,2],
    [0,0,0,1,0,2],
    [1,0,1,1,1,2],
    [2,0,2,1,2,2],
    [0,0,1,1,2,2],
    [0,2,1,1,2,0]
  ];
  for (let a of wins) {
    w = checkWin(a);
    if (w!==null) {
      return w;
    }
  }
  return null;
}

module.exports = {
  create: async function () {
    return {};
  },

  start: async function () {
    log("Starting Game");

    state = {
      board: [[null, null, null], [null, null, null], [null, null, null]]
    };

    // Reset the turn counter
    turns = 0;

    // Rotate who goes first each game
    firstTurn = 1-firstTurn;
    turn = firstTurn;

    // Tell the engine to ask the first player to move
    return getNextTurn();
  },

  onTurn: async function (moves) {
    for (const [playerId, move] of Object.entries(moves)) {
      let opponent = 1-playerId;

      // Player error or timeout
      if (move && move.error) {
        return gameOver(opponent,`Player Error: ${move.error}`);
      }
      let [row, col] = move;

      // Check for invalid move syntax
      if (typeof row!=="number" || row<0 || row>2 || typeof col!=="number" || col<0 || col>2) {
        return gameOver(opponent, `Invalid move: Move must be in the format [a,b] where 0<=a<=2 and 0<=b<=2. Received [${row},{$col}]`);
      }

      // Make sure the move space is empty
      if (state.board[row][col] !== null) {
        return gameOver(opponent,`Square [${row},${col}] is not empty`);
      }

      // Update the board with the move
      state.board[row][col] = playerId;

      // Check for a win
      let w = winner();
      if (w!==null) {
        log("Winner!");
        return gameOver(w);
      }

      // Check for a draw
      if (++turns===9) {
        // For a draw, each player gets 0.5 points
        return directive({
          gameOver: true,
          results: {0:.5,1:.5}
        });
      }
    }

    // Ask the next player to move
    turn = 1 - turn;
    return getNextTurn();
  }

};
