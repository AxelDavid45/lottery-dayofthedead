// Client-specific types and interfaces

import { Card, PlayerState, GameStatus } from '../../../shared/types';

// Client-side room state (simplified from server RoomState)
export interface ClientRoomState {
  id: string;
  code: string;
  status: GameStatus;
  hostId: string;
  players: PlayerState[];
  currentCard?: Card;
  drawIndex: number;
  drawnCards: string[];
  winnerId?: string;
}

// UI component props
export interface GameBoardProps {
  board: string[];
  marks: boolean[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

export interface CurrentCardProps {
  card?: Card;
  drawIndex: number;
  totalCards: number;
}

export interface PlayerListProps {
  players: PlayerState[];
  currentPlayerId: string;
}

export interface ClaimButtonProps {
  onClaim: () => void;
  disabled?: boolean;
}

// Form data types
export interface CreateRoomFormData {
  playerName: string;
}

export interface JoinRoomFormData {
  playerName: string;
  roomCode: string;
}

// App state types
export interface AppState {
  currentView: 'home' | 'lobby' | 'game';
  playerId?: string;
  playerName?: string;
  roomState?: ClientRoomState;
  isConnected: boolean;
  error?: string;
}

// Socket connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';