import Fastify from 'fastify'
import { Server } from 'socket.io'

const fastify = Fastify({
  logger: true
})

// Register CORS
await fastify.register(import('@fastify/cors'), {
  origin: ['http://localhost:3000'],
  credentials: true
})

// Basic health check route
fastify.get('/', async (request, reply) => {
  return { message: 'Lotería del Mictlán Server is running!' }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    
    // Initialize Socket.IO with the Fastify server
    const io = new Server(fastify.server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })

    console.log('Server listening on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()