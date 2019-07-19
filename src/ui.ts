import { ChessInstance } from 'chess.js';
import { db } from './db';

export class UI {
  private statusEl: HTMLElement;
  private playerEl: HTMLElement;
  private aiEl: HTMLTextAreaElement;
  private compAiEl: HTMLSelectElement;

  constructor(private game: ChessInstance) {
    this.statusEl = document.getElementById('status')!;
    this.playerEl = document.getElementById('player')!;
    this.compAiEl = document.getElementById('compAi') as HTMLSelectElement;
    this.aiEl = document.getElementById('ai') as HTMLTextAreaElement;

    document.getElementById('save')!.onclick = () => {
      db.saveAi(this.aiEl.value);
    };

    db.watchAis((vals: { [key: string]: string }) => {
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
          this.aiEl.value = vals[k];
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
    });
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
      this.statusEl.innerText = 'None';
    }
    this.playerEl.innerText = this.game.turn();
  }

  getPlayerAI() {
    return this.aiEl.value;
  }

  getCompAI(): string {
    return this.storesAis[this.compAiEl.value];
  }

  private storesAis: { [key: string]: string } = {};
}

const RANDOM_AI = `function getMove(possibleMoves, fen, pgn) {
  // return a valid move

  const idx = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[idx];
}
`;
