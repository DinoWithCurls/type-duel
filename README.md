# TypeDuel ⌨️
 
A real-time competitive typing game. Two players race to type a passage with live WPM, accuracy tracking, and progress bars.
 
**Stack:** Vanilla TypeScript + HTML + CSS — strict MVC pattern  
**Build tool:** Vite  
**No frameworks, no AI layer**
 
---
 
## Features
 
- Live WPM & accuracy tracking
- Dual progress bar racing UI
- Difficulty levels (prose, code)
- Personal best leaderboard (localStorage)
- Rematch flow
---
 
## Getting Started
 
```bash
npm install
npm run dev
```
 
---
 
## Project Structure
 
```
typeduel/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.ts
│   ├── models/
│   │   ├── PlayerModel.ts
│   │   ├── MatchModel.ts
│   │   └── GameModel.ts
│   ├── views/
│   │   ├── GameView.ts
│   │   └── ResultsView.ts
│   ├── controllers/
│   │   └── GameController.ts
│   ├── data/
│   │   └── passages.ts
│   └── styles/
│       ├── main.css
│       ├── game.css
│       └── results.css
```
 
---
 
## Architecture
 
### MVC Breakdown
 
| Layer | File | Responsibility |
|-------|------|----------------|
| Model | `PlayerModel.ts` | Player identity, average WPM across matches |
| Model | `MatchModel.ts` | Single match instance — passage, player stats, timer |
| Model | `GameModel.ts` | App-level state — phase, players, current match, history |
| View | `GameView.ts` | Typing UI, progress bars, countdown |
| View | `ResultsView.ts` | Post-game screen, match history |
| Controller | `GameController.ts` | Wires models ↔ views, handles input, determines winner |
 
### Game Phases
 
`idle` → `countdown` → `playing` → `results`
 
### Winner Criteria
 
1. Most input completed
2. Least errors
3. Highest WPM (tiebreaker)
---
 
## Key Design Decisions
 
- **No frameworks** — vanilla TS to demonstrate MVC and DOM mastery
- **Vite** for build tooling — ES modules, hot reload, zero config
- **MatchModel** is a separate entity from GameModel — a game can have multiple matches
- **PlayerModel** holds persistent stats (averageWPM) across matches; per-match stats live in MatchModel
- **WPM** is computed on the fly during a match, stored as `finalWpm` when match ends
- **Corrected errors not tracked** — backspace penalty is already reflected in WPM naturally
- **Passage fetched at match start** — `passageId` stored for reference, `passageText` stored locally after fetch
- **README doubles as progress tracker**
---
 
## Progress
 
### ✅ Done
- [x] Project scaffolded (Vite + vanilla-ts template)
- [x] Folder structure set up
- [x] `passages.ts` — passage data with difficulty types (fallback)
- [x] `PlayerModel.ts` — id, name, averageWpm, updateStats()
- [x] `MatchModel.ts` — matchId, passage, player stats map, timer, elapsedTime
- [x] `GameModel.ts` — phases, players, match lifecycle, getResults()
- [x] `GameController.ts` — match flow, keystroke handling, passage fetch, opponent updates
- [x] `GameView.ts` — home, lobby, countdown, match screens, keystroke listener
- [x] `ResultsView.ts` — results screen, history, rematch, back navigation
### ✅ Done (continued)
- [x] `main.ts` — bootstraps app, wires Model, View, Controller together
- [x] Bug fixes — button handlers, timer, typed/untyped split, cursor visibility, keystroke accumulation
- [x] `server/src/types.ts` — WebSocket message types, client/server message unions
- [x] `server/src/RoomManager.ts` — room creation, joining, lookup, removal, find by player
- [x] `server/src/passages.ts` — fallback passages for server
- [x] `server/src/index.ts` — WebSocket server, room management, passage fetch, disconnect handling
### ✅ Done (continued)
- [x] WebSocket client integration in `GameController.ts`
- [x] Join room UI flow in `GameView.ts`
- [x] Rematch flow — server coordinated, both players must agree
- [x] Opponent stats forwarded via server on match finish
- [x] `showResults` extracted — fixes Go back + View History re-registration bug
- [x] `isMatchActive` guard — prevents double `endMatch` calls
- [x] Player order fix in results — local player always shown first
- [x] Shared `types.ts` in `shared/` folder — used by both client and server
### 📋 Pending
- [ ] Remove `player_update` / `opponent_update` real-time stat syncing (deferred)
- [ ] Styles
- [ ] localStorage integration (leaderboard)
- [ ] Single player mode (ghost opponent)
- [ ] Comments and code documentation
- [ ] End-to-end testing
- [ ] Go back from history to home screen (deferred)
---
 
## TODOs
 
- [ ] Replace stubbed room code generation in `GameController.init()` with WebSocket server response
- [ ] Implement WebSocket client in `GameController` — connect, send keystroke updates, receive opponent updates
- [ ] Build WebSocket server (`server/` folder) — room management, progress broadcast, finish detection
- [ ] Add single player mode with ghost opponent
- [ ] Add localStorage leaderboard
## Temp Code (remove before production)
 
- [ ] `main.ts` — `(window as any).controller = gameController` — exposes controller globally for console testing
- [ ] `GameController.init()` — stubbed room code generation via `Math.random()` — replace with WebSocket server response
- [ ] `GameController.handleKeystroke()` — opponent fallback uses local player stats when no opponent exists — remove when WebSocket is integrated