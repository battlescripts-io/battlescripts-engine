module.exports = function (state, mimeType) {
  if (!mimeType || mimeType === "text/plain") {
    let b = state.board;
    let d = (row, col) => {
      if (b[row][col] == null) {
        return ".";
      }
      return b[row][col] === "0" ? "X" : "O";
    };
    let board = `${d(0, 0)}|${d(0, 1)}|${d(0, 2)} \n`;
    board += `-+-+-\n`;
    board += `${d(1, 0)}|${d(1, 1)}|${d(1, 2)} \n`;
    board += `-+-+-\n`;
    board += `${d(2, 0)}|${d(2, 1)}|${d(2, 2)} \n\n`;

    return board;
  }
}