# Documento de Requisitos - Lotería del Mictlán

## Introducción

Una versión web multiplayer en tiempo real de la tradicional Lotería Mexicana, tematizada con el Día de Muertos. El MVP funcional permite que múltiples jugadores se unan a partidas virtuales usando React + Node.js + Socket.IO, con estado en memoria y sin dependencias externas de base de datos. El juego utiliza un mazo reducido de 24 cartas temáticas y se gana siendo el primero en completar todo el tablero 4x4.

## Glosario

- **Sistema_Loteria**: La aplicación web MVP que gestiona el juego usando React + Node.js + Socket.IO
- **Jugador**: Usuario que participa en una partida de lotería con nombre único
- **Anfitrión**: Jugador que crea y administra una sala de juego (host)
- **Sala**: Espacio virtual en memoria donde se desarrolla una partida con código único de 5-6 caracteres
- **Tablero**: Conjunto de 16 cartas dispuestas en una cuadrícula 4x4 que cada jugador recibe aleatoriamente
- **Carta**: Una de las 24 cartas temáticas del Día de Muertos del mazo reducido
- **Mazo**: Conjunto específico de 24 cartas temáticas del Día de Muertos definidas en el sistema
- **Claim**: Acción del jugador para gritar "¡Lotería!" cuando completa todo su tablero 4x4
- **Tablero_Completo**: Estado donde las 16 casillas del tablero están marcadas con cartas que han sido cantadas

## Requisitos

### Requisito 1

**Historia de Usuario:** Como jugador, quiero unirme a una sala de lotería usando un código único, para poder jugar con otros participantes desde mi navegador.

#### Criterios de Aceptación

1. CUANDO un jugador ingresa un código de sala válido de 5-6 caracteres, EL Sistema_Loteria DEBERÁ permitir el acceso a la sala correspondiente
2. MIENTRAS una sala tenga menos de 8 jugadores, EL Sistema_Loteria DEBERÁ aceptar nuevos participantes
3. SI una sala está llena o no existe, ENTONCES EL Sistema_Loteria DEBERÁ mostrar un mensaje de error apropiado
4. EL Sistema_Loteria DEBERÁ mostrar la lista de jugadores conectados en tiempo real usando WebSockets
5. CUANDO un jugador se desconecta, EL Sistema_Loteria DEBERÁ actualizar la lista de participantes inmediatamente y mantener el estado de la partida

### Requisito 2

**Historia de Usuario:** Como anfitrión, quiero crear y administrar una sala de juego, para poder controlar el inicio y desarrollo de la partida.

#### Criterios de Aceptación

1. EL Sistema_Loteria DEBERÁ generar un código único de 5-6 caracteres para cada sala nueva
2. CUANDO el anfitrión crea una sala, EL Sistema_Loteria DEBERÁ asignarle permisos de administración y almacenar el estado en memoria
3. EL Sistema_Loteria DEBERÁ permitir al anfitrión iniciar la partida cuando haya al menos 2 jugadores
4. EL Sistema_Loteria DEBERÁ mantener las salas en memoria con TTL de 2 horas para el MVP
5. CUANDO el anfitrión se desconecta, EL Sistema_Loteria DEBERÁ permitir que la partida continúe sin crash

### Requisito 3

**Historia de Usuario:** Como jugador, quiero recibir un tablero único de 4x4 con cartas del mazo temático del Día de Muertos, para poder participar en el juego de lotería.

#### Criterios de Aceptación

1. CUANDO inicia una partida, EL Sistema_Loteria DEBERÁ asignar un tablero único de 16 cartas en formato 4x4 a cada jugador
2. EL Sistema_Loteria DEBERÁ utilizar únicamente las 24 cartas del mazo reducido temático del Día de Muertos
3. EL Sistema_Loteria DEBERÁ garantizar que cada tablero tenga una combinación aleatoria diferente de cartas del mazo
4. EL Sistema_Loteria DEBERÁ mostrar el tablero de forma clara y responsive usando React
5. CUANDO una carta es cantada, EL Sistema_Loteria DEBERÁ permitir al jugador hacer clic para marcarla si está en su tablero

### Requisito 4

**Historia de Usuario:** Como jugador, quiero ver las cartas que se van cantando sincronizadas en tiempo real, para poder marcar las correspondientes en mi tablero.

#### Criterios de Aceptación

1. EL Sistema_Loteria DEBERÁ mostrar visualmente cada carta cantada durante 4 segundos usando Socket.IO
2. EL Sistema_Loteria DEBERÁ cantar cartas del mazo barajado sin repetición durante una partida
3. EL Sistema_Loteria DEBERÁ mantener un historial visible de las cartas cantadas
4. EL Sistema_Loteria DEBERÁ pausar exactamente 4 segundos entre cada carta cantada
5. CUANDO se canta una carta, EL Sistema_Loteria DEBERÁ sincronizar la visualización para todos los jugadores simultáneamente usando WebSockets

