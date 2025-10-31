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
  leaveRoom: () => void;
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
  const reconnectAttemptedRef = useRef<boolean>(false);

  // Load persisted session data on mount
  useEffect(() => {
    const savedRoomCode = localStorage.getItem('loteria_room_code');
    const savedPlayerId = localStorage.getItem('loteria_player_id');
    
    if (savedRoomCode && savedPlayerId) {
      roomCodeRef.current = savedRoomCode;
      playerIdRef.current = savedPlayerId;
      console.log('Loaded session data:', { roomCode: savedRoomCode, playerId: savedPlayerId });
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = connectSocket();
    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnectionStatus('connected');
      
      // Attempt reconnection if we have saved session data
      const savedRoomCode = roomCodeRef.current || localStorage.getItem('loteria_room_code');
      const savedPlayerId = playerIdRef.current || localStorage.getItem('loteria_player_id');
      
      if (savedRoomCode && savedPlayerId && !reconnectAttemptedRef.current) {
        console.log('Attempting to reconnect to room:', savedRoomCode);
        reconnectAttemptedRef.current = true;
        setConnectionStatus('reconnecting');
        
        socketInstance.emit('room:reconnect', {
          roomCode: savedRoomCode,
          playerId: savedPlayerId,
        });
      } else {
        setCurrentPlayerId(socketInstance.id || '');
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
      reconnectAttemptedRef.current = false;
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
      
      // Find current player in room state
      const currentPlayer = data.roomState.players.find((p: any) => p.id === socketInstance.id);
      if (currentPlayer) {
        playerIdRef.current = currentPlayer.id;
        setCurrentPlayerId(currentPlayer.id);
        
        // Persist session data
        localStorage.setItem('loteria_room_code', data.roomCode);
        localStorage.setItem('loteria_player_id', currentPlayer.id);
      }
      
      setRoomState(data.roomState);
      setError(null);
      reconnectAttemptedRef.current = false;
    });

    socketInstance.on('room:joined', (data) => {
      console.log('Room joined');
      roomCodeRef.current = data.roomState.code;
      
      // Find current player in room state
      const currentPlayer = data.roomState.players.find((p: any) => p.id === socketInstance.id);
      if (currentPlayer) {
        playerIdRef.current = currentPlayer.id;
        setCurrentPlayerId(currentPlayer.id);
        
        // Persist session data
        localStorage.setItem('loteria_room_code', data.roomState.code);
        localStorage.setItem('loteria_player_id', currentPlayer.id);
      }
      
      setRoomState(data.roomState);
      setError(null);
      reconnectAttemptedRef.current = false;
    });

    socketInstance.on('room:reconnected', (data) => {
      console.log('Room reconnected successfully');
      roomCodeRef.current = data.roomState.code;
      playerIdRef.current = data.playerId;
      setCurrentPlayerId(data.playerId);
      setRoomState(data.roomState);
      setConnectionStatus('connected');
      setError(null);
      reconnectAttemptedRef.current = false;
      
      // Update persisted session data
      localStorage.setItem('loteria_room_code', data.roomState.code);
      localStorage.setItem('loteria_player_id', data.playerId);
    });

    socketInstance.on('room:state', (data) => {
      console.log('Room state updated:', {
        players: data.players.length,
        status: data.status,
        code: data.code
      });
      setRoomState(data);
    });

    // Game event handlers
    socketInstance.on('game:started', (data) => {
      console.log('Game started', {
        players: data.roomState.players.length,
        status: data.roomState.status,
        playersWithBoards: data.roomState.players.filter((p: any) => p.board && p.board.length > 0).length
      });
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

    // Player event handlers (informational only - room:state handles actual updates)
    socketInstance.on('player:joined', (data) => {
      console.log('🎭 Player joined:', data.name);
    });

    socketInstance.on('player:left', (data) => {
      console.log('👋 Player left:', data.id);
    });

    socketInstance.on('player:disconnected', (data) => {
      console.log('🔌 Player disconnected:', data.playerName);
    });

    socketInstance.on('player:reconnected', (data) => {
      console.log('🔄 Player reconnected:', data.playerName);
    });

    socketInstance.on('player:removed', (data) => {
      console.log('❌ Player removed after timeout:', data.playerName);
    });

    // Error handler
    socketInstance.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data);
      
      // If reconnection failed, clear session data
      if (data.code === 'RECONNECT_FAILED' || data.code === 'ROOM_NOT_FOUND' || data.code === 'PLAYER_NOT_FOUND') {
        console.log('Clearing session data due to reconnection failure');
        localStorage.removeItem('loteria_room_code');
        localStorage.removeItem('loteria_player_id');
        roomCodeRef.current = '';
        playerIdRef.current = '';
        reconnectAttemptedRef.current = false;
        setConnectionStatus('connected');
      }
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
      socketInstance.off('player:disconnected');
      socketInstance.off('player:reconnected');
      socketInstance.off('player:removed');
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

  const leaveRoom = useCallback(() => {
    // Clear session data when intentionally leaving
    localStorage.removeItem('loteria_room_code');
    localStorage.removeItem('loteria_player_id');
    roomCodeRef.current = '';
    playerIdRef.current = '';
    reconnectAttemptedRef.current = false;
    setRoomState(null);
    setCurrentCard(null);
    setError(null);
    console.log('Left room and cleared session data');
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
    leaveRoom,
  };
};
