import Fastify from "fastify";
import { Server } from "socket.io";
import { RoomManager } from "./utils/room-manager.js";
import { setupSocketHandlers } from "./handlers/socket-handlers.js";

const fastify = Fastify({
  logger: true,
});

// Initialize room manager
const roomManager = new RoomManager();

// Register CORS
await fastify.register(import("@fastify/cors"), {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
});

// Basic health check route
fastify.get("/", async () => {
  return {
    message: "Lotería del Mictlán Server is running!",
    stats: roomManager.getStats(),
    timestamp: new Date().toISOString(),
  };
});

// Server stats endpoint
fastify.get("/stats", async () => {
  return {
    ...roomManager.getStats(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });

    // Initialize Socket.IO with the Fastify server
    const io = new Server(fastify.server, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // Setup Socket.IO event handlers
    setupSocketHandlers(io, roomManager);

    console.log("🚀 Lotería del Mictlán Server started!");
    console.log("📡 Server listening on http://localhost:3001");
    console.log("🎮 WebSocket server ready for connections");
    console.log("📊 Stats available at http://localhost:3001/stats");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
