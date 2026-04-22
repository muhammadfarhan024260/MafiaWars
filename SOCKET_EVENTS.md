# Socket.io Events Reference

## Event Flow Diagram

```
Client                          Server                       Other Clients
  |                               |                               |
  |------ createRoom ------------>|                               |
  |<----- roomCreated ------------|                               |
  |                               |------- playerListUpdate ----->|
  |                               |<------ playerListUpdate ------|
  |                               |                               |
  |------ joinRoom ------------->|                               |
  |<----- roomJoined -------------|                               |
  |                               |------- playerListUpdate ----->|
  |                               |<------ playerListUpdate ------|
  |                               |                               |
  |------ updateConfiguration -->|                               |
  |                               |--- configurationUpdated ----->|
  |                               |<--- configurationUpdated -----|
  |                               |                               |
  |------ startGame ------------->|                               |
  |<----- roleDealt (private) ----|                               |
  |                               |------- gameStarted ---------->|
  |                               |<------- gameStarted ----------|
  |                               |                               |
  |------ revealRole ------------>|                               |
  |<----- roleReveal -------------|                               |
  |                               |                               |
  |------ eliminatePlayer ------->|                               |
  |                               |---- playerEliminated ------->|
  |                               |<---- playerEliminated --------|
  |                               |                               |
  |------ revealAll ------------>|                               |
  |                               |-- allRolesRevealed -------->|
  |                               |<-- allRolesRevealed ---------|
```

## Detailed Event Reference

### CLIENT → SERVER EVENTS

#### createRoom
**Purpose**: Create a new game room

**Data**:
```javascript
{
  hostName: string  // Name of the narrator/host
}
```

**Emitted by**: Host player in Lobby

**Example**:
```javascript
socket.emit('createRoom', { hostName: 'Game Master' });
```

---

#### joinRoom
**Purpose**: Join an existing room

**Data**:
```javascript
{
  roomCode: string,   // 4-digit room code
  playerName: string  // Name of player joining
}
```

**Emitted by**: Regular players in Lobby

**Example**:
```javascript
socket.emit('joinRoom', { roomCode: '1234', playerName: 'Alice' });
```

---

#### updateConfiguration
**Purpose**: Update the number of Mafia and Doctor roles (host only)

**Data**:
```javascript
{
  roomCode: string,
  mafiaCount: number,
  doctorCount: number
}
```

**Emitted by**: Host only

**Validation**: 
- mafiaCount + doctorCount ≤ total players
- Total players must be ≥ 1

**Example**:
```javascript
socket.emit('updateConfiguration', {
  roomCode: '1234',
  mafiaCount: 2,
  doctorCount: 1
});
```

---

#### startGame
**Purpose**: Deal roles and start the game (host only)

**Data**:
```javascript
{
  roomCode: string
}
```

**Emitted by**: Host only

**Preconditions**:
- Minimum 2 players in room
- Game not already started

**Effect**: 
- Shuffles and assigns roles to all players
- Each player receives private `roleDealt` event
- All players receive `gameStarted` event

**Example**:
```javascript
socket.emit('startGame', { roomCode: '1234' });
```

---

#### revealRole
**Purpose**: Player requests to see their role (displays for 3 seconds)

**Data**:
```javascript
{
  roomCode: string,
  playerId: string
}
```

**Emitted by**: Any player after game starts

**Effect**: 
- Server sends role to requesting player only
- Role auto-hides client-side after 3 seconds

**Example**:
```javascript
socket.emit('revealRole', {
  roomCode: '1234',
  playerId: 'player-uuid'
});
```

---

#### eliminatePlayer
**Purpose**: Mark a player as eliminated (host only)

**Data**:
```javascript
{
  roomCode: string,
  playerId: string
}
```

**Emitted by**: Host only

**Effect**:
- Player marked as eliminated
- All players notified via `playerEliminated`
- Game stats updated

**Example**:
```javascript
socket.emit('eliminatePlayer', {
  roomCode: '1234',
  playerId: 'player-uuid'
});
```

---

#### shieldPlayer
**Purpose**: Shield a player (doctor save) (host only)

**Data**:
```javascript
{
  roomCode: string,
  playerId: string
}
```

**Emitted by**: Host only

**Effect**:
- Player marked as shielded
- Shield lasts 1 minute (auto-expires)
- All players notified via `playerShielded`

**Example**:
```javascript
socket.emit('shieldPlayer', {
  roomCode: '1234',
  playerId: 'player-uuid'
});
```

---

#### revealAll
**Purpose**: Reveal all players' roles (game end) (host only)

**Data**:
```javascript
{
  roomCode: string
}
```

**Emitted by**: Host only

**Effect**:
- All players receive `allRolesRevealed` with complete player info
- Includes roles, elimination status, names

