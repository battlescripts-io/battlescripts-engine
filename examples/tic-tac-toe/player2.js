// Stupid Player #2
// Move randomly
module.exports = {
  onTurn: async function (turnRequest) {
    let gameState = turnRequest.gameState;
    let square, row, col;
    do {
      row = Math.floor(Math.random() * 3);
      col = Math.floor(Math.random() * 3);
      square = gameState.board[row][col];
    } while(square!==null);

    return [row,col];
  }
};
