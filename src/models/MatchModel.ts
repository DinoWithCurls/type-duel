export type MatchPlayer = {
    playerId: string;
    cursorIndex: number;
    totalKeystrokes: number;
    errors: number;
    currentWpm: number;
    finalWpm: number;
    hasError: boolean;
}

export type OpponentUpdate = {
    cursorIndex: number;
    totalKeystrokes: number;
    currentWpm: number;
    errors: number;
    
}

type MatchStatus = 'waiting' | 'ongoing' | 'finished';

/** Represents a single match instance — owns passage text, per-player stats, and the timer. */
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

    /** Calculates seconds left based on elapsed time since match start. */
    timeRemaining() {
        if (!this._startTime) return this._duration;
        let elapsed = (Date.now() - this._startTime) / 1000
        return Math.max(0, this._duration - elapsed);
    }

    /** Sets start time and transitions match status to ongoing. */
    startMatch() {
        this._startTime = Date.now();
        this._status = 'ongoing';
    }
    getPassageId() {
        return this._passageId;
    }

    getStatus() {
        return this._status;
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

    /** Called on every keystroke to update cursor position, keystrokes, errors, and WPM. */
    updatePlayerStats(playerId: string | null, idx: number, keyStrokes: number, errorCount: number, currentWpm: number, hasError: boolean) {
        if (playerId === null) return;
        const player = this._players.get(playerId);
        if (player) {
            player.cursorIndex = idx;
            player.totalKeystrokes = keyStrokes;
            player.errors = errorCount;
            player.currentWpm = currentWpm;
            player.hasError = hasError;
        }
    };
    getPlayer(playerId: string | null) {
        if (playerId === null) return undefined;
        return this._players.get(playerId);
    }
    /** Locks in final WPM at match end. */
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

    /** Returns seconds elapsed since match started. */
    getElapsedTime() {
        if (!this._startTime) return 0;
        return (Date.now() - this._startTime) / 1000;
    }
}

export default MatchModel;