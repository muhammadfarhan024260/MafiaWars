# MafiaWars Project – Session Summary

## Project Overview

**MafiaWars** is a real-time, mobile-first web app for hosting the Mafia party game. It has a **Next.js frontend** (deployed on Vercel) and a **Node.js + Socket.IO backend**. The UI theme is "Mafia Noir" — dark glassmorphism with Bebas Neue typography.

---

## Key File Structure

```
MafiaWars/
├── backend/
│   ├── events/gameEvents.js    # All Socket.IO event handlers
│   └── utils/gameLogic.js      # Role assignment logic
├── frontend/
│   ├── app/
│   │   ├── page.jsx            # Main entry point, renders all views
│   │   ├── layout.jsx          # Fonts, metadata, providers
│   │   └── globals.css         # Tailwind base + custom animations
│   ├── components/
│   │   ├── Lobby.jsx           # Create/Join room screen
│   │   ├── HostDashboard.jsx   # Narrator control panel
│   │   ├── PlayerScreen.jsx    # Player standby screen
│   │   ├── RoleReveal.jsx      # Private role reveal animation
│   │   ├── RoleRevelation.jsx  # End-game all-roles reveal
│   │   └── Notification.jsx    # Global custom alert modal
│   └── context/
│       ├── GameContext.js      # All game state + socket actions
│       └── SocketContext.js    # Socket connection + userId
```

---

## Features Implemented This Session

### 🎭 Role Assignment

- **Weighted randomness** for Mafia role selection. Each player has a `mafiaWeight`. Civilians/Doctors gain +5 weight per round; being Mafia resets weight to 1. This ensures fair rotation without being deterministic.
- **"Start Game"** button now automatically saves the Mafia/Doctor configuration before starting, so the host doesn't need to click "Update Configuration" manually.

---

### 👥 Room Management

- **Kick Player**: Host can remove players via a "Kick" button with a confirmation modal. Backend emits `roomClosed` to the kicked player.
- **Leave Room**: Both Host and Players have a "Leave Game" button. Clears local session and notifies the server.
- **Automatic Host Migration**: If the Narrator disconnects or leaves, the first player in the list is automatically promoted to Narrator.
- **Manual Narrator Transfer**: Players can click "Request to be Narrator." The host sees a banner with Approve/Deny. If approved, roles swap instantly — old host becomes a player, requesting player becomes the new Narrator.

---

### 🎨 UI/UX Polish

- Removed all "Among Us" Crewmate SVGs; replaced with initial-based avatars and pulsing radar animations.
- Removed placeholder animations on Lobby inputs.
- Hidden scrollbars globally (`scrollbar-width: none`) while preserving scroll functionality.
- Lobby locked to `100dvh` to prevent mobile scrollbar.
- Role Reveal shows all-white for everyone (no role color hints during reveal).
- Mafia/Doctor counts on the dashboard are now white instead of red/green.
- Replaced all default browser `alert()` calls with a custom **`Notification.jsx`** modal (glassmorphism, Bebas Neue title, color-coded by error/info type).
- Custom favicon (`app/icon.png`) — a stylized "M" with crimson glow on black.

---

## Context & State (`GameContext.js`)

### Exposed Functions

| Function | Description |
| :--- | :--- |
| `createRoom(hostName)` | Creates a new room, saves session |
| `joinRoom(roomCode, playerName)` | Joins an existing room |
| `startGame()` | Starts the game (auto-saves config first) |
| `updateConfiguration(mafiaCount, doctorCount)` | Updates role counts on the server |
| `revealRole(playerId)` | Triggers private role reveal for a player |
| `eliminatePlayer(playerId)` | Marks a player as eliminated |
| `shieldPlayer(playerId)` | Temporarily shields a player |
| `kickPlayer(playerId)` | Removes a player from the room |
| `leaveRoom()` | Current user leaves the room, clears session |
| `requestHostSwitch()` | Player requests to become the Narrator |
| `acceptHostSwitch(targetUserId)` | Host approves the Narrator transfer |
| `declineHostSwitch()` | Host denies the Narrator transfer request |
| `revealAll()` | Reveals all roles to everyone (end of game) |
| `resetGame()` | Resets game state for a new round |
| `setError(message)` | Triggers the custom Notification modal |
| `clearError()` | Dismisses the Notification modal |

### Key State Fields (`gameState`)

| Field | Description |
| :--- | :--- |
| `roomCode` | Current room code |
| `isHost` | Whether current user is the Narrator |
| `players` | Array of player objects |
| `gameStarted` | Whether the game is in progress |
| `myRole` | Current user's assigned role |
| `showRoleReveal` | Triggers the private role reveal screen |
| `showRoleRevelation` | Triggers the end-game all-roles screen |
| `pendingHostSwitch` | `{ userId, name }` of player requesting Narrator |
| `error` | Error message string for the Notification modal |
| `configuration` | `{ mafiaCount, doctorCount }` |

---

## Backend Conventions (`gameEvents.js`)

- All socket emits include `{ roomCode, userId }` for auth/identification.
- The backend uses a `gracePeriodTimers` Map to handle accidental disconnects (30-minute grace period before a player is permanently removed).
- `playerListForHost(room)` returns **full role data** — only ever sent to the Narrator's socket.
- `playerListForAll(room)` returns **anonymized data** (role: null) — sent to all players.
- `saveSession` / `loadSession` / `clearSession` helpers in `lib/session.js` manage localStorage for session persistence and rejoining.

### Socket Events Reference

| Event (Client → Server) | Description |
| :--- | :--- |
| `createRoom` | Creates a new room |
| `joinRoom` | Player joins an existing room |
| `rejoinSession` | Restores session after page refresh |
| `leaveRoom` | Explicitly leaves the room |
| `kickPlayer` | Host removes a specific player |
| `startGame` | Host starts the game |
| `updateConfiguration` | Host updates Mafia/Doctor counts |
| `revealRole` | Requests a player's role |
| `eliminatePlayer` | Host eliminates a player |
| `shieldPlayer` | Host shields a player |
| `revealAll` | Host reveals all roles |
| `resetGame` | Host resets the game |
| `requestHostSwitch` | Player requests Narrator control |
| `acceptHostSwitch` | Host approves Narrator transfer |

| Event (Server → Client) | Description |
| :--- | :--- |
| `roomCreated` | Confirms room creation |
| `roomJoined` | Confirms player joined |
| `sessionRestored` | Reconnection successful |
| `sessionExpired` | Session is no longer valid |
| `playerListUpdate` | Updated player list |
| `gameStarted` | Game has begun |
| `roleDealt` | Private role assigned to player |
| `roleReveal` | Triggers role reveal animation |
| `allRolesRevealed` | End-game reveal data |
| `gameReset` | Game has been reset |
| `roomClosed` | Room closed or player kicked |
| `hostSwitchRequest` | Narrator receives a transfer request |
| `configurationUpdated` | Role configuration updated |
| `playerEliminated` | A player was eliminated |
| `playerShielded` | A player was shielded |
