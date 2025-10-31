# WebSocket Integration Documentation

## Overview

The client uses Socket.IO for real-time bidirectional communication with the server. The integration includes automatic reconnection, error handling, and type-safe event handling.

## Architecture

### Files Structure

```
client/src/
├── utils/
│   └── socket.ts          # Socket.IO client instance and connection management
├── hooks/
│   └── useSocket.ts       # React hook for Socket.IO state and event handling
└── App.tsx                # Main app component using the socket hook
```

## Socket Client (`utils/socket.ts`)

### Configuration

- **URL**: Configured via `VITE_SOCKET_URL` environment variable (default: `http://localhost:3000`)
- **Auto-connect**: Disabled (manual connection control)
- **Reconnection**: Enabled with exponential backoff
  - Initial delay: 1000ms
  - Max delay: 5000ms
  - Max attempts: 5
- **Timeout**: 10000ms

### Functions

- `getSocket()`: Returns the singleton socket instance
- `connectSocket()`: Connects the socket if not already connected
- `disconnectSocket()`: Disconnects the socket
- `isSocketConnected()`: Returns connection status

## Socket Hook (`hooks/useSocket.ts`)

### Features

1. **Connection Management**
   - Automatic connection on mount
   - Reconnection handling with status updates
   - Connection error handling

2. **State Management**
   - Room state synchronization
   - Current card tracking
   - Player ID tracking
   - Error state management

3. **Event Handlers**
   - All Socket.IO events are handled automatically
   - State updates are propagated to React components

4. **Action Methods**
   - `createRoom(playerName)`: Create a new game room
   - `joinRoom(roomCode, playerName)`: Join an existing room
   - `startGame()`: Start the game (host only)
   - `markCell(cellIndex)`: Mark a cell on the board
   - `claimVictory()`: Claim victory
   - `clearError()`: Clear error messages

### Return Values

```typescript
{
  socket: TypedSocket | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  roomState: RoomStatePayload | null;
  currentCard: Card | null;
  currentPlayerId: string;
  error: GameError | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  markCell: (cellIndex: number) => void;
  claimVictory: () => void;
  clearError: () => void;
}
```

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `room:create` | `{ name: string }` | Create a new room |
| `room:join` | `{ roomCode: string, name: string }` | Join existing room |
| `room:reconnect` | `{ roomCode: string, playerId: string }` | Reconnect to room |
| `game:start` | `{ roomCode: string }` | Start the game |
| `board:mark` | `{ roomCode: string, cellIndex: number }` | Mark a cell |
| `game:claim` | `{ roomCode: string }` | Claim victory |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room:created` | `{ roomCode, roomState }` | Room created successfully |
| `room:joined` | `{ roomState }` | Joined room successfully |
| `room:reconnected` | `{ roomState }` | Reconnected successfully |
| `room:state` | `RoomStatePayload` | Room state updated |
| `game:started` | `{ roomState }` | Game started |
| `game:card` | `{ card, drawIndex, totalCards, drawnCards }` | New card called |
| `game:winner` | `{ playerId, playerName, roomState }` | Winner declared |
| `player:joined` | `{ id, name }` | Player joined room |
| `player:left` | `{ id }` | Player left room |
| `error` | `{ code, message }` | Error occurred |

## Reconnection Strategy

### Automatic Reconnection

1. When connection is lost, the socket automatically attempts to reconnect
2. Connection status updates to `'reconnecting'`
3. UI shows reconnection indicator
4. On successful reconnection:
   - If room code and player ID are stored, attempts to rejoin room
   - Room state is restored
   - Connection status updates to `'connected'`

### Manual Reconnection

The `room:reconnect` event allows players to manually rejoin a room after disconnection:

```typescript
socket.emit('room:reconnect', {
  roomCode: 'ABC123',
  playerId: 'socket-id-here'
});
```

## Error Handling

### Error Types

All errors follow the `GameError` interface:

```typescript
interface GameError {
  code: string;
  message: string;
}
```

### Common Error Codes

- `CONNECTION_ERROR`: Failed to connect to server
- `ROOM_NOT_FOUND`: Room doesn't exist
- `ROOM_FULL`: Room has 8 players
- `INVALID_ROOM_CODE`: Invalid room code format
- `DUPLICATE_NAME`: Name already taken
- `NOT_HOST`: Action requires host privileges
- `GAME_ALREADY_STARTED`: Game already in progress
- `INVALID_CLAIM`: Victory claim is invalid

### Error Display

Errors are displayed in a dismissible notification in the top-right corner of the screen.

## Usage Example

```typescript
import { useSocket } from './hooks/useSocket';

function MyComponent() {
  const {
    connectionStatus,
    roomState,
    currentCard,
    error,
    createRoom,
    joinRoom,
  } = useSocket();

  const handleCreate = () => {
    createRoom('Player Name');
  };

  const handleJoin = () => {
    joinRoom('ABC123', 'Player Name');
  };

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      {error && <p>Error: {error.message}</p>}
      <button onClick={handleCreate}>Create Room</button>
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
}
```

## Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_SOCKET_URL=http://localhost:3000
```

For production, update this to your deployed backend URL.

## Testing

To test the WebSocket integration:

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the frontend dev server:
   ```bash
   cd client && npm run dev
   ```

3. Open multiple browser windows to test multiplayer functionality

4. Check browser console for connection logs and event messages

## Troubleshooting

### Connection Issues

- Verify backend server is running
- Check `VITE_SOCKET_URL` environment variable
- Check browser console for connection errors
- Verify CORS settings on backend

### Reconnection Issues

- Check browser network tab for WebSocket connection
- Verify room code and player ID are being stored correctly
- Check server logs for reconnection attempts

### State Sync Issues

- Verify all Socket.IO events are being handled
- Check that room state updates are being emitted by server
- Verify event payload structures match TypeScript interfaces
