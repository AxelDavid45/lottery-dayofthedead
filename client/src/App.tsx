import { useState } from 'react';
import { Home, Lobby, Game } from './components';
import { RoomStatePayload, Card } from '../../shared/types';

type AppView = 'home' | 'lobby' | 'game';

function App() {
  const [view] = useState<AppView>('home');
  const [roomState] = useState<RoomStatePayload | null>(null);
  const [currentPlayerId] = useState<string>('');
  const [currentCard] = useState<Card | null>(null);
  
  // State setters will be used in Task 9 for Socket.IO integration

  // Placeholder handlers - will be replaced with Socket.IO in task 9
  const handleCreateRoom = (playerName: string) => {
    console.log('Creating room for:', playerName);
    // TODO: Implement Socket.IO room creation
    alert('Socket.IO integration pending (Task 9)');
  };

  const handleJoinRoom = (roomCode: string, playerName: string) => {
    console.log('Joining room:', roomCode, 'as:', playerName);
    // TODO: Implement Socket.IO room join
    alert('Socket.IO integration pending (Task 9)');
  };

  const handleStartGame = () => {
    console.log('Starting game');
    // TODO: Implement Socket.IO game start
    alert('Socket.IO integration pending (Task 9)');
  };

  const handleMarkCell = (cellIndex: number) => {
    console.log('Marking cell:', cellIndex);
    // TODO: Implement Socket.IO cell marking
  };

  const handleClaim = () => {
    console.log('Claiming victory');
    // TODO: Implement Socket.IO victory claim
  };

  return (
    <>
      {view === 'home' && (
        <Home 
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {view === 'lobby' && roomState && (
        <Lobby
          roomState={roomState}
          currentPlayerId={currentPlayerId}
          onStartGame={handleStartGame}
        />
      )}

      {view === 'game' && roomState && (
        <Game
          roomState={roomState}
          currentPlayerId={currentPlayerId}
          currentCard={currentCard}
          onMarkCell={handleMarkCell}
          onClaim={handleClaim}
        />
      )}
    </>
  );
}

export default App;