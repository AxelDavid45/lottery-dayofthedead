# 🎲 Lotería del Mictlán | Day of the Dead Lotería

*[English version below](#english-version)*

## 🇲🇽 Versión en Español

**Lotería del Mictlán** es una versión multijugador en línea del tradicional juego mexicano de Lotería con temática del Día de Muertos. Celebra nuestras tradiciones mientras juegas con amigos y familia desde cualquier lugar del mundo.

### ✨ Características

- 🎮 **Multijugador en tiempo real** - Hasta 8 jugadores por sala
- 🏠 **Salas privadas** - Códigos únicos de 6 caracteres para juegos privados
- 🎯 **Tableros 4x4** - Experiencia clásica de lotería con cartas temáticas
- ⚡ **Llamado automático** - Cartas llamadas cada 4 segundos
- 🏆 **Validación automática** - Sistema de victoria y desempate
- 💀 **Temática Día de Muertos** - Diseño auténtico con colores y elementos tradicionales
- 📱 **Responsive** - Optimizado para móviles y escritorio

### 🛠️ Tecnologías

#### Frontend
- **React** con TypeScript para seguridad de tipos
- **Vite** como herramienta de construcción y servidor de desarrollo
- **Tailwind CSS** para estilos y diseño responsive
- **Socket.IO Client** para comunicación en tiempo real

#### Backend
- **Node.js** con servidor Fastify
- **Socket.IO** para conexiones WebSocket
- **UUID** para generación de códigos únicos de sala
- **Almacenamiento en memoria** (sin base de datos requerida)

### 🚀 Instalación y Desarrollo

#### Prerrequisitos
- Node.js 18+ 
- npm o yarn

#### Configuración del Proyecto

```bash
# Clonar el repositorio
git clone <repository-url>
cd loteria-dia-muertos

# Instalar dependencias del monorepo
npm install

# Instalar dependencias del cliente y servidor
npm install --workspace=client
npm install --workspace=server
```

#### Desarrollo

```bash
# Iniciar servidor backend (puerto 3001)
npm run server:dev

# En otra terminal, iniciar cliente frontend (puerto 5173)
npm run client:dev
```

#### Producción

```bash
# Construir cliente para producción
npm run client:build

# Iniciar servidor en modo producción
npm run server:start
```

### 📁 Estructura del Proyecto

```
loteria-dia-muertos/
├── client/                 # Aplicación React frontend
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── types/         # Definiciones TypeScript
│   │   └── utils/         # Utilidades del cliente
│   └── package.json       # Dependencias frontend
├── server/                # Aplicación Node.js backend
│   ├── src/
│   │   ├── models/        # Modelos y tipos de datos
│   │   ├── handlers/      # Manejadores de eventos Socket.IO
│   │   └── utils/         # Utilidades del servidor
│   └── package.json       # Dependencias backend
├── shared/                # Tipos y constantes compartidas
│   └── types/            # Interfaces TypeScript comunes
└── package.json          # Configuración del monorepo
```

### 🎯 Cómo Jugar

1. **Crear Sala**: Un jugador crea una sala y recibe un código único
2. **Unirse**: Otros jugadores se unen usando el código de sala
3. **Iniciar Juego**: El anfitrión inicia el juego cuando todos estén listos
4. **Jugar**: Las cartas se llaman automáticamente cada 4 segundos
5. **Marcar**: Los jugadores marcan las cartas en sus tableros 4x4
6. **¡Lotería!**: El primer jugador en completar su tablero gana

### 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

### 📄 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor backend
npm run client:dev       # Iniciar cliente frontend
npm run server:dev       # Iniciar servidor backend

# Producción
npm start               # Iniciar servidor en producción
npm run client:build    # Construir cliente para producción
npm run server:start    # Iniciar servidor en producción
```

---

## 🇺🇸 English Version

**Lotería del Mictlán** is a multiplayer online version of the traditional Mexican Lotería game with a Day of the Dead theme. Celebrate our traditions while playing with friends and family from anywhere in the world.

### ✨ Features

- 🎮 **Real-time multiplayer** - Up to 8 players per room
- 🏠 **Private rooms** - Unique 6-character codes for private games
- 🎯 **4x4 boards** - Classic lotería experience with themed cards
- ⚡ **Automatic calling** - Cards called every 4 seconds
- 🏆 **Automatic validation** - Victory and tie-breaking system
- 💀 **Day of the Dead theme** - Authentic design with traditional colors and elements
- 📱 **Responsive** - Optimized for mobile and desktop

### 🛠️ Technologies

#### Frontend
- **React** with TypeScript for type safety
- **Vite** as build tool and dev server
- **Tailwind CSS** for styling and responsive design
- **Socket.IO Client** for real-time communication

#### Backend
- **Node.js** with Fastify server
- **Socket.IO** for WebSocket connections
- **UUID** for unique room code generation
- **In-memory storage** (no database required)

### 🚀 Installation and Development

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Project Setup

```bash
# Clone repository
git clone <repository-url>
cd loteria-dia-muertos

# Install monorepo dependencies
npm install

# Install client and server dependencies
npm install --workspace=client
npm install --workspace=server
```

#### Development

```bash
# Start backend server (port 3001)
npm run server:dev

# In another terminal, start frontend client (port 5173)
npm run client:dev
```

#### Production

```bash
# Build client for production
npm run client:build

# Start server in production mode
npm run server:start
```

### 🎯 How to Play

1. **Create Room**: One player creates a room and receives a unique code
2. **Join**: Other players join using the room code
3. **Start Game**: Host starts the game when everyone is ready
4. **Play**: Cards are automatically called every 4 seconds
5. **Mark**: Players mark cards on their 4x4 boards
6. **¡Lotería!**: First player to complete their board wins

### 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### 📄 Available Commands

```bash
# Development
npm run dev              # Start backend server
npm run client:dev       # Start frontend client
npm run server:dev       # Start backend server

# Production
npm start               # Start server in production
npm run client:build    # Build client for production
npm run server:start    # Start server in production
```

### 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- Inspired by the traditional Mexican Lotería game
- Day of the Dead cultural elements and aesthetics
- Built with modern web technologies for global accessibility

---

**¡Que comience la Lotería del Mictlán! 💀🎲**