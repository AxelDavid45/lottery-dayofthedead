# Technology Stack

## Architecture
- **Monorepo structure** with separate client and server directories
- **Real-time communication** via WebSocket (Socket.IO)
- **In-memory state management** for game rooms and player data

## Frontend
- **React** with TypeScript for type safety
- **Vite** as build tool and dev server
- **Tailwind CSS** for styling and responsive design
- **Socket.IO Client** for real-time communication
- **Mobile-first responsive design**

## Backend
- **Node.js** with Fastify server
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
- `fastify ^4.24.3` - Fast and efficient web server framework
- `@fastify/websocket ^8.3.1` - WebSocket support for Fastify
- `socket.io ^4.7.2` - Real-time bidirectional communication
- `uuid ^9.0.0` - Generate unique room identifiers
- `tailwindcss ^3.3.6` - Utility-first CSS framework