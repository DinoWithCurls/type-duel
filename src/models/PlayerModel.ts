/** Tracks player identity and cumulative stats across multiple matches. */
class PlayerModel {
    private _id: string;
    private _name: string;
    private _averageWpm: number = 0;
    private _matchCount: number = 0;
    private _totalWpm: number = 0;
    
    constructor(name: string) {
        this._id = crypto.randomUUID();
        this._name = name;
    }
    get player() {
        return {
            id: this._id,
            name: this._name,
            averageWpm: this._averageWpm,
            matchCount: this._matchCount,
            totalWpm: this._totalWpm
        }
    }

    /** Called at end of each match to update running average WPM. */
    updateStats(currentWpm: number) {
        this._matchCount += 1;
        this._totalWpm += currentWpm;
        this._averageWpm = this._totalWpm / this._matchCount;
    }
    
}

export default PlayerModel;