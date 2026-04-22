# Mafia Wars Digital Narrator

A real-time web application to replace physical "chits" in the game Mafia. The app acts as a digital role distributor and game tracker with a focus on total secrecy and security.

## Features

### Core Functionality
- **Room & Lobby System**: Players join via unique 4-digit codes
- **Host Dashboard**: Real-time player list and game configuration
- **Role Configuration**: Dynamic Mafia, Doctor, and Civilian count adjustment
- **3-Second Secret Reveal**: Role auto-hides after 3 seconds for maximum secrecy
- **Game Management**: Host can mark eliminations and trigger role reveal
- **Real-time Sync**: Socket.io powered synchronization across all devices

### UI/UX
- Dark-themed, OLED-optimized interface
- Mobile-first responsive design
- Minimal and modern aesthetic
- Smooth animations and transitions

## Tech Stack

- **Frontend**: React 18, Next.js 14, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Real-time Communication**: Socket.io
- **Styling**: Tailwind CSS with custom dark theme

## Project Structure

```
MafiaWars/
├── frontend/                 # Next.js React application
│   ├── app/                 # Next.js app directory
│   │   ├── page.jsx         # Main game page
│   │   ├── layout.jsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable components
│   │   ├── Lobby.jsx        # Room creation/join
│   │   ├── HostDashboard.jsx # Host control panel
│   │   ├── RoleReveal.jsx   # Role display (3-sec)
│   │   ├── PlayerScreen.jsx # Player game view
│   │   └── RoleRevelation.jsx # Final role reveal
│   ├── context/             # Context providers
│   │   ├── SocketContext.js # Socket.io management
│   │   └── GameContext.js   # Game state management
│   ├── lib/                 # Utilities
│   │   └── config.js        # Configuration
│   └── package.json
├── backend/                 # Node.js Express server
│   ├── server.js           # Main server file
│   ├── events/
│   │   └── gameEvents.js   # Socket.io event handlers
│   ├── utils/
│   │   └── gameLogic.js    # Game logic functions
│   ├── package.json
│   ├── .env                # Environment variables
│   └── .env.example        # Example env file
├── package.json            # Root package.json
└── README.md              # This file
```

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Git

### Setup

1. **Clone and install dependencies**
```bash
cd MafiaWars
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. **Configure environment variables**

Backend (.env):
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Frontend (.env.local):
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Running the Application

### Development Mode

From the root directory, run both frontend and backend:
```bash
npm run dev
```

Or run them separately:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build
```bash
npm run build
npm start
```

## Usage

### 1. Create a Room (Host)
- Click "Create Room"
- Enter your name as the Narrator/Host
- Share the 4-digit room code with players

### 2. Join a Room (Players)
- Click "Join Room"
- Enter the 4-digit room code
- Enter your name

### 3. Configure Game (Host Only)
- Use +/- buttons to set:
  - Number of Mafia
  - Number of Doctors
  - Civilians are auto-calculated
- Requires minimum 2 players

### 4. Start Game
- Click "Start Game & Deal Roles"
- Each player's phone will display their role for 3 seconds
- Role automatically disappears for security

### 5. During Game
- **Host Dashboard**: 
  - Real-time player list
  - Mark players as "Eliminated" or "Shielded"
  - Trigger "Reveal All" at game end

- **Players**:
  - Wait for Narrator's instructions
  - Click "Reveal My Role" to see their identity
  - Watch for eliminations/shields

### 6. End Game
- Host clicks "Reveal All Roles"
- All players' roles displayed on their screens
- Host can click "Reset Game" for new round

## Socket.io Events

### Client → Server
- `createRoom` - Create new game room
- `joinRoom` - Join existing room
- `updateConfiguration` - Update role counts
- `startGame` - Deal roles and start game
- `revealRole` - Request role reveal
- `eliminatePlayer` - Mark player eliminated
- `shieldPlayer` - Shield player (doctor save)
- `revealAll` - Reveal all roles
- `resetGame` - Reset for new round
- `getRoomState` - Get current room state

### Server → Client
- `roomCreated` - Room successfully created
- `roomJoined` - Successfully joined room
- `playerListUpdate` - Player list changed
- `configurationUpdated` - Role config changed
- `gameStarted` - Game is live
- `roleDealt` - Player's role assigned
- `roleReveal` - Player's role to display
- `playerEliminated` - Player marked out
- `playerShielded` - Player protected
- `allRolesRevealed` - Final reveal
- `gameReset` - Game reset for new round
- `error` - Error message

## Security Features

1. **3-Second Auto-Hide**: Roles vanish automatically
2. **Private Role Transmission**: Each player receives role privately
3. **No In-App Actions**: Mafia/Doctor interactions are verbal only
4. **Dark OLED Theme**: Minimizes screen glow in dim environments
5. **Mobile-First**: Optimal for smartphone security

## Game Logic

### Role Assignment
Roles are randomly shuffled server-side using Fisher-Yates algorithm.

### Game States
- **Lobby**: Creating/joining rooms
- **Configuration**: Host sets role counts
- **Role Reveal**: Players see their identities (3-sec display)
- **Game In Progress**: Host manages game flow
- **Game End**: Final role revelation

### Statistics Tracking
- Total players alive
- Mafia count
- Doctor count
- Civilian count
- Eliminated players

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Responsive grid layouts for mobile
- Minimal CSS with Tailwind
- Efficient Socket.io event handling
- Server-side game logic
- Image-less UI for fast loading

## Troubleshooting

### Connection Issues
- Ensure backend is running on port 5000
- Check CORS settings match frontend URL
- Verify firewall allows WebSocket connections

### Role Not Displaying
- Check socket connection in browser console
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Ensure game was started by host

### Players Not Syncing
- Refresh page to reconnect
- Check network tab for Socket.io messages
- Verify backend logs for errors

## Development Notes

### Adding New Features
1. Add event handler in `backend/events/gameEvents.js`
2. Add game logic in `backend/utils/gameLogic.js`
3. Add Socket.io listener in `GameContext.js`
4. Create/update components as needed
5. Update Tailwind classes for styling

### Testing
- Test on multiple devices simultaneously
- Verify Socket.io message flow
- Check role hiding after 3 seconds
- Confirm eliminations sync across clients

## Future Enhancements

- Vote counting system
- Chat functionality for game notes
- Sound notifications
- Game statistics/history
- Multiple room types
- Custom role definitions
- Game timer/phases
- Spectator mode

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please check the troubleshooting section or review Socket.io/Next.js documentation.

---

**Built for secure, real-time Mafia gaming** 🔪
