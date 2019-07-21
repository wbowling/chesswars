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
  private onMoveEnd: () => void = () => {};

  constructor() {
    const config = {
      position: 'start',
      onMoveEnd: () => {
        this.onMoveEnd();
      },
      moveSpeed: 75,
    };

    this.game = new Chess();
    this.board = Chessboard('myBoard', config);
    this.ui = new UI(this.game);
  }

  async start() {
    const playerAI = this.ui.getPlayerAI();
    const compAI = this.ui.getCompAI();

    this.game.reset();
    this.board.start(true);
    this.playerWorker = AI.createAIWorker(playerAI);
    this.compWorker = AI.createAIWorker(compAI);
    await this.gameLoop();
  }

  async gameLoop(hidden = false) {
    this.ui.update_status();

    let running = true;
    do {
      if (!(await this.nextMove())) {
        this.ui.invalid_move();
        running = false;
      } else {
        if (!hidden) {
          await new Promise(resolve => {
            this.onMoveEnd = resolve;
            this.board.position(this.game.fen());
          });
        }
        this.ui.update_status();
        running = !this.game.game_over();
      }
    } while (running);
    this.board.position(this.game.fen());
  }

  async nextMove() {
    try {
      const move =
        this.game.turn() === 'b'
          ? await AI.getAIMove(this.compWorker!, this.game)
          : await AI.getAIMove(this.playerWorker!, this.game);
      return this.game.move(move);
    } catch (e) {
      return false;
    }
  }
}
