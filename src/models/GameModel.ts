import PlayerModel from "./PlayerModel";
import MatchModel from "./MatchModel";
type GamePhase = 'lobby' | 'matchmaking' | 'in-game' | 'post-game';

class GameModel {
    private _phase: GamePhase;
    private _players: PlayerModel[];
    private _currentMatch: MatchModel | null;
    private _matchHistory: MatchModel[];

    constructor() {
        this._phase = 'lobby';
        this._players = [];
        this._currentMatch = null;
        this._matchHistory = [];
    }

    addPlayer(name: string) {
        let player = new PlayerModel(name);
        this._players.push(player);
    }
    endMatch() {
        this._phase = 'post-game';
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

    createMatch(duration: number) {
        this._currentMatch = new MatchModel(duration);
        this._phase = 'matchmaking';
        this._players.forEach(player => {
            this._currentMatch!.addPlayer({
                playerId: player.player.id,
                input: '',
                errorCount: 0,
                currentWpm: 0,
                finalWpm: 0
            })
        })
    }

    updatePhase(phase: GamePhase) {
        this._phase = phase;
    }

    getResults() {
        const lastMatch = this._matchHistory[this._matchHistory.length - 1];
        const playerStats = this._players.map(player => {
            const matchPlayer = lastMatch.getPlayer(player.player.id);
            return {
                id: player.player.id,
                name: player.player.name,
                finalWpm: matchPlayer?.finalWpm ?? 0,
                errorCount: matchPlayer?.errorCount ?? 0,
                input: matchPlayer?.input ?? ''
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
                        errorCount: player.errorCount,
                        input: player.input
                    })
                })
            }))
        }
    }
}

export default GameModel;