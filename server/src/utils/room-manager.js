import { v4 as uuidv4 } from "uuid";
import { boardGenerator, generateBoardsForRoom } from './board-generator.js';

// Room management utilities
export class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map(); // Track which room each player is in

    // Clean up expired rooms every 30 minutes
    setInterval(() => {
      this.cleanupExpiredRooms();
    }, 30 * 60 * 1000);
  }

  // Generate unique room code (5-6 characters)
  generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = Math.random() < 0.5 ? 5 : 6; // Randomly choose 5 or 6 characters
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Validate room code format
  isValidRoomCode(code) {
    if (!code || typeof code !== 'string') return false;
    const trimmedCode = code.trim().toUpperCase();
    return /^[A-Z0-9]{5,6}$/.test(trimmedCode);
  }

  // Create new room
  createRoom(hostId, hostName) {
    const roomCode = this.generateRoomCode();

    // Ensure unique room code
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const roomState = {
      id: uuidv4(),
      code: roomCode,
      status: "WAITING",
      hostId: hostId,
      deck: [],
      drawIndex: 0,
      drawnCards: new Set(),
      players: new Map(),
      winnerId: null,
      createdAt: Date.now(),
      gameInterval: null,
    };

    // Add host as first player
    const hostPlayer = {
      id: hostId,
      name: hostName,
      board: [],
      marks: new Array(16).fill(false),
      isHost: true,
      isConnected: true,
    };

    roomState.players.set(hostId, hostPlayer);
    this.rooms.set(roomCode, roomState);
    this.playerRooms.set(hostId, roomCode);

    console.log(`Room created: ${roomCode} by ${hostName}`);
    return roomCode;
  }

  // Join existing room
  joinRoom(roomCode, playerId, playerName) {
    if (!this.isValidRoomCode(roomCode)) {
      throw new Error("INVALID_ROOM_CODE");
    }

    const room = this.rooms.get(roomCode);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    if (room.players.size >= 8) {
      throw new Error("ROOM_FULL");
    }

    if (room.status !== "WAITING") {
      throw new Error("GAME_IN_PROGRESS");
    }

    // Check if name is already taken
    for (const player of room.players.values()) {
      if (player.name === playerName && player.id !== playerId) {
        throw new Error("NAME_TAKEN");
      }
    }

    const player = {
      id: playerId,
      name: playerName,
      board: [],
      marks: new Array(16).fill(false),
      isHost: false,
      isConnected: true,
    };

    room.players.set(playerId, player);
    this.playerRooms.set(playerId, roomCode);

    console.log(`Player ${playerName} joined room ${roomCode}`);
    return room;
  }

  // Remove player from room
  removePlayer(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    room.players.delete(playerId);
    this.playerRooms.delete(playerId);

    console.log(`Player ${player.name} left room ${roomCode}`);

    // If room is empty, clean it up
    if (room.players.size === 0) {
      if (room.gameInterval) {
        clearInterval(room.gameInterval);
      }
      this.rooms.delete(roomCode);
      console.log(`Room ${roomCode} deleted (empty)`);
      return;
    }

    // If host left, assign new host
    if (player.isHost && room.players.size > 0) {
      const newHost = room.players.values().next().value;
      newHost.isHost = true;
      room.hostId = newHost.id;
      console.log(`New host assigned: ${newHost.name} in room ${roomCode}`);
    }
  }

  // Get room by code
  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  // Get room by player ID
  getRoomByPlayer(playerId) {
    const roomCode = this.playerRooms.get(playerId);
    return roomCode ? this.rooms.get(roomCode) : null;
  }

  // Clean up expired rooms (TTL: 2 hours)
  cleanupExpiredRooms() {
    const now = Date.now();
    const TTL = 2 * 60 * 60 * 1000; // 2 hours

    for (const [roomCode, room] of this.rooms.entries()) {
      if (now - room.createdAt > TTL) {
        if (room.gameInterval) {
          clearInterval(room.gameInterval);
        }

        // Remove all players from tracking
        for (const playerId of room.players.keys()) {
          this.playerRooms.delete(playerId);
        }

        this.rooms.delete(roomCode);
        console.log(`Room ${roomCode} expired and deleted`);
      }
    }
  }

  // Start game and generate unique boards for all players
  startGame(roomCode, hostId) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    if (room.hostId !== hostId) {
      throw new Error("NOT_HOST");
    }

    if (room.status !== "WAITING") {
      throw new Error("GAME_ALREADY_STARTED");
    }

    if (room.players.size < 2) {
      throw new Error("INSUFFICIENT_PLAYERS");
    }

    try {
      // Generate unique boards for all players
      const { shuffledDeck, boards } = generateBoardsForRoom(room.players.size);
      
      // Assign boards to players
      let boardIndex = 0;
      for (const player of room.players.values()) {
        player.board = boards[boardIndex];
        player.marks = new Array(16).fill(false); // Reset marks
        boardIndex++;
      }

      // Set up game state
      room.deck = shuffledDeck;
      room.drawIndex = 0;
      room.drawnCards = new Set();
      room.status = "RUNNING";
      room.winnerId = null;

      console.log(`Game started in room ${roomCode} with ${room.players.size} players`);
      console.log(`Boards generated: ${boards.length}, Deck shuffled: ${shuffledDeck.length} cards`);
      
      return room;
    } catch (error) {
      console.error(`Failed to start game in room ${roomCode}:`, error);
      throw new Error("BOARD_GENERATION_FAILED");
    }
  }

  // Validate that a player's board is valid
  validatePlayerBoard(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    const player = room.players.get(playerId);
    if (!player) return false;

    return boardGenerator.validateBoard(player.board);
  }

  // Check if all players have unique boards
  validateAllBoardsUnique(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    const boards = Array.from(room.players.values()).map(player => player.board);
    
    // Check each board against every other board
    for (let i = 0; i < boards.length; i++) {
      for (let j = i + 1; j < boards.length; j++) {
        if (!boardGenerator.areBoardsDifferent(boards[i], boards[j])) {
          console.error(`Duplicate boards found in room ${roomCode}`);
          return false;
        }
      }
    }

    return true;
  }

  // Get room statistics
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalPlayers: this.playerRooms.size,
      activeGames: Array.from(this.rooms.values()).filter(
        (room) => room.status === "RUNNING"
      ).length,
      boardGeneratorStats: boardGenerator.getStats()
    };
  }
}
