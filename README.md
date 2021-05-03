# BattleScripts

### Types
```
// Defined by the game and understood by the player. Opaque to the engine.
type GameState;
type GameMessage;
type Move;

// Opaque to everyone except the player.
type PlayerKnowledge;
type PlayerState;

// Defined by the game and opaque to everyone else
type Scenario;
```

### Message Interfaces
```
// Passed into match()
interface GameConfig {
  scenario?: {Scenario},
  game: {Game},
  players: [ {Player}* ],
  knowledge: [ {PlayerKnowledge}* ],
  loopLimit?: Number,
  gameStartTimeout?: Number,
  turnTimeout?: Number,
  gameEndTimeout?: Number
}

// Game returns this as the "command" to the Engine to control flow
interface GameDirective {
  // Game returns state with every Directive
  // It can be optionally rendered now or later
  state: {GameState},

  getTurn?: {
    PlayerId: {GameState}
  },
  
  message?: {
    PlayerId: {GameMessage}
  },
  
  gameOver?: Boolean,
  
  results?: {
    // Each player will get an integer score
    // The highest score(s) is the winner
    // Game decides how many points to award
    scores: {
      PlayerId: Number
    }
  },
  
  // Info from the game, which might be displayed to the user
  log?: String | [ String* ]
}

interface PlayerGameStart {
  gameState: {GameState},
  knowledge?: {PlayerKnowledge}
}

interface PlayerTurnRequest {
  gameState: {PlayerGameState},
  playerState: {PlayerState}
}

interface PlayerTurn {
  move: {Move},
  playerState?: {PlayerState}
}

interface PlayerTurns {
  PlayerId: {Move}
}

interface PlayerGameEnd {
  results: {GameResults},
  gameState: {GameState},
  playerState: {PlayerState}
}

interface MatchResults {
  results: [ GameResults* ],
  state: [ [ {GameState}* ] ]
}

interface MatchResultsSummary {
  matchWinners: [ PlayerId* ],
  gameWinners: [ [PlayerId*] ],
  scores: [ Number* ],
}
```

### Engine API
```
match(GameConfig): MatchResults,

tally(MatchResults): MatchResultsSummary
```

### Game and Player API Interfaces
```
interface Player {
  onGameStart(PlayerGameStart): PlayerState,
  onTurn(PlayerTurnRequest): PlayerTurn | Move,
  onMessage(GameMessage): PlayerState,
  onGameEnd(PlayerGameEnd): PlayerKnowledge?
}

interface Game {
  create(Scenario): GameState,
  start(): GameDirective,
  onTurn(PlayerTurns): GameDirective
}
```
