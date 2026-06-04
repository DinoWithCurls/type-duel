import { type MatchPlayer } from "../models/MatchModel";
class GameView {
    private _root: HTMLElement;

    constructor(root: HTMLElement) {
        this._root = root;
    }

    renderHome() {
        this._root.innerHTML = `
            <div>
                <h1>TypeDuel</h1>
                <input id="player-name" type="text" placeholder="Enter your name" />
                <button id="create-match">Create Match</button>
                <button id="view-history">View History</button>
            </div>
        `
    }
    onCreateMatch(callback: (name: string) => void) {
        const btn = this._root.querySelector('#create-match') as HTMLButtonElement;
        const input = this._root.querySelector('#player-name') as HTMLInputElement;
        if (btn) {
            btn.onclick = () => {
                if (!input.value.trim()) return;
                callback(input.value)
            }
        }
    }

    onStartMatch(callback: () => void) {
        const btn = this._root.querySelector('#start-match') as HTMLButtonElement;
        if (btn) {
            btn.onclick = () => callback();
        }
    }

    onViewHistory(callback: () => void) {
        const btn = this._root.querySelector('#view-history') as HTMLButtonElement;
        if (btn) {
            btn.onclick = () => callback();
        }
    }

    onKeystroke(callback: (e: KeyboardEvent) => void) {
        document.addEventListener('keydown', callback);
    }


    renderLobby(roomCode: string) {
        this._root.innerHTML = `
            <div>
                <h1>TypeDuel</h1>
                <h5>Lobby</h5>
                <div>Your room code: <strong>${roomCode}</strong></div>
                <span>Send this to the other player!</span>
                <div id="lobby-updates"></div>
            </div>
        `
    }

    renderOpponentJoined(opponentName: string) {
        const updates = this._root.querySelector('#lobby-updates');
        if (updates) updates.innerHTML = `
            <div>
                <h5>Your opponent has joined! Name: ${opponentName}</h5>
                <button id="start-match">Start match</button>
            </div>
        `
    }

    renderCountdown(n: number) {
        this._root.innerHTML = `
            <div>
                <p>Starting in</p>
                <span>${n === 0 ? 'Go!' : n}</span>
            </div>
        `
    }

    renderMatch(passage: string) {
        this._root.innerHTML = `
            <div id="match-container">
                <div>
                    <h4>Stats</h4>
                    <div id="local-stats">Your stats</div>
                    <div id="opponent-stats">Opponent stats</div>
                </div>
                <div id="time-remaining-container"></div>
                <div id="passage">
                    <span id="typed" style="color: blue; font-weight: bold;"></span>
                    <span id="cursor-char" style="border-bottom: 2px solid black; background-color: #e0e0e0;"></span>
                    <span id="untyped" style="color: grey;">${passage}</span>
                </div>
            </div>
        `;
    }

    updateMatch(localStats: MatchPlayer, opponentStats: MatchPlayer, timeRemaining: number) { 
        const timeRemainingHTML = this._root.querySelector('#time-remaining-container');
        const localStatsHTML = this._root.querySelector('#local-stats');
        const opponentStatsHTML = this._root.querySelector('#opponent-stats');
        const cursorChar = this._root.querySelector('#cursor-char');
        const typed = this._root.querySelector('#typed');
        const untyped = this._root.querySelector('#untyped');
        
        if(!typed || !untyped || !localStatsHTML || !opponentStatsHTML || !timeRemainingHTML) return;
        
        const fullPassage = typed.textContent + untyped.textContent;
        typed.textContent = fullPassage.slice(0, localStats.cursorIndex);
        cursorChar.textContent = fullPassage[localStats.cursorIndex] ?? '';
        untyped.textContent = fullPassage.slice(localStats.cursorIndex + 1);
        localStatsHTML.innerHTML = `WPM: ${Math.round(localStats.currentWpm)} | Errors: ${localStats.errors}`;
        opponentStatsHTML.innerHTML = `Opponent WPM: ${Math.round(opponentStats.currentWpm)} | Progress: ${opponentStats.cursorIndex} chars`;
        if (timeRemaining > 0) {
            timeRemainingHTML.innerHTML = `${Math.round(timeRemaining)} seconds left`;
        } else {
            timeRemainingHTML.innerHTML = `Match over!`;
        }   
    }
}


export default GameView;