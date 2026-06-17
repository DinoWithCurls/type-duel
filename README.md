# TypeDuel ⌨️
 
A real-time competitive typing game. Two players race to type a passage with live WPM, accuracy tracking, and progress bars.
 
**Stack:** Vanilla TypeScript + HTML + CSS — strict MVC pattern  
**Build tool:** Vite  
**No frameworks, no AI layer**
 
---
 
## Features
 
- Live WPM & accuracy tracking
- Single player mode with ghost opponent (Easy/Medium/Hard)
- Multiplayer via WebSockets — create or join a room
- Rematch flow
- Match history
---
 
## Getting Started
 
```bash
# Start the client
npm install
npm run dev
 
# Start the server
cd server
npx tsx src/index.ts
```
 
---
 
## Project Structure
 
```
typeduel/
├── index.html
├── package.json
├── vite.config.ts
├── shared/
│   └── types.ts          # Shared WebSocket message types
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
└── server/
    └── src/
        ├── index.ts
        ├── RoomManager.ts
        ├── passages.ts
        └── types.ts
```
 
---
 
## Architecture
 
### MVC Breakdown
 
| Layer | File | Responsibility |
|-------|------|----------------|
| Model | `PlayerModel.ts` | Player identity, average WPM across matches |
| Model | `MatchModel.ts` | Single match instance — passage, player stats, timer |
| Model | `GameModel.ts` | App-level state — phase, players, current match, history |
| View | `GameView.ts` | Typing UI, progress bars, countdown, lobby |
| View | `ResultsView.ts` | Post-game screen, match history |
| Controller | `GameController.ts` | Wires models ↔ views, handles input, WebSocket, ghost opponent |
 
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
- **Passage fetched server-side** — Wikipedia REST API, filtered to 100–500 chars, falls back to local passages
- **Networked multiplayer via WebSockets** — server handles room management, passage fetch, match coordination
- **Single player** — ghost opponent cursor moves at target WPM, no second client needed
- **No localStorage** — match history lives in session only; no leaderboard persistence
- **No real-time opponent stat syncing** — opponent progress only updated at match end
---
 
## Progress
 
### ✅ Done
- [x] Project scaffolded (Vite + vanilla-ts template)
- [x] Folder structure set up
- [x] `passages.ts` — fallback passage data
- [x] `PlayerModel.ts` — id, name, averageWpm, updateStats()
- [x] `MatchModel.ts` — matchId, passage, player stats map, timer, elapsedTime
- [x] `GameModel.ts` — phases, players, match lifecycle, getResults()
- [x] `GameController.ts` — match flow, keystroke handling, WebSocket, ghost opponent
- [x] `GameView.ts` — home, lobby, difficulty, countdown, match screens
- [x] `ResultsView.ts` — results screen, history, rematch, back navigation
- [x] `main.ts` — bootstraps app, wires Model, View, Controller
- [x] `shared/types.ts` — WebSocket message types shared between client and server
- [x] `server/src/index.ts` — WebSocket server, room management, passage fetch, disconnect
- [x] `server/src/RoomManager.ts` — room creation, joining, lookup, removal
- [x] Single player mode — ghost opponent at Easy/Medium/Hard WPM
- [x] Multiplayer — create/join room, start match, rematch, disconnect handling
- [x] Match history per session
- [x] Dead code removal — `player_update` / `opponent_update` types, dummy opponent stats fallback, debug `window.controller`
- [x] JSDoc comments across all models, views, controller, and server files
### 📋 Pending
- [ ] Styles
- [ ] End-to-end testing