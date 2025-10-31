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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-dia-purple mb-4 font-atkinson">
            🎲 Lotería del Mictlán 💀
          </h1>
          <div className="mt-6 p-6 bg-gradient-to-r from-dia-orange to-dia-purple rounded-2xl shadow-xl">
            <p className="text-sm text-white text-opacity-90 mb-2 font-inter font-medium">Código de Sala</p>
            <p className="text-4xl font-bold text-white tracking-widest font-atkinson">
              {roomState.code}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-8 text-center">
          <div className="inline-block px-6 py-3 bg-white rounded-full shadow-md">
            <p className="text-lg text-gray-700 font-medium font-inter">
              {roomState.status === 'WAITING' && '⏳ Esperando jugadores...'}
              {roomState.status === 'RUNNING' && '🎮 Juego en progreso'}
              {roomState.status === 'ENDED' && '🏁 Juego terminado'}
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 font-inter">
            Jugadores ({roomState.players.length}/8)
          </h2>
          <div className="space-y-3">
            {roomState.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  player.id === currentPlayerId
                    ? 'border-dia-purple bg-gradient-to-r from-purple-50 to-purple-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {player.isHost ? '👑' : '🎭'}
                    </span>
                    <div>
                      <p className="font-bold text-gray-800 font-inter">
                        {player.name}
                        {player.id === currentPlayerId && ' (Tú)'}
                      </p>
                      {player.isHost && (
                        <p className="text-sm text-dia-orange font-semibold">Anfitrión</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {player.isConnected ? (
                      <span className="inline-flex items-center">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="ml-2 text-xs text-green-600 font-medium">En línea</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
                        <span className="ml-2 text-xs text-gray-500 font-medium">Desconectado</span>
                      </span>
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
              className={`w-full py-5 px-6 rounded-xl font-bold text-white text-lg transition-all duration-200 font-inter ${
                canStart
                  ? 'bg-dia-orange hover:bg-orange-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              {canStart
                ? '🎮 Iniciar Partida'
                : '⏳ Se necesitan al menos 2 jugadores'}
            </button>
          </div>
        )}

        {/* Waiting Message (Non-Host) */}
        {!isHost && roomState.status === 'WAITING' && (
          <div className="text-center p-6 bg-white rounded-xl shadow-md border-2 border-gray-200">
            <p className="text-gray-600 font-medium font-inter">
              ⏳ Esperando a que el anfitrión inicie la partida...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
