const battlescripts = require('../../index.js');
const game = require('./game.js');
const p1 = require('./player1.js');
const p2 = require('./player2.js');
const render = require('./render.js');

(async function() {
  try {
    console.log("Starting match");

    // Watch the game as it is being played
    battlescripts.observe(function(gameDirective) {
      console.log( render(gameDirective.state) );
      // introduce an artificial delay
      return new Promise((resolve,reject)=>{
        setTimeout(resolve,200);
      });
    });

    // POC: Wrap p1 to be async
    p1._onTurn = p1.onTurn;
    p1.onTurn = async function(req) {
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          let response  = p1._onTurn(req);
          resolve(response);
        },200);
      });
    };

    // Run a match
    let results = await battlescripts.match({
      game: game,
      players: [p1, p2],
      games: 3,
      knowledge: [],
      scenario: {}
    });

    console.log( JSON.stringify(results,null,2) );
  } catch(e) {
    console.log(e);
  }
})();
