import { type MatchHistory, type PlayerResult } from "../models/GameModel";

class ResultsView {
    private _root: HTMLElement | null = null;

    constructor(root: HTMLElement) {
        this._root = root;
    }

    onRematch(callback: () => void) {
        const btn = this._root?.querySelector('#rematch-button') as HTMLButtonElement;
        if (btn) {
            btn.onclick = () => callback();
        }
    }

    onViewHistory(callback: () => void) {
        const btn = this._root?.querySelector('#view-history-button') as HTMLButtonElement;
        if (btn) {
            btn.onclick = () => callback();
        }
    }

    onBackToResults(callback: () => void) {
        const btn = this._root?.querySelector('#return-button') as HTMLButtonElement;
        if (btn) {
            btn.onclick = () => callback();
        }
    }

    renderResults(playerStats: PlayerResult[]) {
        const [player1, player2] = playerStats;
        
        const isTie = player1.cursorIndex === player2.cursorIndex && 
               player1.errorCount === player2.errorCount && 
               player1.finalWpm === player2.finalWpm;

        function comparePlayers(p1: PlayerResult, p2: PlayerResult): PlayerResult {
            if (p1.cursorIndex !== p2.cursorIndex) return p1.cursorIndex > p2.cursorIndex ? p1 : p2;
            if (p1.errorCount !== p2.errorCount) return p1.errorCount < p2.errorCount ? p1 : p2;
            return p1.finalWpm >= p2.finalWpm ? p1 : p2;
        }

        const getAccuracy = (p: PlayerResult) => p.totalKeystrokes > 0 ? Math.round(((p.totalKeystrokes - p.errorCount) / p.totalKeystrokes) * 100) : 0;

        const winningPlayer = comparePlayers(player1, player2)

        this._root.innerHTML = `
            <div id="match-result">
                <h1>${isTie ? "It's a tie!!" : winningPlayer.name + " won!"}</h1>
                <h3>Stats</h3>
                <div>
                    ${player1.name} --  ${Math.round(player1.finalWpm)} WPM, ${player1.errorCount} errors, Accuracy: ${getAccuracy(player1)}
                </div>
                <div>
                    ${player2.name} -- ${Math.round(player2.finalWpm)} WPM, ${player2.errorCount} errors, Accuracy: ${getAccuracy(player2)}
                </div>
            </div>
            <div>
                <button id="rematch-button">Want a rematch?</button>
                <button id="view-history-button">View History</button>
            </div>
        `;
    }

    renderHistory(matchHistory: MatchHistory[]) {
        if(matchHistory.length == 0) {
            this._root.innerHTML = 
            `<div>No games played yet!</div>`
        } else {
            const rows = matchHistory.map(match => `
                <tr>
                    <td>${match.matchId}</td>
                    <td>${match.players.map(p => `${p.name}: ${p.finalWpm} WPM`).join(' vs ')}</td>
                </tr>
            `).join('');
        
            this._root.innerHTML = `
                <div>
                    <button id="return-button">Go back</button>
                    <h1>History</h1>
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Players</th>
                        </tr>
                        ${rows}
                    </table>
                </div>
            `;
        }   
    }
}

export default ResultsView;