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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
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

        {/* Winner Announcement */}
        {isGameEnded && winner && (
          <div className="mb-6 p-8 bg-gradient-to-r from-dia-orange via-orange-400 to-dia-purple rounded-2xl text-center shadow-2xl animate-pulse">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-atkinson drop-shadow-lg">
              🎉 ¡LOTERÍA! 🎉
            </h2>
            <p className="text-2xl md:text-3xl text-white font-bold font-inter">
              {winner.id === currentPlayerId ? '🏆 ¡Ganaste! 🏆' : `🎊 ${winner.name} ganó la partida 🎊`}
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
              className="bg-gradient-to-r from-dia-orange to-orange-500 hover:from-orange-500 hover:to-dia-orange text-white font-bold text-2xl md:text-3xl py-5 px-16 rounded-2xl shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 font-atkinson"
            >
              ¡LOTERÍA! 🎊
            </button>
          </div>
        )}

        {/* Claim Confirmation Modal */}
        {showClaimConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 border-dia-purple">
              <h3 className="text-2xl font-bold text-dia-purple mb-4 font-atkinson">
                ¿Estás seguro?
              </h3>
              <p className="text-gray-700 mb-6 font-inter">
                ¿Tienes todas las cartas marcadas correctamente?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelClaim}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all duration-200 font-inter"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmClaim}
                  className="flex-1 bg-dia-orange hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-inter"
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
          <h3 className="text-lg font-bold text-gray-800 mb-3 font-inter">
            Jugadores ({roomState.players.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {roomState.players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  player.id === currentPlayerId
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
                  const card = require('../../../shared/types/deck').getCardById(cardId);
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
