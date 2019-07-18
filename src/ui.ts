import { ChessInstance } from 'chess.js';
export class UI {
    private statusEl: HTMLElement;
    private playerEl: HTMLElement;
    private aiEl: HTMLTextAreaElement;
    private loadAiEl: HTMLSelectElement;
    private compAiEl: HTMLSelectElement;

    constructor(private game: ChessInstance) {
        this.statusEl = document.getElementById('status')!;
        this.playerEl = document.getElementById('player')!;
        this.loadAiEl = document.getElementById('loadAi') as HTMLSelectElement;
        this.compAiEl = document.getElementById('compAi') as HTMLSelectElement;
        this.aiEl = document.getElementById('ai') as HTMLTextAreaElement;

        this.loadAiEl.onchange = () => {
            this.loadAi();
        };

        this.aiEl.value = localStorage.getItem('lastAI') || this.ais['random'];
        document.getElementById('save')!.onclick = () => {
            localStorage.setItem('lastAI', this.aiEl.value);
        };
    }

    loadAi() {
        const ai = this.getAi(this.loadAiEl.value);
        if (!ai) {
            return;
        }
        this.aiEl.value = ai;
    }

    getAi(choice: string): string | undefined {
        if (!choice) {
            return;
        }
        if (choice === 'local') {
            return localStorage.getItem('lastAI')!;
        }
        return this.ais[choice];
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
        return this.getAi(this.compAiEl.value) || this.ais["random"];
    }

    private ais: { [key: string]: string } = {
        random: `function getMove(possibleMoves, fen, pgn) {
    // return a valid move

    const idx = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[idx];
}
`,
        attack: `function getMove(possibleMoves, fen, pgn) {
    // return a valid move

    possibleMoves.sort((a,b) => a.replace(/[^0-9]/g, "").localeCompare(b.replace(/[^0-9]/g, "")));
    return possibleMoves[0];
}
`,
    };
}
