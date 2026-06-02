import GameModel from "../models/GameModel";
import GameView from "../views/GameView";
import ResultsView from "../views/ResultsView";
import { type OpponentUpdate } from "../models/MatchModel";
import { passages } from "../data/passages";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ignoredKeyboardKeys = ['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape'];

class GameController {
    private _model: GameModel;
    private _view: GameView;
    private _resultsView: ResultsView;
    private _localPlayer: string | null = null;
    constructor(model: GameModel, view: GameView, resultsView: ResultsView) {
        this._model = model;
        this._view = view;
        this._resultsView = resultsView;
    }

    init() {
        this._view.renderHome();
        this._view.onCreateMatch((name) => {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            this.addPlayer(name);
            this.createMatch();
            this._view.renderLobby(roomCode);
        });
        this._view.onViewHistory(() => {
            const results = this._model.getResults();
            this._resultsView.renderHistory(results.matchHistory);
        });
    }

    handleOpponentJoined(opponentName: string) {
        this._model.addPlayer(opponentName);
        this._view.renderOpponentJoined(opponentName);
        this._view.onStartMatch(() => {
            this.startCountdown();
        })
    }

    createMatch() {
        this._model.createMatch();
    }

    addPlayer(name: string) {
        this._localPlayer = this._model.addPlayer(name);   
    }

    async fetchPassage(retries: number = 3) {
        try {
            if(retries === 0) {
                throw new Error('max retries reached, falling back to local passages');
            }
            let response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
            if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const finResponse = await response.json();
            if (finResponse.extract.length < 100 || finResponse.extract.length > 500) {
                await this.fetchPassage(retries - 1);
            }
            else {
                this._model.setMatchPassage(finResponse.pageid.toString(), finResponse.extract)
            }
        } catch (err) {
            console.error(err);
            let randomIdx = Math.floor(Math.random() * passages.length);
            let passage = passages[randomIdx];
            this._model.setMatchPassage(passage.id, passage.text);
        }
    }

    async startCountdown() { 
        // update countdown
        this._model.updatePhase('countdown');
        // fetch passages
        await this.fetchPassage();
        for(let i = 3; i >= 0; i --) {
            this._view.renderCountdown(i);
            await sleep(1000);
        }
        this._model.startMatch();
        const passage = this._model.getPassage();
        this._view.renderMatch(passage);
        this._view.onKeystroke(e => this.handleKeystroke(e));
    }

    endMatch() { 
        this._model.endMatch();
        const results = this._model.getResults();
        this._resultsView.renderResults(results.playerStats, results.matchHistory);
        this._resultsView.onRematch(() => {
            this.createMatch();
            this.startCountdown();
        });
        this._resultsView.onViewHistory(() => {
            this._resultsView.renderHistory(results.matchHistory);
            this._resultsView.onBackToResults(() => {
                this._resultsView.renderResults(results.playerStats, results.matchHistory);
            });
        })
    }

    handleKeystroke(key: KeyboardEvent) { 
        if (!this._localPlayer) return;
        const passage = this._model.getPassage();
        const pressed = key.key;
        let currentPlayer = this._model.getPlayerStats(this._localPlayer);
        if (ignoredKeyboardKeys.includes(pressed)) return;
        let newKeyCount = currentPlayer.totalKeystrokes;
        let currCursorIdx = currentPlayer.cursorIndex;
        let currErrorCount = currentPlayer.errors
        if(pressed == 'Backspace') {
            currCursorIdx--;
        } else if (passage[currCursorIdx] == pressed) {
            currCursorIdx++;
        } else {
            currErrorCount++;
        }
        const elapsed = this._model.getElapsedTime();
        const currWpm = elapsed > 0 ? (currCursorIdx / 5) / (elapsed / 60) : 0;
        newKeyCount++;
        this._model.updatePlayerStats(this._localPlayer, Math.max(0, currCursorIdx), newKeyCount, currErrorCount, currWpm);
        if (currCursorIdx == passage.length) {
            this.endMatch();
            return;
        };
        // TODO: Handle single player mode - ghost opponent
        const opponentId = this._model.getOpponentId(this._localPlayer);
        if (!opponentId) return;
        const opponentStats = this._model.getPlayerStats(opponentId);

        this._view.updateMatch(
            this._model.getPlayerStats(this._localPlayer), 
            opponentStats,
            this._model.getTimeRemaining()
        )
    }

    handleOpponentUpdate(data: OpponentUpdate) {
        const opponentPlayerId = this._model.getOpponentId(this._localPlayer);
        if(!opponentPlayerId) return;
        this._model.updatePlayerStats(opponentPlayerId, data.cursorIndex, data.totalKeystrokes, data.errors, data.currentWpm)
    }

    getResults() {
        return this._model.getResults();
    }

}


export default GameController;