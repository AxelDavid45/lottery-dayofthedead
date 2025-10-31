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

        // Notify all players in room about new player
        socket.to(roomCode.toUpperCase()).emit("player:joined", {
          id: socket.id,
          name: name.trim(),
        });

        // Send room state to joining player
        socket.emit("room:joined", {
          roomState: serializeRoomState(room),
        });

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

        // Game start logic will be implemented in later tasks
        console.log(
          `Game start requested for room ${roomCode} by host ${socket.id}`
        );
        socket.emit("error", {
          code: "NOT_IMPLEMENTED",
          message: "Game start will be implemented in next tasks",
        });
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", {
          code: "START_FAILED",
          message: "Failed to start game",
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      const room = roomManager.getRoomByPlayer(socket.id);
      if (room) {
        const player = room.players.get(socket.id);
        if (player) {
          // Notify other players
          socket.to(room.code).emit("player:left", {
            id: socket.id,
            name: player.name,
          });
        }

        // Remove player from room
        roomManager.removePlayer(room.code, socket.id);

        // If room still has players, send updated state
        const updatedRoom = roomManager.getRoom(room.code);
        if (updatedRoom && updatedRoom.players.size > 0) {
          io.to(room.code).emit("room:state", serializeRoomState(updatedRoom));
        }
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

        const room = roomManager.getRoom(roomCode.toUpperCase());

        if (!room) {
          socket.emit("error", {
            code: "ROOM_NOT_FOUND",
            message: "Room not found",
          });
          return;
        }

        const player = room.players.get(playerId);
        if (!player) {
          socket.emit("error", {
            code: "PLAYER_NOT_FOUND",
            message: "Player not found in room",
          });
          return;
        }

        // Update player connection status
        player.isConnected = true;
        socket.join(roomCode);

        socket.emit("room:reconnected", {
          roomState: serializeRoomState(room),
        });

        console.log(`Player ${player.name} reconnected to room ${roomCode}`);
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
