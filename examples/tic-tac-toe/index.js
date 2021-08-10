const battlescripts = require('../../index.js');
const game = require('./game.js');
const p1 = require('./player1.js');
const p2 = require('./player2.js');
const render = require('./render.js');

(async function() {
  try {
    console.log("Starting match");

    // Watch the game as it is being played.
    // We could modify things here, but we won't.
    // This same observer gets called before processing a gameDirective AND after players have moved
    let previousState = null;
    battlescripts.observe(async function(gameDirective) {
      // Allow the game to log things
      let log = gameDirective.log;
      if (log) {
        if (typeof log==="string") { log = [log]; }
        log.forEach(s=>{
          console.log(`Game Log: ${s}`)
        });
      }

      // Log the game to the console to watch
      // But only if there is state, because this could be a directive of player moves
      if (gameDirective.state) {
        console.log(render(gameDirective.state, previousState));
        previousState = gameDirective.state;
      }

      // introduce an artificial delay
      return new Promise((resolve)=>{
        setTimeout(resolve,1);
      });
    });

    // POC: Wrap p1 to be async
    p1._onTurn = p1.onTurn;
    p1.onTurn = async function(req) {
      return new Promise((resolve)=>{
        setTimeout(()=>{
          resolve(p1._onTurn(req));
        },1);
      });
    };

    // Run a match
    let results = await battlescripts.match({
      game: game,
      players: [p1, p2],
      games: 10,
      knowledge: [],
      scenario: {}
    });

    let tally = battlescripts.tally(results.results);
    let states = results.state;
    let logs = results.log;

    console.log(logs);
    console.log( JSON.stringify(tally,null,2) );

  } catch(e) {
    console.log(e);
  }
})();
