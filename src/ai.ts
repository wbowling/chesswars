import { ChessInstance } from 'chess.js';
export class AI {
  static createAIWorker(workerAI: string): Worker {
    const workerSrc = `
          self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.2/chess.js");
          ${workerAI}
          self.onmessage = ({ data: { fen } }) => {
            self.postMessage(getMove(new Chess(fen)));
          }`;
    const workerBlob = new Blob([workerSrc], { type: 'text/javascript' });
    const workerBlobUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerBlobUrl);
    return worker;
  }

  static async getAIMove(worker: Worker, game: ChessInstance): Promise<string> {
    const fen = game.fen();
    const possibleMoves = game.moves();
    const move: string = await new Promise((resolve, reject) => {
      worker.onmessage = event => {
        resolve(event.data);
      };
      worker.postMessage({ fen });
      setTimeout(() => reject('Timed out'), 1000);
    });

    if (!possibleMoves.includes(move)) {
      throw new Error('Invalid move');
    }
    return move;
  }
}
