import { Logic } from './logic';
import { ChessInstance } from 'chess.js';
import { db } from './db';
import CodeMirror = require('codemirror');
import '../node_modules/codemirror/lib/codemirror.css';
import '../node_modules/codemirror/mode/javascript/javascript';

export class UI {
  private statusEl: HTMLElement;
  private playerEl: HTMLElement;
  private compAiEl: HTMLSelectElement;
  private editor: CodeMirror.EditorFromTextArea;

  constructor(private game: ChessInstance, private logic: Logic) {
    this.statusEl = document.getElementById('status')!;
    this.playerEl = document.getElementById('player')!;
    this.compAiEl = document.getElementById('compAi') as HTMLSelectElement;
    const aiEl = document.getElementById('ai') as HTMLTextAreaElement;
    this.editor = CodeMirror.fromTextArea(aiEl, {
      lineNumbers: true,
      mode: 'javascript',
    });

    document.getElementById('speed')!.onchange = event => {
      const speed = (event.target as HTMLInputElement).value;
      this.logic.config.moveSpeed = Number(speed);
      this.logic.rebuild();
    };

    document.getElementById('save')!.onclick = () => {
      db.saveAi(this.editor.getValue());
    };

    db.watchAis(vals => this.aisUpdated(vals));
  }

  aisUpdated(vals: { [key: string]: string }) {
    if (!vals) {
      vals = {};
    }
    this.storesAis = {};
    const selected = this.compAiEl.value || 'random';

    this.compAiEl.innerHTML = '';
    const user = db.app.auth().currentUser;
    if (user && !vals[user.uid]) {
      vals[user.uid] = RANDOM_AI;
    }

    for (const k of Object.keys(vals)) {
      const opt = document.createElement('option');
      if (user && user.uid === k) {
        opt.value = k;
        opt.appendChild(document.createTextNode('Your AI'));
        this.editor.setValue(vals[k]);
      } else {
        opt.value = k;
        opt.appendChild(document.createTextNode(k));
      }
      if (opt.value === selected) {
        opt.selected = true;
      }
      this.compAiEl.appendChild(opt);
      this.storesAis[k] = vals[k];
    }
  }

  invalid_move() {
    this.statusEl.innerText = 'Invalid move, you loose';
  }

  update_status() {
    if (this.game.in_checkmate()) {
      this.statusEl.innerText = 'Checkmate';
    } else if (this.game.in_stalemate()) {
      this.statusEl.innerText = 'Stalemate';
    } else if (this.game.in_draw()) {
      this.statusEl.innerText = 'Draw';
    } else if (this.game.in_check()) {
      this.statusEl.innerText = 'Check';
    } else {
      this.statusEl.innerText = '';
    }
    this.playerEl.innerText = this.game.turn() === 'w' ? 'White' : 'Black';
  }

  getPlayerAI() {
    return this.editor.getValue();
  }

  getCompAI(): string {
    return this.storesAis[this.compAiEl.value];
  }

  private storesAis: { [key: string]: string } = {};
}

const RANDOM_AI = `function getMove(game) {
  // game is a Chess object - https://github.com/jhlywa/chess.js#api
  // return a valid move
  const possibleMoves = game.moves();

  const idx = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[idx];
}
`;
