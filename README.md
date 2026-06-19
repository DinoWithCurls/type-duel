# TypeDuel ⌨️

A real-time competitive typing game. Race an opponent — or a ghost — to type a passage with live WPM and accuracy tracking.

**Stack:** Vanilla TypeScript + HTML + CSS, strict MVC pattern, Vite, WebSockets  
**No frameworks**

---

## Features

- Real-time multiplayer via WebSockets — create or join a room
- Single player mode with a ghost opponent (Easy / Medium / Hard)
- Live WPM, accuracy, and error tracking
- Match history and rematch flow
- Dark theme with animated feedback

---

## Getting Started

```bash
# Client
npm install
npm run dev

# Server (separate terminal)
cd server
npm install
npm run dev
```

Production build:
```bash
npm run build        # client
cd server && npm run build && npm start
```

---

## Architecture

| Layer | File | Responsibility |
|-------|------|----------------|
| Model | `PlayerModel.ts` | Player identity, average WPM across matches |
| Model | `MatchModel.ts` | Single match — passage, player stats, timer |
| Model | `GameModel.ts` | App state — phase, players, current match, history |
| View | `GameView.ts` | Home, lobby, difficulty, countdown, match screens |
| View | `ResultsView.ts` | Results and history screens |
| Controller | `GameController.ts` | Wires models to views, WebSocket communication, ghost opponent logic |

Game phases: `idle → countdown → playing → results`

Winner is decided by: most input completed → least errors → highest WPM (tiebreaker).

Passages are fetched server-side from the Wikipedia REST API, filtered to 100–500 characters and ASCII-only, with a local fallback list if fetching fails.

---

## Project Structure

```
typeduel/
├── shared/types.ts        # WebSocket message types, shared by client + server
├── src/
│   ├── models/            # PlayerModel, MatchModel, GameModel
│   ├── views/              # GameView, ResultsView
│   ├── controllers/        # GameController
│   ├── data/passages.ts    # fallback passages
│   └── styles/             # main.css, game.css, results.css
└── server/
    └── src/
        ├── index.ts        # WebSocket server
        ├── RoomManager.ts
        └── passages.ts
```

---

**Live:** client on Vercel · server on Render