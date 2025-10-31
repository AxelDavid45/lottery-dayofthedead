---
inclusion: always
---

# Git Workflow - Recordatorio para Commits

## Regla Importante
**SIEMPRE hacer commit al completar cada tarea del spec**

## Flujo de Trabajo
1. Al completar una tarea, ANTES de marcarla como completada:
   - Hacer `git add .` para agregar todos los archivos nuevos/modificados
   - Hacer commit con mensaje descriptivo que incluya el número de tarea
   - Ejemplo: `git commit -m "feat: implementar tipos TypeScript y modelos de datos (tarea 2)"`

2. Formato de mensajes de commit:
   - `feat: descripción breve (tarea X)` - para nuevas funcionalidades
   - `fix: descripción breve (tarea X)` - para correcciones
   - `refactor: descripción breve (tarea X)` - para refactorizaciones
   - `test: descripción breve (tarea X)` - para pruebas

## Puntos de Commit Importantes
- Al completar cada tarea individual
- Antes de hacer pruebas funcionales
- Después de resolver errores o bugs
- Al alcanzar hitos funcionales (ej: servidor básico funcionando)

## Recordatorio
**NO OLVIDES**: Siempre preguntar si debo hacer commit al completar una tarea, especialmente cuando el código sea ejecutable y funcional.