module.exports = {

  onGameStart: function(start) {
    let initialGameState = start.gameState;
    let knowledge = start.knowledge || {};

    let myState = {};
    myState.knowledge = knowledge;
    if (!myState.knowledge.gameNumber) {
      myState.knowledge.gameNumber = 1;
    }
    else {
      myState.knowledge.gameNumber++;
    }

    //console.log("knowledge");
    //console.log(knowledge);

    return myState;
  },

  onTurn: function (turnRequest) {
    let gameState = turnRequest.gameState;
    let myState = turnRequest.playerState;

    //console.log("myState");
    //console.log(myState);

    // Random move
    let move = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
    return move;
  },

  onGameEnd: function(playerGameEnd) {
    let results = playerGameEnd.results;
    let gameState = playerGameEnd.gameState;
    let myState = playerGameEnd.playerState;

    // Update my knowledge
    return myState.knowledge; 
  }

};
