import React, { useState } from 'react';
import { RoomStatePayload, Card } from '../../../shared/types';
import { CurrentCard } from './CurrentCard';
import { GameBoard } from './GameBoard';

interface GameProps {
  roomState: RoomStatePayload;
  currentPlayerId: string;
  currentCard: Card | null;
  onMarkCell: (cellIndex: number) => void;
  onClaim: () => void;
}

export const Game: React.FC<GameProps> = ({ 
  roomState, 
  currentPlayerId, 
  currentCard,
  onMarkCell,
  onClaim
}) => {
  const [showClaimConfirm, setShowClaimConfirm] = useState(false);
  
  const currentPlayer = roomState.players.find(p => p.id === currentPlayerId);
  const isGameEnded = roomState.status === 'ENDED';
  const winner = roomState.winnerId 
    ? roomState.players.find(p => p.id === roomState.winnerId)
    : null;

  const handleClaimClick = () => {
    setShowClaimConfirm(true);
  };

  const handleConfirmClaim = () => {
    setShowClaimConfirm(false);
    onClaim();
  };

  const handleCancelClaim = () => {
    setShowClaimConfirm(false);
  };

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-dia-purple mb-2">
            🎲 Lotería del Mictlán 💀
          </h1>
          <p className="text-sm text-gray-600">
            Sala: <span className="font-semibold">{roomState.code}</span>
          </p>
        </div>

        {/* Winner Announcement */}
        {isGameEnded && winner && (
          <div className="mb-6 p-6 bg-gradient-to-r from-dia-orange to-dia-purple rounded-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              🎉 ¡LOTERÍA! 🎉
            </h2>
            <p className="text-xl text-white">
              {winner.id === currentPlayerId ? '¡Ganaste!' : `${winner.name} ganó la partida`}
            </p>
          </div>
        )}

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
              onClick={handleClaimClick}
              className="bg-dia-orange hover:bg-orange-500 text-white font-bold text-2xl py-4 px-12 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ¡LOTERÍA! 🎊
            </button>
          </div>
        )}

        {/* Claim Confirmation Modal */}
        {showClaimConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ¿Estás seguro?
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Tienes todas las cartas marcadas correctamente?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelClaim}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmClaim}
                  className="flex-1 bg-dia-orange hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  ¡Sí, Lotería!
                </button>
              </div>
            </div>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Jugadores ({roomState.players.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {roomState.players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg border ${
                  player.id === currentPlayerId
                    ? 'border-dia-purple bg-dia-purple bg-opacity-10'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {player.isHost ? '👑' : '🎭'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
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
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer font-semibold text-gray-800">
                Cartas cantadas ({roomState.drawnCards.length})
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {roomState.drawnCards.map((cardId, index) => {
                  const card = require('../../../shared/types/deck').getCardById(cardId);
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-white px-2 py-1 rounded border border-gray-200 text-sm"
                    >
                      <span>{card?.emoji}</span>
                      <span className="text-gray-700">{card?.name}</span>
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
