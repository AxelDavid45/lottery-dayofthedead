# Documento de Diseño - Lotería del Mictlán

## Visión General

La Lotería del Mictlán es un MVP de juego web multiplayer en tiempo real que implementa la tradicional Lotería Mexicana con temática del Día de Muertos. La arquitectura se basa en React + Node.js + Socket.IO para proporcionar una experiencia sincronizada sin dependencias externas de base de datos.

## Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- React 18 con TypeScript
- Vite como bundler
- Tailwind CSS para estilos y diseño responsivo
- Socket.IO Client para WebSockets

**Backend:**
- Node.js con Fastify
- Socket.IO Server para comunicación en tiempo real
- UUID para generación de códigos de sala
- Estado en memoria con estructuras Map

**Despliegue:**
- Frontend: Vercel
- Backend: Render o Fly.io

### Arquitectura de Alto Nivel

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   React Client  │ ◄──────────────► │   Node.js API   │
│   (Frontend)    │                  │   (Backend)     │
└─────────────────┘                  └─────────────────┘
        │                                     │
        │                                     │
        ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│   UI Components │                  │  Memory Storage │
│   - Home        │                  │  - Rooms Map    │
│   - Lobby       │                  │  - Players Map  │
│   - Game        │                  │  - Game State   │
└─────────────────┘                  └─────────────────┘
```

## Componentes y Interfaces

### Modelos de Datos

#### RoomState
```typescript
interface RoomState {
  id: string;                    // UUID único
  code: string;                  // Código de 5-6 caracteres
  status: 'WAITING' | 'RUNNING' | 'ENDED';
  hostId: string;                // Socket ID del anfitrión
  deck: string[];                // Mazo barajado de 24 cartas
  drawIndex: number;             // Índice actual de carta cantada
  drawnCards: Set<string>;       // Cartas ya cantadas
  players: Map<string, PlayerState>;
  winnerId?: string;             // ID del ganador
  createdAt: number;             // Timestamp para TTL
  gameInterval?: NodeJS.Timeout; // Intervalo del juego
}
```

#### PlayerState
```typescript
interface PlayerState {
  id: string;          // Socket ID
  name: string;        // Nombre del jugador
  board: string[];     // 16 cartas del tablero 4x4
  marks: boolean[];    // 16 booleanos para marcas
  isHost: boolean;     // Si es anfitrión
  isConnected: boolean; // Estado de conexión
}
```

#### Card
```typescript
interface Card {
  id: string;          // Identificador único
  name: string;        // Nombre descriptivo
  emoji: string;       // Emoji representativo
  phrase?: string;     // Frase tradicional (opcional)
}
```

### Eventos de Socket.IO

#### Cliente → Servidor
```typescript
// Crear nueva sala
'room:create' → { name: string }

// Unirse a sala existente  
'room:join' → { roomCode: string, name: string }

// Iniciar partida (solo host)
'game:start' → { roomCode: string }

// Marcar casilla en tablero
'board:mark' → { roomCode: string, cellIndex: number }

// Reclamar victoria
'game:claim' → { roomCode: string }

// Desconexión
'disconnect' → void
```

#### Servidor → Cliente
```typescript
// Estado actualizado de la sala
'room:state' → RoomState

// Nueva carta cantada
'game:card' → { card: Card, drawIndex: number }

// Anuncio de ganador
'game:winner' → { playerId: string, playerName: string }

// Jugador se unió
'player:joined' → { id: string, name: string }

// Jugador se fue
'player:left' → { id: string }

