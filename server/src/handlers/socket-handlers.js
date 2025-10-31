// Socket.IO event handlers for game functionality

export function setupSocketHandlers(io, roomManager) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle room creation
    socket.on("room:create", async (data) => {
      try {
        const { name } = data;

        if (!name || name.trim().length === 0) {
          socket.emit("error", {
            code: "INVALID_NAME",
            message: "Name is required",
          });
          return;
        }

        if (name.length > 20) {
          socket.emit("error", {
            code: "NAME_TOO_LONG",
            message: "Name must be 20 characters or less",
          });
          return;
        }

        const roomCode = roomManager.createRoom(socket.id, name.trim());
        const room = roomManager.getRoom(roomCode);

        // Join socket to room for broadcasting
        socket.join(roomCode);

        socket.emit("room:created", {
          roomCode,
          roomState: serializeRoomState(room),
        });

        console.log(`Room ${roomCode} created by ${name}`);
      } catch (error) {
        console.error("Error creating room:", error);
        socket.emit("error", {
          code: "CREATE_FAILED",
          message: "Failed to create room",
        });
      }
    });

    // Handle joining room
    socket.on("room:join", async (data) => {
      try {
        const { roomCode, name } = data;

        if (!roomCode || !name) {
          socket.emit("error", {
            code: "MISSING_DATA",
            message: "Room code and name are required",
          });
          return;
        }

        if (!roomManager.isValidRoomCode(roomCode)) {
          socket.emit("error", {
            code: "INVALID_ROOM_CODE",
            message: "Room code must be 5-6 alphanumeric characters",
          });
          return;
        }

        if (name.trim().length === 0) {
          socket.emit("error", {
            code: "INVALID_NAME",
            message: "Name is required",
          });
          return;
        }

        if (name.length > 20) {
          socket.emit("error", {
            code: "NAME_TOO_LONG",
            message: "Name must be 20 characters or less",
          });
          return;
        }

        const room = roomManager.joinRoom(
          roomCode.toUpperCase(),
          socket.id,
          name.trim()
        );

        // Join socket to room for broadcasting
        socket.join(roomCode.toUpperCase());

        // Send room state to joining player
        socket.emit("room:joined", {
          roomState: serializeRoomState(room),
        });

        // Broadcast updated room state to ALL players in the room (including the one who just joined)
        io.to(roomCode.toUpperCase()).emit("room:state", serializeRoomState(room));

        console.log(`${name} joined room ${roomCode.toUpperCase()}`);
      } catch (error) {
        console.error("Error joining room:", error);
        let errorCode = "JOIN_FAILED";
        let errorMessage = "Failed to join room";

        switch (error.message) {
          case "INVALID_ROOM_CODE":
            errorCode = "INVALID_ROOM_CODE";
            errorMessage = "Room code must be 5-6 alphanumeric characters";
            break;
          case "ROOM_NOT_FOUND":
            errorCode = "ROOM_NOT_FOUND";
            errorMessage = "Room not found";
            break;
          case "ROOM_FULL":
            errorCode = "ROOM_FULL";
            errorMessage = "Room is full (8 players maximum)";
            break;
          case "GAME_IN_PROGRESS":
            errorCode = "GAME_IN_PROGRESS";
            errorMessage = "Game is already in progress";
            break;
          case "NAME_TAKEN":
            errorCode = "NAME_TAKEN";
            errorMessage = "Name is already taken in this room";
            break;
        }

        socket.emit("error", { code: errorCode, message: errorMessage });
      }
    });

    // Handle game start (host only)
    socket.on("game:start", async (data) => {
      try {
        const { roomCode } = data;
        const room = roomManager.getRoom(roomCode);

        if (!room) {
          socket.emit("error", {
            code: "ROOM_NOT_FOUND",
            message: "Room not found",
          });
          return;
        }

        if (room.hostId !== socket.id) {
          socket.emit("error", {
            code: "NOT_HOST",
            message: "Only host can start the game",
          });
          return;
        }

        if (room.players.size < 2) {
          socket.emit("error", {
            code: "NOT_ENOUGH_PLAYERS",
            message: "Need at least 2 players to start",
          });
          return;
        }

        if (room.status !== "WAITING") {
          socket.emit("error", {
            code: "GAME_ALREADY_STARTED",
            message: "Game is already running",
          });
          return;
        }

        // Start the game and generate unique boards
        try {
          const updatedRoom = roomManager.startGame(roomCode, socket.id, io);

          // Notify all players that game has started
          io.to(roomCode).emit("game:started", {
            roomState: serializeRoomState(updatedRoom),
          });

          console.log(
            `Game started in room ${roomCode} with ${updatedRoom.players.size} players`
          );
        } catch (startError) {
          console.error("Error in startGame:", startError);
          let errorCode = "START_FAILED";
          let errorMessage = "Failed to start game";

          switch (startError.message) {
            case "ROOM_NOT_FOUND":
              errorCode = "ROOM_NOT_FOUND";
              errorMessage = "Room not found";
              break;
            case "NOT_HOST":
              errorCode = "NOT_HOST";
              errorMessage = "Only host can start the game";
              break;
            case "GAME_ALREADY_STARTED":
              errorCode = "GAME_ALREADY_STARTED";
              errorMessage = "Game is already running";
              break;
            case "INSUFFICIENT_PLAYERS":
              errorCode = "NOT_ENOUGH_PLAYERS";
              errorMessage = "Need at least 2 players to start";
              break;
            case "BOARD_GENERATION_FAILED":
              errorCode = "BOARD_GENERATION_FAILED";
              errorMessage = "Failed to generate unique boards";
              break;
          }

          socket.emit("error", { code: errorCode, message: errorMessage });
          return;
        }
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", {
          code: "START_FAILED",
          message: "Failed to start game",
        });
      }
    });

    // Handle board marking
    socket.on("board:mark", async (data) => {
      try {
        const { roomCode, cellIndex } = data;

        if (!roomCode || cellIndex === undefined) {
          socket.emit("error", {
            code: "MISSING_DATA",
            message: "Room code and cell index are required",
          });
          return;
        }

        if (typeof cellIndex !== "number" || cellIndex < 0 || cellIndex >= 16) {
          socket.emit("error", {
            code: "INVALID_CELL_INDEX",
            message: "Cell index must be between 0 and 15",
          });
          return;
        }

        const room = roomManager.markCell(roomCode, socket.id, cellIndex);

        // Send updated room state to all players
        io.to(roomCode).emit("room:state", serializeRoomState(room));

        console.log(`Cell ${cellIndex} marked in room ${roomCode}`);
      } catch (error) {
        console.error("Error marking cell:", error);
        let errorCode = "MARK_FAILED";
        let errorMessage = "Failed to mark cell";

        switch (error.message) {
          case "GAME_NOT_RUNNING":
            errorCode = "GAME_NOT_RUNNING";
            errorMessage = "Game is not running";
            break;
          case "PLAYER_NOT_FOUND":
            errorCode = "PLAYER_NOT_FOUND";
            errorMessage = "Player not found";
            break;
          case "INVALID_CELL_INDEX":
            errorCode = "INVALID_CELL_INDEX";
            errorMessage = "Invalid cell index";
            break;
          case "CARD_NOT_CALLED":
            errorCode = "CARD_NOT_CALLED";
            errorMessage = "Card has not been called yet";
            break;
        }

        socket.emit("error", { code: errorCode, message: errorMessage });
      }
    });

    // Handle victory claim
    socket.on("game:claim", async (data) => {
      try {
        const { roomCode } = data;

        if (!roomCode) {
          socket.emit("error", {
            code: "MISSING_DATA",
            message: "Room code is required",
          });
          return;
        }

        const room = roomManager.getRoom(roomCode);

        if (!room) {
          socket.emit("error", {
            code: "ROOM_NOT_FOUND",
            message: "Room not found",
          });
          return;
        }

        if (room.status !== "RUNNING") {
          socket.emit("error", {
            code: "GAME_NOT_RUNNING",
            message: "Game is not running",
          });
          return;
        }

        // Check if there's already a winner (tie-breaking: first claim wins)
        if (room.winnerId) {
          const winner = room.players.get(room.winnerId);
          socket.emit("error", {
            code: "GAME_ALREADY_ENDED",
            message: `Game has already ended. Winner: ${winner ? winner.name : 'Unknown'}`,
          });
          return;
        }

        // Validate the claim
        const validation = roomManager.validateClaim(roomCode, socket.id);

        if (!validation.isValid) {
          let errorMessage = "Invalid claim";
          switch (validation.reason) {
            case "GAME_NOT_RUNNING":
              errorMessage = "Game is not running";
              break;
            case "GAME_ALREADY_ENDED":
              errorMessage = "Game has already ended";
              break;
            case "PLAYER_NOT_FOUND":
              errorMessage = "Player not found";
              break;
            case "BOARD_NOT_COMPLETE":
              errorMessage = validation.details || "Board is not complete - all 16 cells must be marked";
              break;
            case "INVALID_MARKS":
              errorMessage = validation.details || "Some marked cards have not been called yet";
              break;
            default:
              errorMessage = validation.details || "Invalid claim";
          }

          const player = room.players.get(socket.id);
          console.log(`❌ Invalid claim from ${player ? player.name : socket.id} in room ${roomCode}: ${errorMessage}`);

          socket.emit("error", {
            code: validation.reason,
            message: errorMessage,
          });
          return;
        }

        // Claim is valid - end the game immediately
        // This ensures first valid claim wins (tie-breaking)
        const player = room.players.get(socket.id);
        console.log(`✅ Valid claim from ${player ? player.name : socket.id} in room ${roomCode}`);

        roomManager.endGame(roomCode, socket.id, io);
      } catch (error) {
        console.error("Error processing claim:", error);
        socket.emit("error", {
          code: "CLAIM_FAILED",
          message: "Failed to process claim",
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      const room = roomManager.getRoomByPlayer(socket.id);
      if (room) {
        const player = room.players.get(socket.id);
        const playerName = player ? player.name : 'Unknown';

        // Mark player as disconnected instead of removing immediately
        roomManager.markPlayerDisconnected(room.code, socket.id);

        // Get updated room state
        const updatedRoom = roomManager.getRoom(room.code);
        if (updatedRoom) {
          // Notify other players about the disconnection
          io.to(room.code).emit("player:disconnected", {
            playerId: socket.id,
            playerName: playerName,
          });

          // Send updated room state
          io.to(room.code).emit("room:state", serializeRoomState(updatedRoom));
          
          console.log(`${playerName} disconnected from room ${room.code}, marked as disconnected`);
        }

        // Schedule cleanup after 5 minutes if player doesn't reconnect
        setTimeout(() => {
          roomManager.cleanupDisconnectedPlayer(room.code, socket.id, io);
        }, 5 * 60 * 1000); // 5 minutes
      }
    });

    // Handle reconnection attempt
    socket.on("room:reconnect", async (data) => {
      try {
        const { roomCode, playerId } = data;

        if (!roomCode || !playerId) {
          socket.emit("error", {
            code: "MISSING_DATA",
            message: "Room code and player ID are required",
          });
          return;
        }

        if (!roomManager.isValidRoomCode(roomCode)) {
          socket.emit("error", {
            code: "INVALID_ROOM_CODE",
            message: "Room code must be 5-6 alphanumeric characters",
          });
          return;
        }

        const room = roomManager.reconnectPlayer(
          roomCode.toUpperCase(),
          playerId,
          socket.id
        );

        if (!room) {
          socket.emit("error", {
            code: "RECONNECT_FAILED",
            message: "Could not reconnect to room",
          });
          return;
        }

        // After reconnection, player is now mapped to the new socket ID
        const player = room.players.get(socket.id);
        if (!player) {
          socket.emit("error", {
            code: "PLAYER_NOT_FOUND",
            message: "Player not found in room",
          });
          return;
        }

        // Join socket to room for broadcasting
        socket.join(roomCode.toUpperCase());

        // Send reconnection confirmation with full room state
        socket.emit("room:reconnected", {
          playerId: socket.id,
          roomState: serializeRoomState(room),
        });

        // Notify other players about the reconnection
        socket.to(roomCode.toUpperCase()).emit("player:reconnected", {
          playerId: socket.id,
          playerName: player.name,
        });

        // Send updated room state to all players
        io.to(roomCode.toUpperCase()).emit("room:state", serializeRoomState(room));

        console.log(`Player ${player.name} reconnected to room ${roomCode.toUpperCase()}`);
      } catch (error) {
        console.error("Error reconnecting:", error);
        socket.emit("error", {
          code: "RECONNECT_FAILED",
          message: "Failed to reconnect",
        });
      }
    });
  });
}

// Helper function to serialize room state for client
function serializeRoomState(room) {
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
