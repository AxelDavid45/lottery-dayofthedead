// Core game data models and interfaces

export interface Card {
  id: string;          // Identificador único
  name: string;        // Nombre descriptivo
  emoji: string;       // Emoji representativo
  phrase?: string;     // Frase tradicional (opcional)
}

export interface PlayerState {
  id: string;          // Socket ID
  name: string;        // Nombre del jugador
  board: string[];     // 16 cartas del tablero 4x4
  marks: boolean[];    // 16 booleanos para marcas
  isHost: boolean;     // Si es anfitrión
  isConnected: boolean; // Estado de conexión
}

export interface RoomState {
  id: string;                    // UUID único
  code: string;                  // Código de 5-6 caracteres
  status: 'WAITING' | 'RUNNING' | 'ENDED';
  hostId: string;                // Socket ID del anfitrión
  deck: string[];                // Mazo barajado de 24 cartas
  drawIndex: number;             // Índice actual de carta cantada
  drawnCards: Set<string>;       // Cartas ya cantadas
  players: Map<string, PlayerState>;
  winnerId?: string;             // ID del ganador
  createdAt: number;             // Timestamp para TTL
  gameInterval?: NodeJS.Timeout; // Intervalo del juego
}

// Estados de juego
export type GameStatus = 'WAITING' | 'RUNNING' | 'ENDED';

// Tipos para errores
export interface GameError {
  code: string;
  message: string;
}

export type ErrorCode = 
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'INVALID_ROOM_CODE'
  | 'DUPLICATE_NAME'
  | 'NOT_HOST'
  | 'GAME_ALREADY_STARTED'
  | 'INVALID_CLAIM'
  | 'CONNECTION_ERROR';