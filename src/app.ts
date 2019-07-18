import {Chess} from 'chess.js';
import {ChessBoardFactory} from 'chessboardjs';

declare const Chessboard: ChessBoardFactory;

function display_results() {
  if (game.in_checkmate()) {
    document.getElementById('status')!.innerText = 'Checkmate';
  } else if (game.in_stalemate()) {
    document.getElementById('status')!.innerText = 'Stalemate';
  } else if (game.in_draw()) {
    document.getElementById('status')!.innerText = 'Draw';
  }
}

function getRandomMove(): string {
  const possibleMoves = game.moves();

  const randomIdx = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIdx];
}

async function getAIMove(): Promise<string> {
  const possibleMoves = game.moves();
  const fen = game.fen();
  const pgn = game.pgn();

  const move: string = await new Promise(resolve => {
    worker.onmessage = (event) => {
      console.log('11 got ', event.data);
      resolve(event.data);
    };
    worker.postMessage({possibleMoves, fen, pgn});
  });
  return move;
}


async function nextMove() {
  if (game.game_over()) {
    display_results();
    return;
  }

  if (game.in_check()) {
    document.getElementById('status')!.innerText = 'Check';
  } else {
    document.getElementById('status')!.innerText = '';
  }
  document.getElementById('player')!.innerText = game.turn();

  const move = (game.turn() === 'b') ? getRandomMove() : await getAIMove();
  game.move(move);
  board.position(game.fen());
}
const onMoveEnd = () => {
  nextMove();
};

function createAIWorker(): Worker {
  const workerSrc = document.getElementById('ai')!.value;
  console.log('workerSrc', workerSrc);
  const workerBlob = new Blob([workerSrc], {type: 'text/javascript'});
  const workerBlobUrl = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerBlobUrl);
  return worker;
}
const config = {
  position: 'start',
  onMoveEnd,
  moveSpeed: 75,
};

const game = new Chess();
const board = Chessboard('myBoard', config);
let worker: Worker;

function start() {
  game.reset();
  board.start(true);
  worker = createAIWorker();
  nextMove();
}

(document.getElementById('ai') as HTMLTextAreaElement).value = `
self.onmessage = ({data: { possibleMoves, fen, pgn }}) => {
    // calculate move and send it back via self.postMessage
    
    const randomIdx = Math.floor(Math.random() * possibleMoves.length);
    self.postMessage(possibleMoves[randomIdx]);
}
`;

document.getElementById('start')!.onclick = start;
