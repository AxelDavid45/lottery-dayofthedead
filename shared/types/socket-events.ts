// Socket.IO event types and payloads

import { Card, RoomState, GameError } from './game';

// Cliente → Servidor events
export interface ClientToServerEvents {
  // Crear nueva sala
  'room:create': (data: { name: string }) => void;
  
  // Unirse a sala existente  
  'room:join': (data: { roomCode: string; name: string }) => void;
  
  // Reconectar a sala existente
  'room:reconnect': (data: { roomCode: string; playerId: string }) => void;
  
  // Iniciar partida (solo host)
  'game:start': (data: { roomCode: string }) => void;
  
  // Marcar casilla en tablero
  'board:mark': (data: { roomCode: string; cellIndex: number }) => void;
  
  // Reclamar victoria
  'game:claim': (data: { roomCode: string }) => void;
  
  // Desconexión
  'disconnect': () => void;
}

// Servidor → Cliente events
export interface ServerToClientEvents {
  // Sala creada exitosamente
  'room:created': (data: { roomCode: string; roomState: RoomStatePayload }) => void;
  
  // Unión a sala exitosa
  'room:joined': (data: { roomState: RoomStatePayload }) => void;
  
  // Reconexión exitosa
  'room:reconnected': (data: { roomState: RoomStatePayload }) => void;
  
  // Estado actualizado de la sala
  'room:state': (data: RoomStatePayload) => void;
  
  // Nueva carta cantada
  'game:card': (data: { card: Card; drawIndex: number }) => void;
  
  // Anuncio de ganador
  'game:winner': (data: { playerId: string; playerName: string }) => void;
  
  // Jugador se unió
  'player:joined': (data: { id: string; name: string }) => void;
  
  // Jugador se fue
  'player:left': (data: { id: string }) => void;
  
  // Errores
  'error': (data: GameError) => void;
}

// Payload types for complex events
export interface RoomStatePayload {
  id: string;
  code: string;
  status: 'WAITING' | 'RUNNING' | 'ENDED';
  hostId: string;
  players: Array<{
    id: string;
    name: string;
    board: string[];
    marks: boolean[];
    isHost: boolean;
    isConnected: boolean;
  }>;
  currentCard?: Card;
  drawIndex: number;
  drawnCards: string[];
  winnerId?: string;
}

// Inter-server events (for future scaling)
export interface InterServerEvents {
  ping: () => void;
}

// Socket data (attached to each socket)
export interface SocketData {
  playerId?: string;
  roomCode?: string;
  playerName?: string;
}