// Errores
'error' → { code: string, message: string }
```

## Lógica del Juego

### Flujo Principal

1. **Creación de Sala**
   - Generar código único de 5-6 caracteres
   - Crear RoomState en memoria
   - Asignar permisos de host al creador

2. **Unión a Sala**
   - Validar código de sala
   - Verificar capacidad (máximo 8 jugadores)
   - Generar tablero único para el jugador

3. **Inicio de Partida**
   - Barajar mazo de 24 cartas
   - Iniciar loop de cantado cada 4 segundos
   - Cambiar status a 'RUNNING'

4. **Ciclo de Juego**
   - Cantar carta actual del mazo barajado
   - Sincronizar visualización a todos los clientes
   - Incrementar drawIndex
   - Repetir hasta que haya ganador

5. **Validación de Victoria**
   - Verificar que las 16 casillas estén marcadas
   - Validar que todas las cartas marcadas estén en drawnCards
   - Procesar solo el primer claim válido

6. **Finalización**
   - Declarar ganador
   - Detener loop de cantado
   - Cambiar status a 'ENDED'

### Generación de Tableros

```typescript
function generateBoard(deck: string[]): string[] {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 16);
}
```

### Validación de Victoria

```typescript
function validateWin(player: PlayerState, drawnCards: Set<string>): boolean {
  // Verificar que todas las casillas estén marcadas
  if (!player.marks.every(mark => mark)) {
    return false;
  }
  
  // Verificar que todas las cartas marcadas hayan sido cantadas
  return player.board.every(card => drawnCards.has(card));
}
```

## Mazo de Cartas

### Definición del Mazo
```typescript
const DECK: Card[] = [
  { id: 'cempasuchil', name: 'La Cempasúchil', emoji: '🌼' },
  { id: 'vela', name: 'La Vela', emoji: '🕯️' },
  { id: 'pan', name: 'El Pan de Muerto', emoji: '🍞' },
  { id: 'retrato', name: 'El Retrato', emoji: '🖼️' },
  { id: 'agua', name: 'El Agua', emoji: '💧' },
  { id: 'copal', name: 'El Copal', emoji: '💨' },
  { id: 'papel', name: 'El Papel Picado', emoji: '🎊' },
  { id: 'calavera', name: 'La Calavera', emoji: '💀' },
  { id: 'xolo', name: 'El Xoloitzcuintle', emoji: '🐕' },
  { id: 'catrina', name: 'La Catrina', emoji: '💃' },
  { id: 'alebrije', name: 'El Alebrije', emoji: '🦋' },
  { id: 'colibri', name: 'El Colibrí', emoji: '🐦' },
  { id: 'rio', name: 'El Río', emoji: '🌊' },
  { id: 'mariposa', name: 'La Mariposa', emoji: '🦋' },
  { id: 'obsidiana', name: 'La Obsidiana', emoji: '⚫' },
  { id: 'sol', name: 'El Sol', emoji: '☀️' },
  { id: 'altar', name: 'El Altar', emoji: '🏛️' },
  { id: 'mariachi', name: 'El Mariachi', emoji: '🎺' },
  { id: 'panteon', name: 'El Panteón', emoji: '⛪' },
  { id: 'familia', name: 'La Familia', emoji: '👨‍👩‍👧‍👦' },
  { id: 'charro', name: 'El Charro', emoji: '🤠' },
  { id: 'llorona', name: 'La Llorona', emoji: '👻' },
  { id: 'calaca', name: 'La Calaca', emoji: '💀' },
  { id: 'copalero', name: 'El Copalero', emoji: '🧙‍♂️' }
];
```

## Interfaz de Usuario

### Estructura de Componentes

```
App
├── Router
│   ├── Home
│   │   ├── CreateRoomForm
│   │   └── JoinRoomForm
│   ├── Lobby
│   │   ├── PlayerList
│   │   ├── RoomInfo
│   │   └── StartGameButton (solo host)
│   └── Game
│       ├── CurrentCard
│       ├── GameBoard (4x4 grid)
│       ├── ClaimButton
│       └── GameStatus
```

### Diseño Visual

**Paleta de Colores:**
- Primario: Naranja #ffb347
- Secundario: Morado #7a1fa2
- Fondo: Blanco #ffffff
- Texto: Negro #000000

**Tipografía:**
- Principal: Inter
- Alternativa: Atkinson Hyperlegible

**Layout Responsivo:**
- Mobile-first approach
- Grid CSS para tablero 4x4
- Flexbox para layouts generales

### Vistas Principales

#### Home
- Input para nombre de jugador
- Botón "Crear Sala"
- Input para código + Botón "Unirse"

#### Lobby  
- Lista de jugadores conectados
- Código de sala visible
- Botón "Iniciar Partida" (solo host)
- Indicador de estado "Esperando jugadores..."

#### Game
- Carta actual grande y centrada
- Tablero 4x4 con cartas clickeables
- Botón "¡Lotería!" prominente
- Lista de jugadores con estado
- Modal de anuncio de ganador (overlay completo que interrumpe el juego)

#### Winner Modal
- Overlay de pantalla completa con backdrop oscuro
- Animación de entrada inmediata
- Mensaje grande y celebratorio
- Diferenciación visual entre ganador y otros jugadores
- Bloqueo de interacción con el juego hasta cerrar modal

## Manejo de Errores

### Errores del Cliente
- Sala no encontrada
- Sala llena (8 jugadores)
- Nombre duplicado en sala
- Pérdida de conexión

### Errores del Servidor
- Código de sala inválido
- Jugador no autorizado para iniciar
- Claim inválido
- Estado inconsistente

### Estrategias de Recuperación
- Reconexión automática con Socket.IO
- Persistencia de estado en localStorage
- Mensajes de error claros y accionables

## Estrategia de Testing

### Testing Unitario
- Validación de lógica de juego
- Generación de tableros únicos
- Validación de claims de victoria

### Testing de Integración
- Flujo completo de creación/unión a sala
- Sincronización de eventos Socket.IO
- Manejo de desconexiones

### Testing Manual
- Múltiples jugadores en diferentes navegadores
- Latencia de red simulada
- Casos edge de empates

## Consideraciones de Rendimiento

### Optimizaciones
- Debounce en clicks de tablero
- Lazy loading de componentes
- Memoización de cálculos costosos

### Limitaciones del MVP
- Máximo 8 jugadores por sala
- TTL de 2 horas para salas
- Sin persistencia de historial

### Monitoreo
- Logs de eventos críticos
- Métricas de conexiones activas
- Tiempo de respuesta de claims

## Seguridad

### Validaciones
- Sanitización de nombres de jugador
- Validación de códigos de sala
- Rate limiting en creación de salas

### Prevención de Trampas
- Validación server-side de todos los claims
- Verificación de cartas cantadas
- Timestamps para detectar claims imposibles