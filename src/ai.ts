import { ChessInstance } from 'chess.js';
export class AI {
  static createAIWorker(workerAI: string): Worker {
    const workerSrc = `
          ${workerAI}
          self.onmessage = ({data: { possibleMoves, fen, pgn }}) => {
            self.postMessage(getMove(possibleMoves, fen, pgn));
          }`;
    const workerBlob = new Blob([workerSrc], { type: 'text/javascript' });
    const workerBlobUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerBlobUrl);
    return worker;
  }

  static async getAIMove(worker: Worker, game: ChessInstance): Promise<string> {
    const possibleMoves = game.moves();
    const fen = game.fen();
    const pgn = game.pgn();

    const move: string = await new Promise((resolve, reject) => {
      worker.onmessage = event => {
        resolve(event.data);
      };
      worker.postMessage({ possibleMoves, fen, pgn });
      setTimeout(() => reject('Timed out'), 1000);
    });
    if (!possibleMoves.includes(move)) {
      throw new Error('Invalid move');
    }
    return move;
  }
}
