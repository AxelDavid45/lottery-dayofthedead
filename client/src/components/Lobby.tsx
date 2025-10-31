import React from 'react';
import { RoomStatePayload } from '../../../shared/types';

interface LobbyProps {
  roomState: RoomStatePayload;
  currentPlayerId: string;
  onStartGame: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ roomState, currentPlayerId, onStartGame }) => {
  const isHost = roomState.hostId === currentPlayerId;
  const canStart = roomState.players.length >= 2;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dia-purple mb-2">
            🎲 Lotería del Mictlán 💀
          </h1>
          <div className="mt-4 p-4 bg-dia-orange bg-opacity-20 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Código de Sala</p>
            <p className="text-3xl font-bold text-dia-purple tracking-wider">
              {roomState.code}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-600">
            {roomState.status === 'WAITING' && 'Esperando jugadores...'}
            {roomState.status === 'RUNNING' && 'Juego en progreso'}
            {roomState.status === 'ENDED' && 'Juego terminado'}
          </p>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Jugadores ({roomState.players.length}/8)
          </h2>
          <div className="space-y-2">
            {roomState.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 ${
                  player.id === currentPlayerId
                    ? 'border-dia-purple bg-dia-purple bg-opacity-10'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {player.isHost ? '👑' : '🎭'}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {player.name}
                        {player.id === currentPlayerId && ' (Tú)'}
                      </p>
                      {player.isHost && (
                        <p className="text-sm text-dia-orange">Anfitrión</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {player.isConnected ? (
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    ) : (
                      <span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button (Host Only) */}
        {isHost && roomState.status === 'WAITING' && (
          <div className="text-center">
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-colors duration-200 ${
                canStart
                  ? 'bg-dia-orange hover:bg-orange-500'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {canStart
                ? 'Iniciar Partida'
                : 'Se necesitan al menos 2 jugadores'}
            </button>
          </div>
        )}

        {/* Waiting Message (Non-Host) */}
        {!isHost && roomState.status === 'WAITING' && (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">
              Esperando a que el anfitrión inicie la partida...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
