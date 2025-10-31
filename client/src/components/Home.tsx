import React, { useState } from 'react';

interface HomeProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    setError('');
    onCreateRoom(playerName.trim());
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    if (!roomCode.trim()) {
      setError('Por favor ingresa el código de sala');
      return;
    }
    setError('');
    onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-dia-purple mb-2">
            🎲 Lotería del Mictlán 💀
          </h1>
          <p className="text-gray-600 text-lg">
            Juego de Lotería Mexicana
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Player Name Input */}
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
            Tu Nombre
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresa tu nombre"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dia-purple focus:border-transparent"
            maxLength={20}
          />
        </div>

        {/* Create Room Form */}
        <form onSubmit={handleCreateRoom} className="mb-6">
          <button
            type="submit"
            className="w-full bg-dia-orange hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Crear Nueva Sala
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Join Room Form */}
        <form onSubmit={handleJoinRoom}>
          <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
            Código de Sala
          </label>
          <input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dia-purple focus:border-transparent mb-4"
            maxLength={6}
          />
          <button
            type="submit"
            className="w-full bg-dia-purple hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Unirse a Sala
          </button>
        </form>
      </div>
    </div>
  );
};
