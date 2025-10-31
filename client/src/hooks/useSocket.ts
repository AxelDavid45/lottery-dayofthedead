import { useEffect, useState, useCallback, useRef } from 'react';
import { connectSocket, disconnectSocket, TypedSocket } from '../utils/socket';
import { RoomStatePayload, Card, GameError } from '../../../shared/types';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface UseSocketReturn {
  socket: TypedSocket | null;
  connectionStatus: ConnectionStatus;
  roomState: RoomStatePayload | null;
  currentCard: Card | null;
  currentPlayerId: string;
  error: GameError | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  markCell: (cellIndex: number) => void;
  claimVictory: () => void;
  clearError: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [roomState, setRoomState] = useState<RoomStatePayload | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [error, setError] = useState<GameError | null>(null);
  
  // Use ref to store room code for reconnection
  const roomCodeRef = useRef<string>('');
  const playerIdRef = useRef<string>('');

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = connectSocket();
    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnectionStatus('connected');
      setCurrentPlayerId(socketInstance.id || '');
      playerIdRef.current = socketInstance.id || '';
      
      // Attempt reconnection if we have room info
      if (roomCodeRef.current && playerIdRef.current) {
        socketInstance.emit('room:reconnect', {
          roomCode: roomCodeRef.current,
          playerId: playerIdRef.current,
        });
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setConnectionStatus('disconnected');
      setError({
        code: 'CONNECTION_ERROR',
        message: 'No se pudo conectar al servidor. Reintentando...',
      });
    });

    socketInstance.io.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
      setConnectionStatus('reconnecting');
    });

    socketInstance.io.on('reconnect', () => {
      console.log('Reconnected successfully');
      setConnectionStatus('connected');
      setError(null);
    });

    socketInstance.io.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      setConnectionStatus('disconnected');
      setError({
        code: 'CONNECTION_ERROR',
        message: 'No se pudo reconectar al servidor',
      });
    });

    // Room event handlers
    socketInstance.on('room:created', (data) => {
      console.log('Room created:', data.roomCode);
      roomCodeRef.current = data.roomCode;
      setRoomState(data.roomState);
      setError(null);
    });

    socketInstance.on('room:joined', (data) => {
      console.log('Room joined');
      roomCodeRef.current = data.roomState.code;
      setRoomState(data.roomState);
      setError(null);
    });

    socketInstance.on('room:reconnected', (data) => {
      console.log('Room reconnected');
      setRoomState(data.roomState);
      setError(null);
    });

    socketInstance.on('room:state', (data) => {
      console.log('Room state updated');
      setRoomState(data);
    });

    // Game event handlers
    socketInstance.on('game:started', (data) => {
      console.log('Game started');
      setRoomState(data.roomState);
      setError(null);
    });

    socketInstance.on('game:card', (data) => {
      console.log('Card called:', data.card.name);
      setCurrentCard(data.card);
      // Update room state with drawn cards
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          drawIndex: data.drawIndex,
          drawnCards: data.drawnCards,
        };
      });
    });

    socketInstance.on('game:winner', (data) => {
      console.log('Winner declared:', data.playerName);
      setRoomState(data.roomState);
      setError(null);
    });

    // Player event handlers
    socketInstance.on('player:joined', (data) => {
      console.log('Player joined:', data.name);
    });

    socketInstance.on('player:left', (data) => {
      console.log('Player left:', data.id);
    });

    // Error handler
    socketInstance.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.off('room:created');
      socketInstance.off('room:joined');
      socketInstance.off('room:reconnected');
      socketInstance.off('room:state');
      socketInstance.off('game:started');
      socketInstance.off('game:card');
      socketInstance.off('game:winner');
      socketInstance.off('player:joined');
      socketInstance.off('player:left');
      socketInstance.off('error');
      disconnectSocket();
    };
  }, []);

  // Action handlers
  const createRoom = useCallback((playerName: string) => {
    if (!socket) return;
    console.log('Creating room for:', playerName);
    socket.emit('room:create', { name: playerName });
  }, [socket]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    if (!socket) return;
    console.log('Joining room:', roomCode);
    socket.emit('room:join', { roomCode, name: playerName });
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket || !roomState) return;
    console.log('Starting game');
    socket.emit('game:start', { roomCode: roomState.code });
  }, [socket, roomState]);

  const markCell = useCallback((cellIndex: number) => {
    if (!socket || !roomState) return;
    console.log('Marking cell:', cellIndex);
    socket.emit('board:mark', { roomCode: roomState.code, cellIndex });
  }, [socket, roomState]);

  const claimVictory = useCallback(() => {
    if (!socket || !roomState) return;
    console.log('Claiming victory');
    socket.emit('game:claim', { roomCode: roomState.code });
  }, [socket, roomState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    socket,
    connectionStatus,
    roomState,
    currentCard,
    currentPlayerId,
    error,
    createRoom,
    joinRoom,
    startGame,
    markCell,
    claimVictory,
    clearError,
  };
};
