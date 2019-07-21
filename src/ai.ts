import { ChessInstance } from 'chess.js';
export class AI {
  static createAIWorker(workerAI: string): Worker {
    const workerSrc = `
          self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.2/chess.js");
          ${workerAI}
          self.onmessage = ({ data: { pgn } }) => {
            const chess = new Chess();
            chess.load_pgn(pgn);
            self.postMessage(getMove(chess));
          }`;
    const workerBlob = new Blob([workerSrc], { type: 'text/javascript' });
    const workerBlobUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerBlobUrl);
    return worker;
  }

  static async getAIMove(worker: Worker, game: ChessInstance): Promise<string> {
    const pgn = game.pgn();
    const possibleMoves = game.moves();
    const move: string = await new Promise((resolve, reject) => {
      worker.onmessage = event => {
        resolve(event.data);
      };
      worker.postMessage({ pgn });
      setTimeout(() => reject('Timed out'), 1000);
    });

    if (!possibleMoves.includes(move)) {
      throw new Error('Invalid move');
    }
    return move;
  }
}