### Requisito 5

**Historia de Usuario:** Como jugador, quiero poder gritar "¡Lotería!" cuando complete todo mi tablero 4x4, para ganar la partida.

#### Criterios de Aceptación

1. EL Sistema_Loteria DEBERÁ proporcionar un botón de "¡Lotería!" visible durante toda la partida
2. CUANDO un jugador presiona "¡Lotería!", EL Sistema_Loteria DEBERÁ verificar automáticamente si las 16 casillas de su tablero están marcadas
3. SI todas las 16 cartas marcadas están en el conjunto de cartas cantadas, ENTONCES EL Sistema_Loteria DEBERÁ declarar al jugador como ganador
4. SI el claim no es válido, ENTONCES EL Sistema_Loteria DEBERÁ rechazar el intento sin penalización en el MVP
5. EL Sistema_Loteria DEBERÁ aceptar solo el primer claim válido y notificar a todos los jugadores del ganador

### Requisito 6

**Historia de Usuario:** Como jugador, quiero ver una interfaz minimalista temática del Día de Muertos, para tener una experiencia culturalmente auténtica sin comprometer la funcionalidad.

#### Criterios de Aceptación

1. EL Sistema_Loteria DEBERÁ utilizar una paleta de colores específica: naranja (#ffb347) y morado (#7a1fa2)
2. EL Sistema_Loteria DEBERÁ usar tipografía Inter o Atkinson para mantener legibilidad
3. EL Sistema_Loteria DEBERÁ mostrar las 24 cartas temáticas del mazo con sus nombres y emojis correspondientes
4. EL Sistema_Loteria DEBERÁ mantener un diseño minimalista sin animaciones ni audio en el MVP
5. EL Sistema_Loteria DEBERÁ priorizar la funcionalidad y usabilidad sobre elementos decorativos complejos

### Requisito 7

**Historia de Usuario:** Como desarrollador, quiero que el sistema funcione como MVP sin dependencias externas, para poder desplegar y probar rápidamente.

#### Criterios de Aceptación

1. EL Sistema_Loteria DEBERÁ funcionar completamente sin base de datos externa
2. EL Sistema_Loteria DEBERÁ mantener todo el estado en memoria usando estructuras Map
3. EL Sistema_Loteria DEBERÁ usar únicamente React + Vite + TypeScript en el frontend
4. EL Sistema_Loteria DEBERÁ usar únicamente Node.js + Express + Socket.IO en el backend
5. EL Sistema_Loteria DEBERÁ ser desplegable en Vercel (frontend) y Render/Fly.io (backend)

### Requisito 8

**Historia de Usuario:** Como sistema, necesito un mazo específico de cartas temáticas del Día de Muertos, para garantizar consistencia cultural y funcionalidad del juego.

#### Criterios de Aceptación

1. EL Sistema_Loteria DEBERÁ utilizar exactamente estas 24 cartas en el mazo: "cempasuchil", "vela", "pan", "retrato", "agua", "copal", "papel", "calavera", "xolo", "catrina", "alebrije", "colibri", "rio", "mariposa", "obsidiana", "sol", "altar", "mariachi", "panteon", "familia", "charro", "llorona", "calaca", "copalero"
2. EL Sistema_Loteria DEBERÁ asignar a cada carta un nombre descriptivo y un emoji representativo
3. EL Sistema_Loteria DEBERÁ barajar estas 24 cartas al inicio de cada partida
4. EL Sistema_Loteria DEBERÁ cantar las cartas en el orden barajado sin repetición durante una partida
5. EL Sistema_Loteria DEBERÁ generar tableros de 16 cartas seleccionando aleatoriamente del mazo de 24 cartas

### Requisito 9

**Historia de Usuario:** Como sistema, necesito manejar empates entre jugadores que completen su tablero simultáneamente, para garantizar que solo haya un ganador por partida.

#### Criterios de Aceptación

1. EL Sistema_Loteria DEBERÁ procesar los claims de "¡Lotería!" en el orden exacto que llegan al servidor
2. CUANDO múltiples jugadores envían un claim válido simultáneamente, EL Sistema_Loteria DEBERÁ declarar ganador únicamente al primer claim procesado por el servidor
3. EL Sistema_Loteria DEBERÁ rechazar automáticamente todos los claims posteriores una vez que se declare un ganador
4. EL Sistema_Loteria DEBERÁ notificar a todos los jugadores el nombre del único ganador de la partida
5. EL Sistema_Loteria DEBERÁ terminar la partida inmediatamente después de declarar un ganador, sin procesar más cartas