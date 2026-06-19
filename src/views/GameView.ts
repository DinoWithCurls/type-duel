import { type MatchPlayer } from "../models/MatchModel";
/** Handles all DOM rendering for the game screens (home, lobby, difficulty, countdown, match). */
class GameView {
    private _root: HTMLElement;
    /** Stored to avoid reconstructing from DOM on every keystroke. */
    private _passage: string = '';
    /** Stored so the old listener can be removed before adding a new one on rematch. */
    private _keystrokeHandler: ((e: KeyboardEvent) => void) | null = null;

    constructor(root: HTMLElement) {
        this._root = root;
    }

    onDifficultySelect(callback: (targetWpm: number) => void) {
        const easy = this._root.querySelector('#easy') as HTMLButtonElement;
        const medium = this._root.querySelector('#medium') as HTMLButtonElement;
        const hard = this._root.querySelector('#hard') as HTMLButtonElement;
        if (easy) easy.onclick = () => callback(30);
        if (medium) medium.onclick = () => callback(60);
        if (hard) hard.onclick = () => callback(100);
    }

    onCreateMatch(callback: (name: string) => void) {
        const btn = this._root.querySelector('#create-match') as HTMLButtonElement;
        const input = this._root.querySelector('#player-name') as HTMLInputElement;
        if (btn) {
            btn.onclick = () => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#ef4444';
                    input.classList.remove('shake');
                    void input.offsetWidth;
                    input.classList.add('shake');
                    setTimeout(() => {
                        input.style.borderColor = '';
                        input.classList.remove('shake');
                    }, 400);
                    return;
                }
                callback(input.value)
            }
        }
    }

    onJoinMatch(callback: (name: string, roomCode: string) => void) {
        const btn = this._root.querySelector('#join-match') as HTMLButtonElement;
        const nameInput = this._root.querySelector('#player-name') as HTMLInputElement;
        const roomCodeInput = this._root.querySelector('#room-code') as HTMLInputElement;
        if (btn) {
            btn.onclick = () => {
                if (!nameInput.value.trim()) {
                    nameInput.style.borderColor = '#ef4444';
                    nameInput.classList.remove('shake');
                    void nameInput.offsetWidth;
                    nameInput.classList.add('shake');
                    setTimeout(() => {
                        nameInput.style.borderColor = '';
                        nameInput.classList.remove('shake');
                    }, 400);
                    return;
                }
                if (!roomCodeInput.value.trim()) {
                    roomCodeInput.style.borderColor = '#ef4444';
                    roomCodeInput.classList.remove('shake');
                    void roomCodeInput.offsetWidth;
                    roomCodeInput.classList.add('shake');
                    setTimeout(() => {
                        roomCodeInput.style.borderColor = '';
                        roomCodeInput.classList.remove('shake');
                    }, 400);
                    return;
                }
                callback(nameInput.value, roomCodeInput.value)
            }
        }
    }

    onSinglePlayer(callback: (name: string) => void) {
        const btn = this._root.querySelector('#single-player') as HTMLButtonElement;
        const input = this._root.querySelector('#player-name') as HTMLInputElement;
        if (btn) btn.onclick = () => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ef4444';
                input.classList.remove('shake');
                void input.offsetWidth;
                input.classList.add('shake');
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.classList.remove('shake');
                }, 400);
                return;
            };
            callback(input.value)
        };
    }

    onStartMatch(callback: () => void) {
        const btn = this._root.querySelector('#start-match') as HTMLButtonElement;
        if (btn) btn.onclick = () => callback();
    }

    onViewHistory(callback: () => void) {
        const btn = this._root.querySelector('#view-history') as HTMLButtonElement;
        if (btn) btn.onclick = () => callback();
    }

    onKeystroke(callback: (e: KeyboardEvent) => void) {
        if (this._keystrokeHandler) {
            document.removeEventListener('keydown', this._keystrokeHandler);
        }
        this._keystrokeHandler = callback;
        document.addEventListener('keydown', this._keystrokeHandler);
    }
    /** Lightweight DOM update called on every keystroke and timer tick — only updates dynamic elements, does not re-render. */
    updateMatch(localStats: MatchPlayer, opponentStats: MatchPlayer, timeRemaining: number) {
        const timeRemainingHTML = this._root.querySelector('#time-remaining-container');
        const localStatsHTML = this._root.querySelector('#local-stats');
        const opponentStatsHTML = this._root.querySelector('#opponent-stats');
        const cursorChar = this._root.querySelector('#cursor-char') as HTMLElement;
        const typed = this._root.querySelector('#typed');
        const untyped = this._root.querySelector('#untyped');

        if (!typed || !untyped || !localStatsHTML || !opponentStatsHTML || !timeRemainingHTML) return;

        typed.textContent = this._passage.slice(0, localStats.cursorIndex);
        cursorChar.textContent = this._passage[localStats.cursorIndex] ?? '';
        if (localStats.hasError) {
            cursorChar.classList.remove('has-error');
            void cursorChar.offsetWidth;
            cursorChar.classList.add('has-error');
        } else {
            cursorChar.classList.remove('has-error');
        }
        untyped.textContent = this._passage.slice(localStats.cursorIndex + 1);
        localStatsHTML.innerHTML = `WPM: ${Math.round(localStats.currentWpm)} | Errors: ${localStats.errors}`;
        opponentStatsHTML.innerHTML = `Opponent WPM: ${Math.round(opponentStats.currentWpm)} | Progress: ${opponentStats.cursorIndex} chars`;
        if (timeRemaining > 0) {
            timeRemainingHTML.innerHTML = `${Math.round(timeRemaining)} seconds left`;
        } else {
            timeRemainingHTML.innerHTML = `Match over!`;
        }
    }

    renderHome(showHistory: boolean = false) {
        this._root.innerHTML = `
            <div class="screen home-screen">
                <h1 class="logo">TypeDuel ⌨</h1>
                <div class="form-group">
                    <label class="label">your name</label>
                    <input id="player-name" type="text" placeholder="Enter your name" class="input-field" />
                </div>
                <div class="btn-row">
                    <button id="single-player" class="btn btn-primary">Single Player</button>
                    <button id="create-match" class="btn btn-ghost">Create Room</button>
                </div>
                <hr class="divider" />
                <div class="form-group">
                    <label class="label">room code</label>
                    <input id="room-code" type="text" placeholder="Enter room code" class="input-field" />
                </div>
                <button id="join-match" class="btn btn-ghost">Join Room</button>
                ${showHistory ? '<button id="view-history" class="btn btn-link">View History</button>' : ''}
            </div>
        `
    }

    renderDifficulty() {
        this._root.innerHTML = `
            <div class="screen difficulty-screen">
                <h1>TypeDuel</h1>
                <h3>Choose Difficulty</h3>
                <button id="easy" class="btn btn-ghost">Easy (30 WPM)</button>
                <button id="medium" class="btn btn-primary">Medium (60 WPM)</button>
                <button id="hard" class="btn btn-danger">Hard (100 WPM)</button>
            </div>
        `;
    }

    renderLobby(roomCode: string) {
        this._root.innerHTML = `
            <div class="screen lobby-screen">
                <h1>TypeDuel</h1>
                <h5>Lobby</h5>
                <div class="room-code">Your room code: <strong>${roomCode}</strong></div>
                <span>Send this to the other player!</span>
                <div id="lobby-updates" class="lobby-updates"></div>
            </div>
        `
    }

    renderOpponentJoined(opponentName: string) {
        const updates = this._root.querySelector('#lobby-updates');
        if (updates) updates.innerHTML = `
            <div>
                <h5>Your opponent has joined! Name: ${opponentName}</h5>
                <button id="start-match" class="btn btn-primary">Start match</button>
            </div>
        `
    }

    renderCountdown(n: number) {
        this._root.innerHTML = `
            <div class="screen countdown-screen">
                <p>Starting in</p>
                <span class="countdown-number">${n === 0 ? 'Go!' : n}</span>
            </div>
        `
    }

    renderMatch(passage: string) {
        this._passage = passage;
        this._root.innerHTML = `
            <div id="match-container">
                <div class="stats-row">
                    <h4>Stats</h4>
                    <div id="local-stats" class="stat-card">Your stats</div>
                    <div id="opponent-stats" class="stat-card">Opponent stats</div>
                </div>
                <div id="time-remaining-container"></div>
                <div id="passage"><span id="typed"></span><span id="cursor-char"></span><span id="untyped">${passage}</span></div>
            </div>
        `;
    }
    renderLoading() {
        this._root.innerHTML = `
            <div class="screen countdown-screen">
                <p>Fetching passage...</p>
                <div class="spinner"></div>
            </div>
        `;
    }
}


export default GameView;