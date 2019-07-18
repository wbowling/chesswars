import { ChessInstance } from 'chess.js';
export class UI {
  private statusEl: HTMLElement;
  private playerEl: HTMLElement;
  private aiEl: HTMLTextAreaElement;
  private loadAiEl: HTMLSelectElement;

  constructor(private game: ChessInstance) {
    this.statusEl = document.getElementById('status')!;
    this.playerEl = document.getElementById('player')!;
    this.loadAiEl = document.getElementById('loadAi') as HTMLSelectElement;
    this.aiEl = document.getElementById('ai') as HTMLTextAreaElement;

    this.loadAiEl.onchange = () => {
      this.loadAi();
    };

    this.aiEl.value = localStorage.getItem('lastAI') || this.ais['random'];
    this.aiEl.onkeyup = () => {
      localStorage.setItem('lastAI', this.aiEl.value);
    };
  }

  loadAi() {
    const choice: string = this.loadAiEl.value;
    if (!choice) {
      return;
    }
    if (choice === 'local') {
      this.aiEl.value = localStorage.getItem('lastAI')!;
    } else {
      this.aiEl.value = this.ais[choice];
    }
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

  private ais: { [key: string]: string } = {
    random: `function getMove(possibleMoves, fen, pgn) {
// return a valid move

const idx = Math.floor(Math.random() * possibleMoves.length);
self.postMessage(possibleMoves[idx]);
}
`,
  };
}
