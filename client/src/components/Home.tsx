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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-dia-purple mb-3 font-atkinson">
            🎲 Lotería del Mictlán 💀
          </h1>
          <p className="text-gray-600 text-lg font-inter">
            Juego de Lotería Mexicana
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-xl shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Player Name Input */}
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-sm font-semibold text-gray-700 mb-2 font-inter">
            Tu Nombre
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresa tu nombre"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dia-purple focus:border-dia-purple transition-all duration-200 font-inter"
            maxLength={20}
          />
        </div>

        {/* Create Room Form */}
        <form onSubmit={handleCreateRoom} className="mb-6">
          <button
            type="submit"
            className="w-full bg-dia-orange hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-inter"
          >
            🎨 Crear Nueva Sala
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gradient-to-br from-orange-50 via-white to-purple-50 text-gray-500 font-medium">o</span>
          </div>
        </div>

        {/* Join Room Form */}
        <form onSubmit={handleJoinRoom}>
          <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 mb-2 font-inter">
            Código de Sala
          </label>
          <input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dia-purple focus:border-dia-purple mb-4 transition-all duration-200 font-inter uppercase tracking-wider"
            maxLength={6}
          />
          <button
            type="submit"
            className="w-full bg-dia-purple hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-inter"
          >
            🎭 Unirse a Sala
          </button>
        </form>
      </div>
    </div>
  );
};
