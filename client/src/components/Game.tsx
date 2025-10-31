import React, { useState } from 'react';
import { RoomStatePayload, Card } from '../../../shared/types';
import { getCardById } from '../../../shared/types/deck';
import { CurrentCard } from './CurrentCard';
import { GameBoard } from './GameBoard';

interface GameProps {
  roomState: RoomStatePayload;
  currentPlayerId: string;
  currentCard: Card | null;
  onMarkCell: (cellIndex: number) => void;
  onClaim: () => void;
  onLeaveRoom: () => void;
  onResetGame: () => void;
}

export const Game: React.FC<GameProps> = ({
  roomState,
  currentPlayerId,
  currentCard,
  onMarkCell,
  onClaim,
  onLeaveRoom,
  onResetGame
}) => {
  const currentPlayer = roomState.players.find(p => p.id === currentPlayerId);
  const isGameEnded = roomState.status === 'ENDED';
  const winner = roomState.winnerId
    ? roomState.players.find(p => p.id === roomState.winnerId)
    : null;
  const isHost = currentPlayer?.isHost || false;
  const [isResetting, setIsResetting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleResetGame = () => {
    setIsResetting(true);
    try {
      onResetGame();
    } catch (err) {
      console.error('Error resetting game:', err);
    } finally {
      // Reset button state after a short delay
      setTimeout(() => setIsResetting(false), 1000);
    }
  };

  const handleLeaveRoom = () => {
    setIsLeaving(true);
    try {
      onLeaveRoom();
    } catch (err) {
      console.error('Error leaving room:', err);
    }
    // Don't reset leaving state as we're navigating away
  };

  // Debug logging
  console.log('Game component render:', {
    currentPlayerId,
    currentPlayer: currentPlayer ? {
      id: currentPlayer.id,
      name: currentPlayer.name,
      boardLength: currentPlayer.board?.length || 0,
      marksLength: currentPlayer.marks?.length || 0
    } : null,
    roomStatus: roomState.status,
    totalPlayers: roomState.players.length
  });

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Winner Modal - Full Screen Overlay */}
      {isGameEnded && winner && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-br from-dia-orange via-orange-400 to-dia-purple rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl transform animate-scaleIn">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">
                {winner.id === currentPlayerId ? '🏆' : '🎊'}
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 font-atkinson drop-shadow-2xl animate-pulse">
                ¡LOTERÍA!
              </h2>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <p className="text-3xl md:text-4xl text-white font-bold font-inter">
                  {winner.id === currentPlayerId
                    ? '¡Felicidades, ganaste!'
                    : `${winner.name} ganó la partida`}
                </p>
              </div>
              <div className="flex justify-center space-x-4 text-6xl animate-bounce mb-8">
                🎉 💀 🎊 🌼 🎺
              </div>

              {/* Post-Game Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                {isHost && (
                  <button
                    onClick={handleResetGame}
                    disabled={isResetting}
                    className="w-full sm:w-auto bg-gradient-to-r from-dia-orange to-orange-500 hover:from-orange-500 hover:to-dia-orange text-white font-bold text-xl py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 font-inter disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isResetting ? '⏳ Reiniciando...' : '🎮 Jugar de Nuevo'}
                  </button>
                )}
                <button
                  onClick={handleLeaveRoom}
                  disabled={isLeaving}
                  className="w-full sm:w-auto bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 font-bold text-xl py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 font-inter disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLeaving ? '⏳ Saliendo...' : '🚪 Salir de la Sala'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-dia-purple mb-2 font-atkinson">
            🎲 Lotería del Mictlán 💀
          </h1>
          <p className="text-sm text-gray-600 font-inter">
            Sala: <span className="font-bold text-dia-purple">{roomState.code}</span>
          </p>
        </div>

        {/* Current Card Display */}
        <div className="mb-6">
          <CurrentCard
            card={currentCard}
            drawIndex={roomState.drawIndex}
            totalCards={24}
          />
        </div>

        {/* Lotería Button */}
        {!isGameEnded && (
          <div className="mb-6 text-center">
            <button
              onClick={onClaim}
              className="bg-gradient-to-r from-dia-orange to-orange-500 hover:from-orange-500 hover:to-dia-orange text-white font-bold text-2xl md:text-3xl py-5 px-16 rounded-2xl shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 font-atkinson"
            >
              ¡LOTERÍA! 🎊
            </button>
          </div>
        )}

        {/* Game Board */}
        <div className="mb-6">
          <GameBoard
            board={currentPlayer.board}
            marks={currentPlayer.marks}
            onCellClick={onMarkCell}
            disabled={isGameEnded}
          />
        </div>

        {/* Players Status */}
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800 font-inter">
              Jugadores ({roomState.players.length})
            </h3>
            {/* Leave Room button always available */}
            <button
              onClick={handleLeaveRoom}
              disabled={isLeaving}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 font-inter disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLeaving ? '⏳ Saliendo...' : '🚪 Salir'}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {roomState.players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${player.id === currentPlayerId
                  ? 'border-dia-purple bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                  : 'border-gray-200 bg-white'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">
                    {player.isHost ? '👑' : '🎭'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate font-inter">
                      {player.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drawn Cards History */}
        {roomState.drawnCards.length > 0 && (
          <div className="max-w-2xl mx-auto mt-6">
            <details className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-md">
              <summary className="cursor-pointer font-bold text-gray-800 font-inter hover:text-dia-purple transition-colors">
                📋 Cartas cantadas ({roomState.drawnCards.length})
              </summary>
              <div className="mt-4 flex flex-wrap gap-2">
                {roomState.drawnCards.map((cardId, index) => {
                  const card = getCardById(cardId);
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-gradient-to-r from-orange-50 to-purple-50 px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:border-dia-orange transition-colors"
                    >
                      <span className="text-lg">{card?.emoji}</span>
                      <span className="text-gray-700 font-inter">{card?.name}</span>
                    </span>
                  );
                })}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
