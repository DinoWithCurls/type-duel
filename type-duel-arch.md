# TypeDuel — Architecture & Design Decisions

A reference log of all decisions taken during planning.

---

## What is TypeDuel?
A real-time competitive typing game built in **Vanilla JS / HTML / CSS using the MVC pattern**.  
Supports both single player and networked multiplayer via WebSockets.

---

## Decision Log

### 1. Multiplayer
- **Decision:** Both single player AND networked multiplayer
- **Reason:** Already familiar with WebSockets; good practice, more impressive portfolio piece
- **Single player:** Ghost opponent — a cursor moving at a target WPM for the user to race against
- **Multiplayer:** Two browsers, WebSocket server, real-time progress broadcast
- **Key insight:** The View just renders "opponent progress" — it doesn't care whether that data comes from a ghost or a WebSocket. The Model handles the source. Clean MVC.

---

### 2. Passage Selection
- **Decision:** Quotable API (free, no API key needed)
- **Reason:** No hardcoded logic; don't want to maintain a static list
- **Fetch timing:** During the 3-2-1 countdown — latency is completely hidden from the user
- **Pre-fetch:** A second passage is fetched in the background during the Results screen so rematch is instant
- **Fallback:** Consider bundling a small `passages.json` as a fallback if Quotable is down during a demo

---

### 3. Finish Condition
- **Decision:** When `cursorIndex === passage.length` (last character reached)
- **No Enter key required** — the game ends naturally as the last character is typed correctly

---

### 4. Backspace & Error Handling
- **Decision:** Backspace is allowed
- **Backspace behaviour:** Decrements `cursorIndex`, but still increments `totalKeystrokes`
- **Rationale:** Making and fixing mistakes naturally slows WPM — no special penalty logic needed

**Player state tracked in Model:**
```js
{
  cursorIndex: 0,       // current position in passage
  totalKeystrokes: 0,   // every key pressed, including backspace
  errors: 0,            // incremented each time a wrong character is typed
}
```

**Accuracy formula:**
```
accuracy = ((totalKeystrokes - errors) / totalKeystrokes) * 100
```

**WPM formula:**
```
WPM = (cursorIndex / 5) / (elapsedTimeInSeconds / 60)
```
WPM is based on cursor position, not total keystrokes — so fixing errors costs you time/speed naturally.

---

### 5. Game States (State Machine)
```
Idle ──► Countdown ──► Playing ──► Results
              │                       │
              │   (API fetch here)    │
              │                       ▼
              └──────────────── Rematch / Reset
                                       │
                                       ▼
                                     Idle
```

**State descriptions:**
| State | Description |
|-------|-------------|
| **Idle / Lobby** | Start screen. Players enter names, pick mode (single/multi), select difficulty |
| **Countdown** | 3-2-1 animation. Input disabled. Quotable API fetched here. Both players ready simultaneously |
| **Playing** | Timer running, keystrokes validated, WPM updating live, progress bars moving |
| **Results** | Race over. Show WPM, accuracy, time for both players. Winner highlighted. Next passage pre-fetched here |
| **Rematch** | Transition — resets Model back to Countdown with same players, new passage already ready |

---

### 6. MVC Structure
```
typeduel/
├── client/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── model/
│       │   └── GameModel.js       # All state: passage, players, scores, timers
│       ├── view/
│       │   ├── GameView.js        # DOM rendering, progress bars, typing UI
│       │   └── ResultsView.js     # Results screen rendering
│       ├── controller/
│       │   └── GameController.js  # Keystroke handling, game flow, API calls, WebSocket events
│       └── app.js                 # Entry point — wires Model, View, Controller together
├── server/
│   └── index.js                   # Node.js WebSocket server — room management, progress broadcast
└── package.json                   # Root — concurrently runs client + server
```

---

### 7. WebSocket Server (Multiplayer)
- **Room system:** Player creates a room → gets a code → shares with opponent → opponent joins
- **What the server broadcasts:** Each player's `cursorIndex` and `wpm` in real time
- **Server does not validate keystrokes** — that's the client's job. Server only relays progress.
- **On finish:** Server notifies both clients who won

---

### 8. Deployment
| Part | Platform |
|------|----------|
| Client (static) | Vercel or Netlify |
| Server (Node/WS) | Render or Railway (free tier) |

- **Repo:** Monorepo — `client/` and `server/` in one GitHub repo
- **Local dev:** `concurrently` runs both from root with a single `npm run dev`

---

### 9. What is NOT included (intentional scope limits)
- No database — leaderboard lives in `localStorage` only
- No user accounts / auth
- No mobile support (desktop typing game)
- No AI (this project is intentionally pure hand-coded JS — the whole point is MVC practice)
- Coding this **entirely by hand**, no AI code generation

---

## Key Portfolio Talking Points
- Clean MVC separation — View is agnostic to whether opponent data is local or remote
- WebSocket room system built from scratch
- State machine with clean transitions
- WPM/accuracy calculation logic
- API fetch timing hidden inside countdown UX