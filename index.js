(function() {

  let log=function(){
    if (false) {
      console.log.apply(console,arguments);
    }
  };

  // Util function to timeout an async function call
  let timeout = async function(ms,f) {
    let timer = null;
    return new Promise(async(resolve)=>{
      timer = setTimeout(()=>{
        resolve({error:"timeout"});
      },ms);
      try {
        let val = await f();
        clearTimeout(timer);
        resolve(val);
      } catch(e) {
        resolve({error:e.message});
      }
    });
  };

  let battlescripts = {
    observer: null,

    observe: async function(newObserver) {
      battlescripts.observer = newObserver;
    },

    match: async function(config) {
      const game = config.game;
      const players = config.players || [];
      let knowledge = config.knowledge || [];
      let playerStates = [];
      let gameStates = [];
      let matchGameStates = [];
      let matchResults = [];
      let loopLimit = config.loopLimit || 500;
      let loopCount = 0;
      let defaultTimeout = 1000;
      let gameStartTimeout = config.gameStartTimeout || defaultTimeout;
      let turnTimeout = config.turnTimeout || defaultTimeout;
      let gameEndTimeout = config.gameEndTimeout || defaultTimeout;

      for (let i = 0; i < config.games; i++) {
        // Reset state list
        gameStates = [];
        
        // Tell the Game to start
        log("Creating game");

        let initialGameState = await game.create(config.scenario || {});
        log("initialGameState", initialGameState);

        // Tell each Player to start
        for (let [i,player] of Object.entries(players)) {
          let playerState = {};
          if (typeof player.onGameStart==="function") {
            playerState = await timeout(gameStartTimeout,async()=>{
              return await player.onGameStart({
                state: initialGameState,
                knowledge: knowledge[i]
              });
            });
          }
          playerStates.push(playerState);
        }
        log("playerStates", playerStates);

        // Tell the game to start and get the first directive to act on
        let gameDirective = await game.start();

        // Game Loop
        while (gameDirective && !gameDirective.gameOver && ++loopCount < loopLimit) {
          log("gameDirective", gameDirective);

          // Allow an Observer to watch and modify the game
          if (battlescripts.observer) {
            let newDirective = await battlescripts.observer(gameDirective);
            if (newDirective) {
              gameDirective = newDirective;
            }
          }

          // state 
          // =====
          if (gameDirective.state) {
            gameStates.push(gameDirective.state);
          }

          // message
          // =======
          // TODO

          // getTurn 
          // =======
          // Ask player(s) to take a turn
          if (gameDirective.getTurn) {
            let moves = {};

            // Allow for multiple players to take a turn at the same time
            // Refactor later to run in parallel
            for (const [playerId, gameState] of Object.entries(gameDirective.getTurn)) {
              let player = players[playerId];

              // Get the player's current stored state
              let playerState = playerStates[playerId];

              let response = await timeout(turnTimeout,async()=>{
                  return await player.onTurn({
                    gameState: gameState,
                    playerState: playerState
                  });
                }
              );

              // Allow the player to return a PlayerTurn object or just a move
              if (response && response.move) {
                move = response.move;
                playerStates[playerId] = response.playerState
              }
              else {
                move = response;
              }

              // Add this player's move to the list
              moves[playerId] = move;
            }
            log(moves);

            // Return the moves back to the game and wait for what to do next
            gameDirective = await game.onTurn(moves);
          }

        } // while

        // Game is over 
        log("Game Over!");

        let results = gameDirective.results;
        log(results);

        matchResults.push(results);
        matchGameStates.push(gameStates);

        // Tell each Player the game is over
        for (let [i,player] of Object.entries(players)) {
          let playerKnowledge = {};
          if (typeof player.onGameEnd==="function") {
            // TODO: timeout
            playerKnowledge = await timeout(gameEndTimeout,async()=>{
              return await player.onGameEnd({
                results: results,
                gameState: gameStates[gameStates.length-1],
                playerState: playerStates[i]
              });
            });
            knowledge[i] = playerKnowledge;
          }
        }

      } // for each game

      // Return the Match results back to the Host
      return {
        results: matchResults,
        state: matchGameStates
      };
    }, // match()
    
    // TODO: Take raw match results and convert them into a usable summary/total
    tally: function(results) {
    
    }

  }

  module.exports = exports = battlescripts;

})();