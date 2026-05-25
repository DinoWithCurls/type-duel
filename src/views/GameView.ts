import { type MatchPlayer } from "../models/MatchModel";
class GameView {
    private _root: HTMLElement;
    
    constructor(root: HTMLElement) {
        this._root = root;
    }

    renderHome() {
        
    }
    renderLobby(roomCode: string) {}
    renderOpponentJoined(opponentName: string) {}
    renderCountdown(n: number) {}
    renderMatch(passage: string, localStats: MatchPlayer, opponentStats: MatchPlayer) {}
    renderTransition() {}
}


export default GameView;