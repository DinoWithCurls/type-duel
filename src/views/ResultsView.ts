import { type MatchHistory, type PlayerResult } from "../models/GameModel";

/** Handles post-match and history screens. */
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

    /** Determines winner using priority criteria (cursorIndex → errors → WPM), calculates accuracy. */
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
            <div id="match-result" class="screen results-screen">
                <h1 class="winner-badge">${isTie ? "It's a tie!!" : winningPlayer.name + " won!"}</h1>
                <h3>Stats</h3>
                <div class="result-row ${!isTie && winningPlayer.id === player1.id ? 'winner' : ''}">
                    ${player1.name} · ${Math.round(player1.finalWpm)} WPM · ${player1.errorCount} errors · ${getAccuracy(player1)}% accuracy
                </div>
                <div class="result-row ${!isTie && winningPlayer.id === player2.id ? 'winner' : ''}">
                    ${player2.name} · ${Math.round(player2.finalWpm)} WPM · ${player2.errorCount} errors · ${getAccuracy(player2)}% accuracy
                </div>
                <button id="rematch-button" class="btn btn-primary">Rematch</button>
                <button id="view-history-button" class="btn btn-ghost">View History</button>
            </div>
        `;
    }

    /** Renders past matches in a table; handles empty state. */
    renderHistory(matchHistory: MatchHistory[]) {
        if(matchHistory.length === 0) {
            this._root.innerHTML = 
            `<div>No games played yet!</div>`
        } else {
            const rows = matchHistory.map(match => `
                <tr>
                    <td>${match.matchId}</td>
                    <td>${match.players.map(p => `${p.name}: ${Math.round(p.finalWpm)} WPM`).join(' vs ')}</td>
                </tr>
            `).join('');
        
            this._root.innerHTML = `
                <div class="screen history-screen">
                    <button id="return-button" class="btn btn-link">Go back</button>
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