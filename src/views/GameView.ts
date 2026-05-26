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
        const btn = this._root.querySelector('#create-match');
        const input = this._root.querySelector('#player-name') as HTMLInputElement;
        if(!input.value.trim()) return;
        btn?.addEventListener('click', () => {
            callback(input.value);
        })
    }

    onStartMatch(callback: () => void) {
        const btn = this._root.querySelector('#start-match');
        btn?.addEventListener('click', () => {
            callback();
        })
    }

    onViewHistory(callback: () => void) {

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
        if(updates) updates.innerHTML = `
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
    
    renderMatch(passage: string, localStats: MatchPlayer, opponentStats: MatchPlayer) {
        
    }
    
    renderTransition() {}
}


export default GameView;