import PlayerModel from "./PlayerModel";
import MatchModel from "./MatchModel";
type GamePhase = 'idle' | 'countdown' | 'playing' | 'results';

export type MatchHistory = {
    matchId: string;
    players: {
        name: string;
        finalWpm: number;
        errorCount: number;
        cursorIndex: number;
    }[];
}

export type PlayerResult = {
    id: string;
    name: string;
    finalWpm: number;
    errorCount: number;
    cursorIndex: number;
    totalKeystrokes: number;
}
/** Top-level state manager — owns players, current match, match history, and game phase. */
class GameModel {
    private _phase: GamePhase;
    private _players: PlayerModel[];
    private _currentMatch: MatchModel | null;
    private _matchHistory: MatchModel[];

    constructor() {
        this._phase = 'idle';
        this._players = [];
        this._currentMatch = null;
        this._matchHistory = [];
    }

    getPhase() {
        return this._phase;
    }

    /** Creates a PlayerModel and adds it to the current match if one is active. */
    addPlayer(name: string) {
        let player = new PlayerModel(name);
        this._players.push(player);
        if (this._currentMatch) {
            this._currentMatch.addPlayer({
                playerId: player.player.id,
                cursorIndex: 0,
                totalKeystrokes: 0,
                errors: 0,
                currentWpm: 0,
                finalWpm: 0,
                hasError: false
            });
        }
        return player.player.id;
    }

    startMatch() {
        this.updatePhase('playing');
        this._currentMatch?.startMatch();
    }

    /** Finalizes player stats, pushes match to history, and clears current match. */
    endMatch() {
        this._phase = 'results';
        this._players.forEach(player => {
            const matchPlayer = this._currentMatch!.getPlayer(player.player.id);
            if (matchPlayer) {
                this._currentMatch!.finalizePlayer(player.player.id, matchPlayer.currentWpm);
                player.updateStats(matchPlayer.currentWpm);
            }
        });
        this._matchHistory.push(this._currentMatch!);
        this._currentMatch = null;
    }

    /** Instantiates a new MatchModel and adds all current players to it. */
    createMatch() {
        this._currentMatch = new MatchModel();
        this._phase = 'countdown';
        this._players.forEach(player => {
            this._currentMatch!.addPlayer({
                playerId: player.player.id,
                cursorIndex: 0,
                totalKeystrokes: 0,
                errors: 0,
                currentWpm: 0,
                finalWpm: 0,
                hasError: false
            })
        })
    }

    setMatchPassage(id: string, text: string) {
        this._currentMatch?.setPassage(id, text);
    }

    getPassage() {
        return this._currentMatch?.getPassage();
    }

    getPlayerStats(playerId: string | null) {
        return this._currentMatch?.getPlayer(playerId);
    }

    updatePlayerStats(playerId: string | null, idx: number, keyStrokes: number, errorCount: number, currentWpm: number, hasError: boolean) {
        this._currentMatch?.updatePlayerStats(playerId, idx, keyStrokes, errorCount, currentWpm, hasError);
    }

    updatePhase(phase: GamePhase) {
        this._phase = phase;
    }

    /** Returns player stats and match history in a clean shape for the view. */
    getResults() {
        if (this._matchHistory.length === 0) return { playerStats: [], matchHistory: []};
        const lastMatch = this._matchHistory[this._matchHistory.length - 1];
        const playerStats = this._players.map(player => {
            const matchPlayer = lastMatch.getPlayer(player.player.id);
            return {
                id: player.player.id,
                name: player.player.name,
                finalWpm: matchPlayer?.finalWpm ?? 0,
                errorCount: matchPlayer?.errors ?? 0,
                cursorIndex: matchPlayer?.cursorIndex ?? 0,
                totalKeystrokes: matchPlayer?.totalKeystrokes ?? 0
            }
        });
        return {
            playerStats,
            matchHistory: this._matchHistory.map(match => ({
                matchId: match.matchId,
                players: Array.from(match.players.values()).map(player => {
                    return ({
                        name: this._players.find(p => p.player.id === player.playerId)?.player.name ?? 'Unknown',
                        finalWpm: player.finalWpm,
                        errorCount: player.errors,
                        cursorIndex: player.cursorIndex
                    })
                })
            }))
        }
    }

    /** Guard used to prevent double endMatch calls. */
    isMatchActive() {
        return this._currentMatch !== null;
    }

    getElapsedTime() {
        return this._currentMatch?.getElapsedTime() ?? 0;
    }

    getTimeRemaining() {
        return this._currentMatch?.timeRemaining();
    }

    getOpponentId(localPlayerId: string | null) {
        return this._players.find(p => p.player.id != localPlayerId)?.player.id ?? null;
    }
}

export default GameModel;