// Server-specific types and interfaces

import { RoomState, PlayerState, GameError } from '../../../shared/types';

// Extended server room state with additional server-only properties
export interface ServerRoomState extends RoomState {
  gameInterval?: NodeJS.Timeout;
  lastActivity: number;
}

// Server configuration
export interface ServerConfig {
  port: number;
  corsOrigin: string;
  roomTTL: number;
  maxRoomsPerIP: number;
}

// Room manager interface
export interface RoomManager {
  rooms: Map<string, ServerRoomState>;
  createRoom(hostId: string, hostName: string): Promise<string>;
  joinRoom(roomCode: string, playerId: string, playerName: string): Promise<ServerRoomState>;
  removePlayer(roomCode: string, playerId: string): Promise<void>;
  startGame(roomCode: string, hostId: string): Promise<void>;
  markCell(roomCode: string, playerId: string, cellIndex: number): Promise<void>;
  claimVictory(roomCode: string, playerId: string): Promise<boolean>;
  cleanupExpiredRooms(): void;
}

// Game validation results
export interface ValidationResult {
  isValid: boolean;
  error?: GameError;
}

export interface ClaimValidationResult extends ValidationResult {
  isWinner?: boolean;
  playerName?: string;
}

// Server events for internal use
export interface ServerEvents {
  roomCreated: (roomCode: string, hostId: string) => void;
  playerJoined: (roomCode: string, playerId: string, playerName: string) => void;
  playerLeft: (roomCode: string, playerId: string) => void;
  gameStarted: (roomCode: string) => void;
  cardCalled: (roomCode: string, cardId: string, drawIndex: number) => void;
  gameEnded: (roomCode: string, winnerId: string, winnerName: string) => void;
}

// Utility types for server operations
export type RoomCode = string;
export type PlayerId = string;
export type SocketId = string;

// Server response types
export interface CreateRoomResponse {
  success: boolean;
  roomCode?: string;
  error?: GameError;
}

export interface JoinRoomResponse {
  success: boolean;
  roomState?: ServerRoomState;
  error?: GameError;
}