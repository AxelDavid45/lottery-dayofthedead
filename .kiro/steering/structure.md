# Project Structure

## Monorepo Organization
```
loteria-dia-muertos/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Client-side utilities
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── models/        # Data models and types
│   │   ├── handlers/      # Socket.IO event handlers
│   │   └── utils/         # Server-side utilities
│   └── package.json       # Backend dependencies
├── shared/                # Shared types and constants
│   └── types/            # Common TypeScript interfaces
└── package.json          # Root package.json
```

## Key Components Structure

### Frontend Components
- `Home` - Landing page with create/join room forms
- `Lobby` - Pre-game room with player list and host controls
- `Game` - Main game interface with 4x4 board
- `CurrentCard` - Display currently called card
- `PlayerList` - Show connected players and their status

### Backend Organization
- `server.js` - Main Express server with Socket.IO setup
- `models/` - Game state, room state, and player data structures
- `handlers/` - Socket event handlers for room and game logic
- `utils/` - Card deck, board generation, and validation utilities

## Naming Conventions
- **Components**: PascalCase (e.g., `GameBoard`, `PlayerList`)
- **Files**: kebab-case for utilities, PascalCase for components
- **Socket Events**: camelCase (e.g., `joinRoom`, `cardCalled`)
- **Types/Interfaces**: PascalCase with descriptive names

## File Organization Principles
- Separate client and server concerns completely
- Share common types through dedicated shared directory
- Group related functionality in logical directories
- Keep components focused and single-responsibility