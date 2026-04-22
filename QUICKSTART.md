# Getting Started Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

From the root `MafiaWars` directory:

```bash
npm install
```

This installs the root-level dependencies needed to run both frontend and backend concurrently.

### 2. Install Frontend & Backend Dependencies

```bash
# Navigate to frontend and install
cd frontend
npm install
cd ..

# Navigate to backend and install
cd backend
npm install
cd ..
```

### 3. Start Development Servers

From the root directory:

```bash
npm run dev
```

This command starts both the backend (port 5000) and frontend (port 3000) simultaneously.

**Alternatively, run them separately** in different terminals:

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Frontend  
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 4. Open in Browser

Visit: **http://localhost:3000**

You should see the Mafia Wars login screen.

---

## First Game Setup

### Host's Perspective (Narrator)

1. **Create Room**
   - Click "Create Room"
   - Enter your name (e.g., "Game Master")
   - You'll get a 4-digit room code

2. **Share Code**
   - Share the code with all players
   - They'll see it in the Lobby to join

3. **Wait for Players**
   - Player list updates in real-time
   - Need minimum 2 players

4. **Configure Roles**
   - Use +/- to adjust Mafia count
   - Use +/- to adjust Doctor count
   - Civilian count auto-calculates
   - Example: 4 players → 1 Mafia, 1 Doctor, 2 Civilians

5. **Start Game**
   - Click "Start Game & Deal Roles"
   - Each player gets their role (3-second reveal)
   - You see the Host Dashboard

6. **Manage Game**
   - Click "Mark Eliminated" as players are voted out
   - Click "Shield" if Doctor saves someone
   - Game proceeds verbally/physically

7. **End Game**
   - Click "Reveal All Roles"
   - All players see the final truth

### Player's Perspective

1. **Join Room**
   - Click "Join Room"
   - Enter 4-digit code from narrator
   - Enter your name
   - Wait in lobby

2. **Receive Role**
   - When host starts game, you see YOUR ROLE for 3 seconds
   - Screen shows role clearly, then goes dark
   - **Keep your phone secure!**

3. **Play Game**
   - Listen to narrator's instructions
   - Discuss with other players
   - Game is verbal/physical - no phone interactions needed

4. **Game End**
   - All roles revealed on your screen
   - See who was what

---

## Testing with Local Devices

### On Same Computer

Open 2+ browser windows:
- Window 1: Host at `http://localhost:3000`
- Window 2: Player at `http://localhost:3000`
- Window 3: Player at `http://localhost:3000`

### On Different Computers (Local Network)

Find your machine's local IP:

**Windows PowerShell:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Update Frontend .env:**
```
NEXT_PUBLIC_BACKEND_URL=http://YOUR_IP:5000
```

**Restart frontend server and access from other machines:**
```
http://YOUR_IP:3000
```

---

## Project Files Overview

### Frontend Structure

```
frontend/
├── app/
│   ├── page.jsx          # Main game page (main component)
│   ├── layout.jsx        # Root layout wrapper
│   └── globals.css       # Global Tailwind styles
├── components/
│   ├── Lobby.jsx         # Create/Join room screen
│   ├── HostDashboard.jsx # Narrator control panel
│   ├── RoleReveal.jsx    # 3-second role display
│   ├── PlayerScreen.jsx  # Player waiting screen
│   └── RoleRevelation.jsx # End-game reveal
├── context/
│   ├── SocketContext.js  # Socket.io connection
│   └── GameContext.js    # Game state & actions
├── lib/
│   └── config.js         # Configuration
├── tailwind.config.js    # Tailwind configuration
├── next.config.js        # Next.js configuration
└── package.json
```

### Backend Structure

```
backend/
├── server.js             # Express + Socket.io server
├── events/
│   └── gameEvents.js     # All Socket.io event handlers
├── utils/
│   └── gameLogic.js      # Game logic (shuffle, assign roles, etc)
├── package.json
├── .env                  # Environment variables
└── .env.example          # Example env template
```

---

## Key Concepts

### Room Codes
- 4-digit codes (0000-9999)
- Auto-generated when host creates room
- Share with players to join

### Roles
- **Mafia**: Tries to eliminate townspeople
- **Doctor**: Saves one player per round
- **Civilian**: Votes with town

### 3-Second Rule
- Role displays for exactly 3 seconds
- Auto-hides to prevent peeking
- Screen returns to dark state
- Critical for game integrity

### Host Powers
- Adjust role counts before game
- Start game and deal roles
- Mark players as eliminated
- Shield players (doctor saves)
- Reveal all roles at end
- Reset for new round

---

## Debugging

### Check Backend is Running

Go to: http://localhost:5000/health

Should see: `{"status":"ok"}`

### View Socket.io Messages

Open browser DevTools (F12):
- Network tab → WS → Socket.io
- Watch messages in real-time

### Check Logs

Backend terminal shows:
```
Server running on port 5000
New client connected: socket-id
Room created: 1234 by Player Name
```

### Reset Everything

Kill both servers (Ctrl+C in terminals) and:
```bash
npm run dev
```

---

## Deployment (Production)

### Using Vercel (Frontend) + Heroku (Backend)

1. **Backend on Heroku**
   - Create Heroku account
   - Add environment variables
   - Deploy from Git

2. **Frontend on Vercel**
   - Connect Git repository
   - Set `NEXT_PUBLIC_BACKEND_URL` to Heroku URL
   - Deploy automatically

3. **Update CORS in Backend**
   ```javascript
   const io = socketIo(server, {
     cors: {
       origin: process.env.FRONTEND_URL, // Set to your Vercel URL
       methods: ['GET', 'POST']
     }
   });
   ```

---

## Common Issues & Solutions

### "Connection Refused" Error
- Ensure backend is running (`npm run dev` in backend directory)
- Check port 5000 is not in use
- Verify `NEXT_PUBLIC_BACKEND_URL` matches backend URL

### "Room Not Found"
- Host must exist in same room as players
- Room code must be exact (case doesn't matter, but 4 digits)
- Room deleted if host disconnects

### Role Not Displaying
- Check browser console for errors
- Verify Socket.io connection under Network tab
- Restart frontend server

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild frontend: `npm run build`
- Restart dev server

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Run development servers
3. ✅ Test with multiple devices
4. 📝 Customize theme/colors if desired
5. 🚀 Deploy to production
6. 🎮 Play Mafia!

---

## Need Help?

Check the main [README.md](../README.md) for:
- Detailed feature descriptions
- Architecture overview
- Socket.io event reference
- Tech stack details

---

**Happy gaming! 🔪**