**Example**:
```javascript
socket.emit('revealAll', { roomCode: '1234' });
```

---

#### resetGame
**Purpose**: Reset game for a new round (host only)

**Data**:
```javascript
{
  roomCode: string
}
```

**Emitted by**: Host only

**Effect**:
- Game status reset to pre-game
- All player roles cleared
- Elimination status reset
- All players receive `gameReset`

**Example**:
```javascript
socket.emit('resetGame', { roomCode: '1234' });
```

---

#### getRoomState
**Purpose**: Request current room state

**Data**:
```javascript
{
  roomCode: string
}
```

**Emitted by**: Any player

**Response**: `roomState` event with full room data

**Example**:
```javascript
socket.emit('getRoomState', { roomCode: '1234' });
```

---

### SERVER → CLIENT EVENTS

#### roomCreated
**Purpose**: Confirm room creation and provide details

**Data**:
```javascript
{
  roomCode: string,
  playerId: string,
  isHost: boolean
}
```

**Received by**: Creating player

**Example**:
```javascript
socket.on('roomCreated', (data) => {
  console.log(`Room created: ${data.roomCode}`);
  console.log(`Your ID: ${data.playerId}`);
  console.log(`You are host: ${data.isHost}`);
});
```

---

#### roomJoined
**Purpose**: Confirm successful room join

**Data**:
```javascript
{
  roomCode: string,
  playerId: string,
  isHost: boolean
}
```

**Received by**: Joining player

**Example**:
```javascript
socket.on('roomJoined', (data) => {
  console.log(`Joined room: ${data.roomCode}`);
});
```

---

#### playerListUpdate
**Purpose**: Notify all players when player list changes

**Data**:
```javascript
[
  {
    id: string,
    name: string,
    isHost: boolean
  },
  // ... more players
]
```

**Broadcast to**: All players in room

**Triggers**: 
- When new player joins
- When player disconnects
- When game starts

**Example**:
```javascript
socket.on('playerListUpdate', (players) => {
  console.log(`Players in room: ${players.length}`);
  players.forEach(p => {
    console.log(`  ${p.name}${p.isHost ? ' (HOST)' : ''}`);
  });
});
```

---

#### configurationUpdated
**Purpose**: Notify all players of role configuration change

**Data**:
```javascript
{
  mafiaCount: number,
  doctorCount: number,
  civilianCount: number,
  totalPlayers: number
}
```

**Broadcast to**: All players in room

**Example**:
```javascript
socket.on('configurationUpdated', (config) => {
  console.log(`Game setup: ${config.mafiaCount} Mafia, ${config.doctorCount} Doctor, ${config.civilianCount} Civilian`);
});
```

---

#### gameStarted
**Purpose**: Notify all players that game has begun

**Data**:
```javascript
{
  totalPlayers: number,
  stats: {
    totalAlive: number,
    mafiaAlive: number,
    doctorsAlive: number,
    civiliansAlive: number,
    totalEliminated: number
  }
}
```

**Broadcast to**: All players in room

**Example**:
```javascript
socket.on('gameStarted', (data) => {
  console.log(`Game started with ${data.totalPlayers} players!`);
});
```

---

#### roleDealt
**Purpose**: Send player's assigned role (PRIVATE)

**Data**:
```javascript
{
  role: string,     // 'MAFIA', 'DOCTOR', or 'CIVILIAN'
  playerId: string
}
```

**Sent to**: Individual player only (NOT broadcast)

**Example**:
```javascript
socket.on('roleDealt', (data) => {
  console.log(`Your role: ${data.role}`);
});
```

---

#### roleReveal
**Purpose**: Send role for 3-second display

**Data**:
```javascript
{
  role: string,         // 'MAFIA', 'DOCTOR', or 'CIVILIAN'
  duration: number      // 3000 milliseconds
}
```

**Sent to**: Requesting player only

**Expected Client Behavior**:
- Display role prominently
- Auto-hide after 3 seconds
- Return to neutral dark screen

**Example**:
```javascript
socket.on('roleReveal', (data) => {
  displayRoleFor(data.role, data.duration); // Show for 3 seconds
});
```

---

#### playerEliminated
**Purpose**: Notify all players of elimination

**Data**:
```javascript
{
  playerId: string,
  stats: {
    totalAlive: number,
    mafiaAlive: number,
    doctorsAlive: number,
    civiliansAlive: number,
    totalEliminated: number
  }
}
```

**Broadcast to**: All players in room

**Example**:
```javascript
socket.on('playerEliminated', (data) => {
  console.log(`Player eliminated. ${data.stats.totalAlive} still alive.`);
});
```

---

#### playerShielded
**Purpose**: Notify all players of shield

**Data**:
```javascript
{
  playerId: string
}
```

