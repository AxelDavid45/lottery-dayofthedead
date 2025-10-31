# Plan de Implementación - Lotería del Mictlán

- [x] 1. Configurar estructura del proyecto y dependencias
  - Crear estructura de carpetas para monorepo (client/server)
  - Configurar package.json para frontend (React + Vite + TypeScript + Tailwind CSS)
  - Configurar package.json para backend (Node.js + Fastify + Socket.IO)
  - Instalar y configurar dependencias necesarias
  - Configurar Tailwind CSS en el proyecto frontend
  - _Requisitos: 7.3, 7.4_

- [x] 2. Implementar modelos de datos y tipos TypeScript
  - Crear interfaces para RoomState, PlayerState y Card
  - Definir tipos para eventos de Socket.IO
  - Implementar el mazo de 24 cartas temáticas con nombres y emojis
  - Crear tipos para estados de juego y errores
  - _Requisitos: 8.1, 8.2_

- [x] 3. Desarrollar servidor backend básico
  - Configurar servidor Fastify con Socket.IO
  - Implementar sistema de gestión de salas en memoria
  - Crear generador de códigos únicos de sala
  - Configurar manejo básico de conexiones WebSocket
  - _Requisitos: 2.1, 2.4, 7.2_

- [ ] 4. Implementar lógica de creación y unión a salas
  - Desarrollar endpoint para crear nueva sala
  - Implementar validación de códigos de sala
  - Crear lógica para unirse a salas existentes
  - Manejar límite de 8 jugadores por sala
  - Implementar asignación de permisos de host
  - _Requisitos: 1.1, 1.2, 2.2, 2.3_

- [ ] 5. Crear sistema de generación de tableros únicos
  - Implementar algoritmo de barajado del mazo
  - Crear función para generar tableros 4x4 únicos
  - Asegurar que cada jugador reciba cartas diferentes
  - Validar que los tableros usen solo cartas del mazo definido
  - _Requisitos: 3.1, 3.3, 8.3, 8.5_

- [ ] 6. Desarrollar mecánica de cantado de cartas
  - Implementar loop de cantado cada 4 segundos
  - Crear sistema de sincronización de cartas para todos los jugadores
  - Manejar barajado inicial y orden de cantado
  - Implementar historial de cartas cantadas
  - _Requisitos: 4.1, 4.2, 4.4, 4.5, 8.4_

- [ ] 7. Implementar validación de victoria y manejo de empates
  - Crear función para validar tableros completos (16 casillas)
  - Verificar que cartas marcadas estén en conjunto de cartas cantadas
  - Implementar procesamiento de claims en orden de llegada
  - Manejar terminación de partida al declarar ganador
  - _Requisitos: 5.2, 5.3, 5.5, 9.1, 9.2, 9.5_

- [ ] 8. Desarrollar componentes React del frontend
  - Crear componente Home con formularios de crear/unirse
  - Implementar componente Lobby con lista de jugadores
  - Desarrollar componente Game con tablero 4x4 clickeable
  - Crear componente CurrentCard para mostrar carta cantada
  - Implementar botón de "¡Lotería!" y manejo de claims
  - _Requisitos: 3.4, 3.5, 4.1, 5.1_

- [ ] 9. Configurar comunicación WebSocket en el cliente
  - Integrar Socket.IO client en React
  - Implementar manejo de eventos de sala y juego
  - Crear sistema de reconexión automática
  - Manejar estados de conexión y errores
  - _Requisitos: 1.4, 1.5, 4.5_

- [ ] 10. Implementar interfaz temática del Día de Muertos con Tailwind CSS
  - Aplicar paleta de colores naranja (#ffb347) y morado (#7a1fa2) usando clases de Tailwind
  - Configurar tipografía Inter o Atkinson en Tailwind config
  - Crear diseño minimalista y responsive con utilidades de Tailwind
  - Mostrar cartas con nombres y emojis apropiados
  - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Integrar funcionalidad de marcado de tablero
  - Implementar clicks en casillas del tablero 4x4
  - Crear indicadores visuales para cartas marcadas
  - Sincronizar estado de marcas con el servidor
  - Validar que solo se marquen cartas cantadas
  - _Requisitos: 3.5, 5.2_

- [ ] 12. Manejar desconexiones y reconexiones
  - Implementar limpieza de jugadores desconectados
  - Mantener estado de partida cuando se va el host
  - Crear sistema de reconexión para jugadores
  - Actualizar listas de jugadores en tiempo real
  - _Requisitos: 1.5, 2.5_

- [ ]* 13. Implementar sistema de testing
  - Crear tests unitarios para lógica de validación
  - Escribir tests de integración para flujo de Socket.IO
  - Implementar tests para generación de tableros únicos
  - Crear tests para manejo de empates y claims
  - _Requisitos: Todos los requisitos_

- [ ] 14. Configurar despliegue y optimización
  - Preparar build de producción para React
  - Configurar variables de entorno para despliegue
  - Optimizar bundle size y performance
  - Preparar configuración para Vercel (frontend) y Render (backend)
  - _Requisitos: 7.5_

- [ ]* 15. Documentación y guía de usuario
  - Crear README con instrucciones de instalación
  - Documentar API de eventos Socket.IO
  - Escribir guía de juego para usuarios
  - Documentar proceso de despliegue
  - _Requisitos: Todos los requisitos_
