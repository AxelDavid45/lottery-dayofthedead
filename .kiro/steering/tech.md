# Technology Stack

## Architecture
- **Monorepo structure** with separate client and server directories
- **Real-time communication** via WebSocket (Socket.IO)
- **In-memory state management** for game rooms and player data

## Frontend
- **React** with TypeScript for type safety
- **Vite** as build tool and dev server
- **Socket.IO Client** for real-time communication
- **Responsive design** with mobile-first approach

## Backend
- **Node.js** with Express server
- **Socket.IO** for WebSocket connections
- **UUID** for unique room code generation
- **In-memory storage** (no database required)

## Development Dependencies
- **nodemon** for development auto-reload
- **TypeScript** for type checking across the stack

## Common Commands
```bash
# Development
npm run dev          # Start backend with auto-reload
npm start           # Start production server

# Frontend (from client directory)
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Key Libraries
- `express ^4.18.2` - Web server framework
- `socket.io ^4.7.2` - Real-time bidirectional communication
- `uuid ^9.0.0` - Generate unique room identifiers