module.exports = {
  onTurn: async function () {
    // Random move
    let move = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];

    return move;
  }
};
