# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development (from repo root)
```bash
npm run dev            # Start both frontend and backend concurrently
npm run dev:frontend   # Next.js dev server only (port 3000)
npm run dev:backend    # nodemon server only (port 5000)
```

### Build & Production
```bash
npm run build          # Build both (backend build is a no-op)
npm start              # Build then start both
```

### Frontend only
```bash
cd frontend
npm run lint           # ESLint via next lint
npm run build          # Next.js production build
```

### Environment variables
Backend (`backend/.env`):
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Architecture

This is a monorepo. The root `package.json` uses `concurrently` only; all real dependencies live in `frontend/` and `backend/`.

### Backend (`backend/`)
- **`server.js`** — Express + Socket.io setup. Holds all room state in a single in-memory `Map<roomCode, room>`. No database. Rooms are lost on server restart.
- **`events/gameEvents.js`** — All Socket.io event handlers (`createRoom`, `joinRoom`, `startGame`, etc.). Authorizes host-only actions by comparing `socket.id` to `room.hostId`.
- **`utils/gameLogic.js`** — Pure functions: `createRoom`, `assignRoles` (Fisher-Yates shuffle), `getGameStats`.

### Frontend (`frontend/`)
- **Next.js 14 App Router** (`app/`) — Single page app. `app/page.jsx` drives a local `viewState` ('lobby' | 'host' | 'player' | 'roleReveal' | 'roleRevelation') derived from `gameState`.
- **`context/SocketContext.js`** — Creates and owns the Socket.io client connection. Provides `{ socket, isConnected }`.
- **`context/GameContext.js`** — Wraps all game actions and Socket.io listeners. Provides `{ gameState, createRoom, joinRoom, ... }`. All components consume this via `useGame()`.
- **`lib/config.js`** — Reads `NEXT_PUBLIC_BACKEND_URL` and exports `API_CONFIG.SOCKET_URL`.
- **`components/`** — Five leaf components (`Lobby`, `HostDashboard`, `PlayerScreen`, `RoleReveal`, `RoleRevelation`). No sub-routing; `page.jsx` conditionally renders one at a time.

### Data flow
1. User action → component calls a `GameContext` action → emits Socket.io event to backend
2. Backend mutates in-memory room state → emits response event(s)
3. `GameContext` listeners update `gameState` → React re-renders

### Security invariant
After `startGame`, the backend sends roles via **two separate emissions**:
- `roleDealt` → sent privately to each player's individual socket (role is secret)
- `playerListUpdate` → host receives full list with roles; all others receive an anonymized list (`role: null`)

Never broadcast roles to the room — always use `io.sockets.sockets.get(player.socketId).emit(...)` for per-player role delivery.

### Adding new Socket.io events
1. Add handler in `backend/events/gameEvents.js`
2. Add game logic in `backend/utils/gameLogic.js` if needed
3. Add `socket.on(...)` listener in `frontend/context/GameContext.js` (and clean up in the `return` of the `useEffect`)
4. Add action function in `GameContext` and expose it through the provider value
