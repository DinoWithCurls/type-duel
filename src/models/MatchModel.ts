export type MatchPlayer = {
    playerId: string;
    cursorIndex: number;
    totalKeystrokes: number;
    errors: number;
    currentWpm: number;
    finalWpm: number;
}

export type OpponentUpdate = {
    cursorIndex: number;
    totalKeystrokes: number;
    currentWpm: number;
    errors: number;
    
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

    constructor(duration: number = 120) {
        this._matchId = crypto.randomUUID();
        this._duration = duration;
        this._players = new Map<string, MatchPlayer>();
        this._status = 'waiting';
    }

    timeRemaining() {
        if (!this._startTime) return this._duration;
        let elapsed = (Date.now() - this._startTime) / 1000
        return Math.max(0, this._duration - elapsed);
    }

    startMatch() {
        this._startTime = Date.now();
        this._status = 'ongoing';
    }

    setPassage(id: string, text: string) {
        this._passageId = id;
        this._passage = text;
    }

    getPassage() {
        return this._passage;
    }

    addPlayer(player: MatchPlayer) { 
        this._players.set(player.playerId, player);
    }

    updatePlayerStats(playerId: string, idx: number, keyStrokes: number, errorCount: number, currentWpm: number) {
        const player = this._players.get(playerId);
        if (player) {
            player.cursorIndex = idx;
            player.totalKeystrokes = keyStrokes;
            player.errors = errorCount;
            player.currentWpm = currentWpm;
        }
    };
    getPlayer(playerId: string) {
        return this._players.get(playerId);
    }
    finalizePlayer(playerId: string, finalWpm: number) {
        const player = this._players.get(playerId);
        if (player) player.finalWpm = finalWpm;
    }

    get matchId() {
        return this._matchId;
    }

    get players() {
        return this._players;
    }

    getElapsedTime() {
        if (!this._startTime) return 0;
        return (Date.now() - this._startTime) / 1000;
    }
}

export default MatchModel;