**Broadcast to**: All players in room

**Note**: Shield auto-expires after 1 minute

**Example**:
```javascript
socket.on('playerShielded', (data) => {
  console.log(`Player shielded!`);
});
```

---

#### allRolesRevealed
**Purpose**: End game reveal with complete player information

**Data**:
```javascript
{
  players: [
    {
      id: string,
      name: string,
      role: string,        // 'MAFIA', 'DOCTOR', or 'CIVILIAN'
      eliminated: boolean
    },
    // ... more players
  ]
}
```

**Broadcast to**: All players in room

**Client Action**: Display all roles and statuses

**Example**:
```javascript
socket.on('allRolesRevealed', (data) => {
  console.log('FINAL ROLES:');
  data.players.forEach(p => {
    console.log(`${p.name}: ${p.role}${p.eliminated ? ' (ELIMINATED)' : ''}`);
  });
});
```

---

#### gameReset
**Purpose**: Reset game for new round

**Data**:
```javascript
{
  totalPlayers: number
}
```

**Broadcast to**: All players in room

**Effect**: Client clears game state, returns to configuration

**Example**:
```javascript
socket.on('gameReset', (data) => {
  console.log('Game reset! Ready for new round.');
});
```

---

#### roomState
**Purpose**: Send complete room state on request

**Data**:
```javascript
{
  roomCode: string,
  gameStarted: boolean,
  players: [
    {
      id: string,
      name: string,
      isHost: boolean,
      eliminated: boolean,
      shielded: boolean
    }
  ],
  configuration: {
    mafiaCount: number,
    doctorCount: number
  },
  stats: {
    totalAlive: number,
    mafiaAlive: number,
    doctorsAlive: number,
    civiliansAlive: number,
    totalEliminated: number
  }
}
```

**Sent to**: Requesting player

**Example**:
```javascript
socket.on('roomState', (state) => {
  console.log(`Room ${state.roomCode}: ${state.players.length} players, game started: ${state.gameStarted}`);
});
```

---

#### error
**Purpose**: Send error message to client

**Data**:
```javascript
{
  message: string  // Error description
}
```

**Sent to**: Client that caused error

**Common Errors**:
- "Room code and player name required"
- "Room not found"
- "Game already started"
- "Unauthorized" (non-host attempting host action)
- "Need at least 2 players to start"

**Example**:
```javascript
socket.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  showErrorToUser(err.message);
});
```

---

## Authorization Matrix

| Event | Host Only | Requires Game Start | Private | Broadcast |
|-------|-----------|-------------------|---------|-----------|
| createRoom | - | - | ✓ | - |
| joinRoom | - | - | ✓ | ✓ (playerListUpdate) |
| updateConfiguration | ✓ | - | - | ✓ |
| startGame | ✓ | - | - | ✓ |
| revealRole | - | ✓ | ✓ | - |
| eliminatePlayer | ✓ | ✓ | - | ✓ |
| shieldPlayer | ✓ | ✓ | - | ✓ |
| revealAll | ✓ | ✓ | - | ✓ |
| resetGame | ✓ | - | - | ✓ |
| getRoomState | - | - | ✓ | - |

---

## Testing Events

### Using Browser Console

```javascript
// Emit event
socket.emit('eventName', { data: 'value' });

// Listen for event
socket.on('eventName', (data) => {
  console.log('Received:', data);
});

// Check connection
console.log('Connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

### Example Test Sequence

```javascript
// 1. Create room
socket.emit('createRoom', { hostName: 'Test Host' });

// 2. Wait for roomCreated event
socket.once('roomCreated', (data) => {
  const roomCode = data.roomCode;
  
  // 3. Update configuration
  socket.emit('updateConfiguration', {
    roomCode: roomCode,
    mafiaCount: 1,
    doctorCount: 1
  });
  
  // 4. Start game
  socket.emit('startGame', { roomCode: roomCode });
  
  // 5. Listen for role
  socket.once('roleDealt', (role) => {
    console.log('Your role:', role);
  });
});
```

---

## Debugging Tips

1. **Monitor all events**:
   ```javascript
   socket.onAny((event, ...args) => {
     console.log(event, args);
   });
   ```

2. **Check WebSocket frame**:
   - DevTools → Network → Find Socket.io connection
   - Click it, view Messages tab
   - Watch real-time events

3. **Verify CORS**:
   - Check browser console for CORS errors
   - Verify `FRONTEND_URL` in backend .env

4. **Test room codes**:
   - Use format: `generateRoomCode()` returns 0000-9999
   - All codes are valid

---

## Performance Notes

- Events are near-instantaneous (<100ms typically)
- No event queuing needed
- Socket.io handles reconnection automatically
- Room data stored in memory (cleared on server restart)

---

**Last Updated**: April 2026
