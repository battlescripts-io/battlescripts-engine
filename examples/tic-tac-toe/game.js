// Simple Tic-Tac-Toe
let state = {};
let turn = 0;

function getNextTurn() {
  return {
    getTurn: {
      [turn]: state
    },
    state: state
  };
}

function gameOver(playerId) {
  return {
    gameOver: true,
    results: { 
      [playerId]: 0,
      [1-playerId]: 1
    }
  };
}
module.exports = {
  create: async function (seed) {
    return {};
  },

  start: async function () {
    state = {
      board: [[null, null, null], [null, null, null], [null, null, null]]
    };

    // Tell the engine that player 0 should start
    return getNextTurn();
  },

  onTurn: async function (moves) {
    //console.log(moves);
    for (const [playerId, move] of Object.entries(moves)) {
      if (move && move.error) {
        return gameOver(playerId);
      }
      let [row, col] = move;

      if (state.board[row][col] !== null) {
        //console.log("Game: Invalid move!");
        // Invalid move, game over!
        return gameOver(playerId);
      }

      // I'm not even checking for a real win!

      state.board[row][col] = playerId;
      turn = 1 - turn;
      return getNextTurn();
    }
  }

};
