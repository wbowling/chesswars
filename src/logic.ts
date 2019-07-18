import { Chess, ChessInstance } from 'chess.js';
import { ChessBoardFactory, ChessBoardInstance } from 'chessboardjs';

declare const Chessboard: ChessBoardFactory;

import { AI } from './ai';
import { UI } from './ui';

export class Logic {
  private worker?: Worker;

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

  start(workerAI: string) {
    this.game.reset();
    this.board.start(true);
    this.worker = AI.createAIWorker(workerAI);
    this.nextMove();
  }

  async nextMove() {
    this.ui.update_status();

    if (this.game.game_over()) {
      return;
    }

    const move =
      this.game.turn() === 'b'
        ? AI.getRandomMove(this.game)
        : await AI.getAIMove(this.worker!, this.game);
    this.game.move(move);
    this.board.position(this.game.fen());
  }
}
