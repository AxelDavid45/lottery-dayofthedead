import { useEffect } from 'react';
import { Home, Lobby, Game } from './components';
import { useSocket } from './hooks/useSocket';

function App() {
  const {
    connectionStatus,
    roomState,
    currentCard,
    currentPlayerId,
    error,
    createRoom,
    joinRoom,
    startGame,
    markCell,
    claimVictory,
    clearError,
    leaveRoom,
    resetGame,
  } = useSocket();

  // Determine current view based on room state
  const getCurrentView = () => {
    if (!roomState) return 'home';
    if (roomState.status === 'WAITING') return 'lobby';
    if (roomState.status === 'RUNNING' || roomState.status === 'ENDED') return 'game';
    return 'home';
  };

  const view = getCurrentView();

  // Show connection status
  useEffect(() => {
    if (connectionStatus === 'reconnecting') {
      console.log('Reconnecting to server...');
    }
  }, [connectionStatus]);

  return (
    <>
      {/* Connection Status Indicator */}
      {connectionStatus === 'reconnecting' && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          Reconectando al servidor...
        </div>
      )}

      {connectionStatus === 'disconnected' && roomState && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          Desconectado del servidor
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error.message}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Views */}
      {view === 'home' && (
        <Home
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
        />
      )}

      {view === 'lobby' && roomState && (
        <Lobby
          roomState={roomState}
          currentPlayerId={currentPlayerId}
          onStartGame={startGame}
          onLeaveRoom={leaveRoom}
        />
      )}

      {view === 'game' && roomState && (
        <Game
          roomState={roomState}
          currentPlayerId={currentPlayerId}
          currentCard={currentCard}
          onMarkCell={markCell}
          onClaim={claimVictory}
          onLeaveRoom={leaveRoom}
          onResetGame={resetGame}
        />
      )}
    </>
  );
}

export default App;