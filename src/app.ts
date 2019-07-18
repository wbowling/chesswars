import '../node_modules/@chrisoakman/chessboardjs/dist/chessboard-1.0.0.js';
import '../node_modules/@chrisoakman/chessboardjs/dist/chessboard-1.0.0.css';

import { Logic } from './logic';

const logic = new Logic();

document.getElementById('start')!.onclick = () => {
  logic.start();
};
