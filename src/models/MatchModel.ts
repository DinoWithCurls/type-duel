type MatchPlayer = {
    playerId: string;
    input: string;
    errorCount: number;
    currentWpm: number;
    finalWpm: number;
}

type MatchStatus = 'waiting' | 'ongoing' | 'finished';

class MatchModel {
    private _matchId: string;
    private _passageId: string = '';
    private _passage: string = '';
    private _duration: number;
    private _status: MatchStatus;
    private _players: Map<string, MatchPlayer>;
    private _startTime: number | null = null;

    constructor(duration: number) {
        this._matchId = crypto.randomUUID();
        this._duration = duration;
        this._players = new Map<string, MatchPlayer>();
        this._status = 'waiting';
    }

    timeRemaining() {
        if (!this._startTime) return this._duration;
        let elapsed = (Date.now() - this._startTime) / 1000
        return this._duration - elapsed;
    }

    startMatch() {
        this._startTime = Date.now();
        this._status = 'ongoing';
    }

    setPassage(id: string, text: string) {
        this._passageId = id;
        this._passage = text;
    }

    addPlayer(player: MatchPlayer) { 
        this._players.set(player.playerId, player);
    }

    updatePlayerStats(playerId: string, input: string, errorCount: number, currentWpm: number) {
        const player = this._players.get(playerId);
        if (player) {
            player.input = input;
            player.errorCount = errorCount;
            player.currentWpm = currentWpm;
        }
    };


}

export default MatchModel;