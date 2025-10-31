import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';

// Type-safe socket instance
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Socket configuration
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Create socket instance with auto-reconnection
let socket: TypedSocket | null = null;

export const getSocket = (): TypedSocket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });
  }
  return socket;
};

export const connectSocket = (): TypedSocket => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};
