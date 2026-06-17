import GameModel, { type MatchHistory, type PlayerResult } from "../models/GameModel";
import GameView from "../views/GameView";
import ResultsView from "../views/ResultsView";
import { MessageType } from '@shared/types';



const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ignoredKeyboardKeys = ['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape'];

class GameController {
    private _model: GameModel;
    private _view: GameView;
    private _resultsView: ResultsView;
    private _localPlayer: string | null = null;
    private _timerInterval: ReturnType<typeof setInterval> | null = null;
    private _socket: WebSocket | null = null;
    private _roomCode: string | null = null;

    constructor(model: GameModel, view: GameView, resultsView: ResultsView) {
        this._model = model;
        this._view = view;
        this._resultsView = resultsView;
    }

    private showResults(playerStats: PlayerResult[], matchHistory: MatchHistory[]) {
        this._resultsView.renderResults(playerStats);
        this._resultsView.onRematch(() => {
            this._socket?.send(JSON.stringify({
                type: MessageType.REMATCH,
                roomCode: this._roomCode
            }))
        });
        this._resultsView.onViewHistory(() => {
            this._resultsView.renderHistory(matchHistory);
            this._resultsView.onBackToResults(() => {
                this.showResults(playerStats, matchHistory);
            });
        });
    }

    init() {
        this._socket = new WebSocket('ws://localhost:8080');
        this._socket.onopen = () => console.log('WebSocket connected');
        this._socket.onerror = (e) => console.error('websocket error: ', e);
        this._socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case MessageType.ROOM_CREATED:
                    this._roomCode = message.roomCode;
                    this._view.renderLobby(message.roomCode);
                    break;
                case MessageType.OPPONENT_JOINED:
                    this.handleOpponentJoined(message.opponentName);
                    break;
                case MessageType.MATCH_STARTED:
                    this._model.setMatchPassage('', message.passage);
                    this.startCountdown();
                    break;
                case MessageType.OPPONENT_FINISHED:
                    const opponentId = this._model.getOpponentId(this._localPlayer);
                    if (opponentId) {
                        this._model.updatePlayerStats(
                            opponentId,
                            message.cursorIndex,
                            message.totalKeystrokes,
                            message.errors,
                            message.finalWpm
                        )
                    }
                    this.endMatch();
                    break;
                case MessageType.REMATCH_START:
                    this.createMatch();
                    this._model.setMatchPassage('', message.passage);
                    this.startCountdown();
                    break;
            }
        }
        this._view.renderHome();
        this._view.onCreateMatch((name) => {
            this.addPlayer(name);
            this.createMatch();
            this._socket?.send(JSON.stringify({
                type: MessageType.CREATE_ROOM,
                playerName: name
            }));
        });

        this._view.onJoinMatch((name, roomCode) => {
            this.createMatch();
            this.addPlayer(name);
            this._roomCode = roomCode;
            this._view.renderLobby(roomCode);
            this._socket?.send(JSON.stringify({
                type: MessageType.JOIN_ROOM,
                roomCode,
                playerName: name
            }))
        })

        this._view.onViewHistory(() => {
            const results = this._model.getResults();
            this._resultsView.renderHistory(results.matchHistory);
        });
    }

    handleOpponentJoined(opponentName: string) {
        this._model.addPlayer(opponentName);
        this._view.renderOpponentJoined(opponentName);
        this._view.onStartMatch(() => {
            this._socket?.send(JSON.stringify({
                type: MessageType.START_MATCH,
                roomCode: this._roomCode
            }))
        })
    }

    createMatch() {
        this._model.createMatch();
    }

    addPlayer(name: string) {
        this._localPlayer = this._model.addPlayer(name);
    }


    async startCountdown() {
        this._model.updatePhase('countdown');
        for (let i = 3; i >= 0; i--) {
            this._view.renderCountdown(i);
            await sleep(1000);
        }
        this._model.startMatch();
        const passage = this._model.getPassage();
        this._view.renderMatch(passage);
        this._view.onKeystroke(e => this.handleKeystroke(e));

        this._timerInterval = setInterval(() => {
            const timeRemaining = this._model.getTimeRemaining();
            if (timeRemaining <= 0) {
                clearInterval(this._timerInterval);
                this.endMatch();
                return;
            }
            const localStats = this._model.getPlayerStats(this._localPlayer);
            const opponentId = this._model.getOpponentId(this._localPlayer);
            const opponentStats = opponentId
                ? this._model.getPlayerStats(opponentId)
                : { playerId: '', cursorIndex: 0, totalKeystrokes: 0, errors: 0, currentWpm: 0, finalWpm: 0 };
            if (localStats) this._view.updateMatch(localStats, opponentStats, timeRemaining);
        }, 1000);
    }


    endMatch() {
        if (!this._model.isMatchActive()) return;
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
        const localStats = this._model.getPlayerStats(this._localPlayer);
        this._model.endMatch();
        this._socket?.send(JSON.stringify({
            type: MessageType.MATCH_FINISHED,
            roomCode: this._roomCode,
            finalWpm: localStats.currentWpm ?? 0, 
            cursorIndex: localStats.cursorIndex ?? 0,
            errors: localStats.errors ?? 0,
            totalKeystrokes: localStats.totalKeystrokes ?? 0
        }))
        const results = this._model.getResults();
        this.showResults(results.playerStats, results.matchHistory);
    }

    handleKeystroke(key: KeyboardEvent) {
        if (!this._localPlayer) return
        const passage = this._model.getPassage();
        const pressed = key.key;
        let currentPlayer = this._model.getPlayerStats(this._localPlayer);
        if (ignoredKeyboardKeys.includes(pressed)) return;
        let newKeyCount = currentPlayer.totalKeystrokes;
        let currCursorIdx = currentPlayer.cursorIndex;
        let currErrorCount = currentPlayer.errors
        if (pressed == 'Backspace') {
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
        let opponentStats;
        const opponentId = this._model.getOpponentId(this._localPlayer);
        if (opponentId) {
            opponentStats = opponentStats = this._model.getPlayerStats(opponentId);
        } else {
            opponentStats = { playerId: '', cursorIndex: 0, totalKeystrokes: 0, errors: 0, currentWpm: 0, finalWpm: 0 };
        }
        this._view.updateMatch(
            this._model.getPlayerStats(this._localPlayer),
            opponentStats,
            this._model.getTimeRemaining()
        )
    }

    getResults() {
        return this._model.getResults();
    }
}


export default GameController;