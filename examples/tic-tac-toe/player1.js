// Stupid Player #1
// Take the first available move from top down
module.exports = {
  onTurn: function (turnRequest) {
    let gameState = turnRequest.gameState;
    for (let row=0; row<3; row++) {
      for (let col=0; col<3; col++) {
        if (gameState.board[row][col]===null) {
          return [row,col];
        }
      }
    }
  }
};
