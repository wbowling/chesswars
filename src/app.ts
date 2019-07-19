import '../node_modules/@chrisoakman/chessboardjs/dist/chessboard-1.0.0.js';
import '../node_modules/@chrisoakman/chessboardjs/dist/chessboard-1.0.0.css';

import { Logic } from './logic';
import { db } from './db';

db.app.auth().onAuthStateChanged(user => {
  if (user) {
    const logic = new Logic();
    document.getElementById('start')!.onclick = () => {
      logic.start();
    };
  }
});
