import { Chess, ChessInstance } from 'chess.js';
import { ChessBoardFactory, ChessBoardInstance } from 'chessboardjs';

declare const Chessboard: ChessBoardFactory;

import { AI } from './ai';
import { UI } from './ui';

export class Logic {
  private playerWorker?: Worker;
  private compWorker?: Worker;

  private game: ChessInstance;
  private board: ChessBoardInstance;
  private ui: UI;
  constructor() {
    const config = {
      position: 'start',
      onMoveEnd: () => {
        this.nextMove();
      },
      moveSpeed: 75,
    };

    this.game = new Chess();
    this.board = Chessboard('myBoard', config);
    this.ui = new UI(this.game);
  }

  start() {
    const playerAI = this.ui.getPlayerAI();
    const compAI = this.ui.getCompAI();

    this.game.reset();
    this.board.start(true);
    this.playerWorker = AI.createAIWorker(playerAI);
    this.compWorker = AI.createAIWorker(compAI);
    this.nextMove();
  }

  async nextMove() {
    this.ui.update_status();

    if (this.game.game_over()) {
      return;
    }

    const move =
      this.game.turn() === 'b'
        ? await AI.getAIMove(this.compWorker!, this.game)
        : await AI.getAIMove(this.playerWorker!, this.game);
    this.game.move(move);
    this.board.position(this.game.fen());
  }
}
