const log = require('./src/util/log');
const timeout = require('./src/util/timeout');

(function() {
  let clone = o=>{ return JSON.parse(JSON.stringify(o)); };

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
        playerStates = [];

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
        let endLoop = false;

        // Game Loop
        while (!endLoop && ++loopCount < loopLimit) {
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
            gameStates.push(clone(gameDirective.state));
          }

          // gameOver?
          // =========
          if (gameDirective && gameDirective.gameOver) {
            endLoop = true;
            continue;
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
              let move;
              if (response && response.move) {
                move = response.move;
                playerStates[playerId] = response.playerState
              }
              else {
                move = response;
              }

              // Make sure the player returned *something*
              if (typeof move==="undefined") {
                move = {error:"Player did not return a move"};
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

        matchResults.push(clone(results));
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

    // Take raw match results and convert them into a usable summary/total
    tally: function(results) {
      // TODO: Discuss what this should look like?
      let matchResults = {
        winners:[],
        gameWinners:[],
        scores: {},
        leaderboard:[],
        highScore:0
      };

      let sortByNumericValueDesc = (a,b)=>{
        if (a[1]<b[1]) { return 1; }
        if (a[1]>b[1]) { return -1; }
        return 0;
      };

      // results is an array of individual game results
      results.forEach(gameResult=>{
        // gameResult is an object containing player scores
        let highScore = null;
        let winners = [];
        // Sort the players by high score
        let leaderboard = Object.entries(gameResult).sort(sortByNumericValueDesc);
        for (let [playerId,score] of leaderboard) {
          matchResults.scores[playerId] = matchResults.scores[playerId] || 0;
          matchResults.scores[playerId] += score;

          if (highScore===null) {
            highScore = score;
          }
          if (score === highScore) {
            winners.push(playerId);
          }
        }
        matchResults.gameWinners.push(winners);
      });

      // We've now totaled up all game scores and can find overall winners
      matchResults.leaderboard = Object.entries(matchResults.scores).sort(sortByNumericValueDesc);
      matchResults.leaderboard.forEach(r=>{
        let [playerId,score] = r;
        if (matchResults.highScore === 0) {
          matchResults.highScore = score;
        }
        if (score === matchResults.highScore) {
          matchResults.winners.push(playerId);
        }
      });

      return matchResults;
    }

  };

  module.exports = exports = battlescripts;

})();
