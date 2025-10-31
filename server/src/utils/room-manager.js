import { v4 as uuidv4 } from "uuid";
import { boardGenerator, generateBoardsForRoom } from './board-generator.js';
import { DECK, GAME_CONSTANTS, getCardById } from '../../../shared/types/deck.js';
import { validateVictory, processClaim, getBoardStats } from './victory-validator.js';

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

  // Mark player as disconnected (but keep in room for potential reconnection)
  markPlayerDisconnected(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.isConnected = false;
    console.log(`Player ${player.name} marked as disconnected in room ${roomCode}`);

    // If host disconnected and game is waiting, reassign host to first connected player
    if (player.isHost && room.status === 'WAITING') {
      const connectedPlayers = Array.from(room.players.values()).filter(p => p.isConnected);
      if (connectedPlayers.length > 0) {
        const newHost = connectedPlayers[0];
        player.isHost = false;
        newHost.isHost = true;
        room.hostId = newHost.id;
        console.log(`Host reassigned to ${newHost.name} in room ${roomCode} (previous host disconnected)`);
      }
    }
  }

  // Reconnect a player to a room
  reconnectPlayer(roomCode, oldPlayerId, newSocketId) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      console.log(`Reconnect failed: Room ${roomCode} not found`);
      return null;
    }

    const player = room.players.get(oldPlayerId);
    if (!player) {
      console.log(`Reconnect failed: Player ${oldPlayerId} not found in room ${roomCode}`);
      console.log(`Available players:`, Array.from(room.players.keys()));
      return null;
    }

    console.log(`Reconnecting player ${player.name} from ${oldPlayerId} to ${newSocketId}`);

    // Update player's socket ID and connection status
    player.id = newSocketId;
    player.isConnected = true;

    // Update tracking maps
    room.players.delete(oldPlayerId);
    room.players.set(newSocketId, player);
    this.playerRooms.delete(oldPlayerId);
    this.playerRooms.set(newSocketId, roomCode);

    // If this was the host, update host ID
    if (player.isHost) {
      room.hostId = newSocketId;
      console.log(`Host ID updated to ${newSocketId}`);
    }

    console.log(`Player ${player.name} successfully reconnected with new socket ID: ${newSocketId}`);
    return room;
  }

  // Clean up disconnected player after timeout
  cleanupDisconnectedPlayer(roomCode, playerId, io) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    // Only remove if still disconnected
    if (!player.isConnected) {
      const playerName = player.name;
      room.players.delete(playerId);
      this.playerRooms.delete(playerId);

      console.log(`Player ${playerName} removed from room ${roomCode} after timeout`);

      // If room is empty, clean it up
      if (room.players.size === 0) {
        this.stopCardCalling(roomCode);
        this.rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted (empty after cleanup)`);
        return;
      }

      // If host was removed, assign new host
      if (player.isHost && room.players.size > 0) {
        const connectedPlayers = Array.from(room.players.values()).filter(p => p.isConnected);
        if (connectedPlayers.length > 0) {
          const newHost = connectedPlayers[0];
          newHost.isHost = true;
          room.hostId = newHost.id;
          console.log(`New host assigned: ${newHost.name} in room ${roomCode} (after cleanup)`);
        }
      }

      // Notify remaining players
      if (io) {
        io.to(roomCode).emit("player:removed", {
          playerId: playerId,
          playerName: playerName,
        });
        io.to(roomCode).emit("room:state", this.serializeRoomState(room));
      }
    }
  }

  // Remove player from room (immediate removal, used for explicit leave)
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
      this.stopCardCalling(roomCode);
      this.rooms.delete(roomCode);
      console.log(`Room ${roomCode} deleted (empty)`);
      return;
    }

    // If host left, assign new host
    if (player.isHost && room.players.size > 0) {
      const connectedPlayers = Array.from(room.players.values()).filter(p => p.isConnected);
      if (connectedPlayers.length > 0) {
        const newHost = connectedPlayers[0];
        newHost.isHost = true;
        room.hostId = newHost.id;
        console.log(`New host assigned: ${newHost.name} in room ${roomCode}`);
      } else {
        // If no connected players, assign to first player
        const newHost = room.players.values().next().value;
        newHost.isHost = true;
        room.hostId = newHost.id;
        console.log(`New host assigned: ${newHost.name} in room ${roomCode} (no connected players)`);
      }
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
        this.stopCardCalling(roomCode);

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
  startGame(roomCode, hostId, io) {
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

      // Start card calling loop
      this.startCardCalling(roomCode, io);

      console.log(`Game started in room ${roomCode} with ${room.players.size} players`);
      console.log(`Boards generated: ${boards.length}, Deck shuffled: ${shuffledDeck.length} cards`);
      
      return room;
    } catch (error) {
      console.error(`Failed to start game in room ${roomCode}:`, error);
      throw new Error("BOARD_GENERATION_FAILED");
    }
  }

  // Start the card calling loop for a room
  startCardCalling(roomCode, io) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== "RUNNING") {
      return;
    }

    // Clear any existing interval
    if (room.gameInterval) {
      clearInterval(room.gameInterval);
    }

    // Start calling cards every 4 seconds
    room.gameInterval = setInterval(() => {
      this.callNextCard(roomCode, io);
    }, GAME_CONSTANTS.CARD_INTERVAL);

    // Call the first card immediately
    this.callNextCard(roomCode, io);

    console.log(`Card calling started for room ${roomCode}`);
  }

  // Call the next card in the deck
  callNextCard(roomCode, io) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== "RUNNING") {
      return;
    }

    // Check if we've called all cards
    if (room.drawIndex >= room.deck.length) {
      console.log(`All cards called in room ${roomCode}, game continues until winner`);
      return;
    }

    // Get the next card
    const cardId = room.deck[room.drawIndex];
    const card = getCardById(cardId);

    if (!card) {
      console.error(`Invalid card ID: ${cardId} in room ${roomCode}`);
      return;
    }

    // Add to drawn cards and increment index
    room.drawnCards.add(cardId);
    room.drawIndex++;

    // Broadcast the card to all players in the room
    io.to(roomCode).emit("game:card", {
      card: card,
      drawIndex: room.drawIndex,
      totalCards: room.deck.length,
      drawnCards: Array.from(room.drawnCards)
    });

    console.log(`Card called in room ${roomCode}: ${card.name} (${room.drawIndex}/${room.deck.length})`);
  }

  // Stop card calling for a room
  stopCardCalling(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return;
    }

    if (room.gameInterval) {
      clearInterval(room.gameInterval);
      room.gameInterval = null;
      console.log(`Card calling stopped for room ${roomCode}`);
    }
  }

  // End game and stop card calling
  endGame(roomCode, winnerId, io) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      console.error(`Cannot end game: room ${roomCode} not found`);
      return;
    }

    // Prevent multiple winners (tie-breaking: first valid claim wins)
    if (room.winnerId && room.winnerId !== winnerId) {
      console.log(`Game already ended in room ${roomCode}, winner already declared: ${room.winnerId}`);
      return;
    }

    // Stop card calling immediately
    this.stopCardCalling(roomCode);

    // Update room status
    room.status = "ENDED";
    room.winnerId = winnerId;

    const winner = room.players.get(winnerId);
    if (winner) {
      // Get final board stats for the winner
      const stats = getBoardStats(winner, room.drawnCards);
      
      // Broadcast winner to all players
      io.to(roomCode).emit("game:winner", {
        playerId: winnerId,
        playerName: winner.name,
        roomState: this.serializeRoomState(room),
        stats: stats
      });

      console.log(`🎉 Game ended in room ${roomCode}`);
      console.log(`   Winner: ${winner.name} (${winnerId})`);
      console.log(`   Cards called: ${room.drawIndex}/${room.deck.length}`);
      console.log(`   Board stats:`, stats);
    } else {
      console.error(`Winner ${winnerId} not found in room ${roomCode}`);
    }
  }

  // Validate a player's claim for victory
  validateClaim(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { isValid: false, reason: "ROOM_NOT_FOUND" };
    }

    if (room.status !== "RUNNING") {
      return { isValid: false, reason: "GAME_NOT_RUNNING" };
    }

    // Check if there's already a winner (tie-breaking: first claim wins)
    if (room.winnerId) {
      return { isValid: false, reason: "GAME_ALREADY_ENDED" };
    }

    const player = room.players.get(playerId);
    if (!player) {
      return { isValid: false, reason: "PLAYER_NOT_FOUND" };
    }

    // Use the comprehensive validation utility
    const validation = validateVictory(player, room.drawnCards);
    
    if (!validation.isValid) {
      console.log(`Invalid claim from ${player.name} in room ${roomCode}: ${validation.reason} - ${validation.details}`);
      return { 
        isValid: false, 
        reason: validation.reason,
        details: validation.details
      };
    }

    console.log(`Valid claim from ${player.name} in room ${roomCode}`);
    return { isValid: true };
  }

  // Handle player marking a cell on their board
  markCell(roomCode, playerId, cellIndex) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== "RUNNING") {
      throw new Error("GAME_NOT_RUNNING");
    }

    const player = room.players.get(playerId);
    if (!player) {
      throw new Error("PLAYER_NOT_FOUND");
    }

    if (cellIndex < 0 || cellIndex >= 16) {
      throw new Error("INVALID_CELL_INDEX");
    }

    const cardId = player.board[cellIndex];
    
    // Only allow marking if the card has been called
    if (!room.drawnCards.has(cardId)) {
      throw new Error("CARD_NOT_CALLED");
    }

    // Toggle the mark
    player.marks[cellIndex] = !player.marks[cellIndex];

    console.log(`Player ${player.name} ${player.marks[cellIndex] ? 'marked' : 'unmarked'} cell ${cellIndex} (${cardId}) in room ${roomCode}`);
    
    return room;
  }

  // Serialize room state for client (helper method)
  serializeRoomState(room) {
    if (!room) return null;

    return {
      id: room.id,
      code: room.code,
      status: room.status,
      hostId: room.hostId,
      drawIndex: room.drawIndex,
      drawnCards: Array.from(room.drawnCards),
      players: Array.from(room.players.values()),
      winnerId: room.winnerId,
      createdAt: room.createdAt,
    };
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

  // Reset game to WAITING state with new boards (for "Play Again" functionality)
  resetGame(roomCode, hostId, io) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    if (room.status !== "ENDED") {
      throw new Error("GAME_NOT_ENDED");
    }

    if (room.hostId !== hostId) {
      throw new Error("NOT_HOST");
    }

    try {
      // Reset room state
      room.status = "WAITING";
      room.winnerId = null;
      room.drawIndex = 0;
      room.drawnCards = new Set();
      room.deck = [];

      // Generate new unique boards for all players
      const { shuffledDeck, boards } = generateBoardsForRoom(room.players.size);
      
      // Assign new boards to players and reset marks
      let boardIndex = 0;
      for (const player of room.players.values()) {
        player.board = boards[boardIndex];
        player.marks = new Array(16).fill(false);
        boardIndex++;
      }

      console.log(`Game reset in room ${roomCode} by host ${hostId}`);
      console.log(`New boards generated for ${room.players.size} players`);
      
      return room;
    } catch (error) {
      console.error(`Failed to reset game in room ${roomCode}:`, error);
      throw new Error("RESET_FAILED");
    }
  }

  // Get board statistics for a player
  getPlayerBoardStats(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.get(playerId);
    if (!player) return null;

    return getBoardStats(player, room.drawnCards);
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
