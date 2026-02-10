# 📋 Flujo de Navegación - Ruleta TypeScript

## 🔄 Arquitectura Multi-Página

Este juego utiliza una arquitectura multi-página donde cada pantalla tiene su propio archivo HTML y TypeScript. La comunicación entre páginas se mantiene mediante:

1. **Socket.IO**: Conexión persistente al servidor
2. **LocalStorage**: Estado del juego y datos del jugador
3. **SocketManager**: Singleton que gestiona el socket y estado entre páginas

---

## 📄 Páginas del Juego

### 1. index.html → Redirección
**Propósito**: Redirige automáticamente a menu.html  
**Script**: Ninguno (solo redirección HTML)

```
Flujo: index.html ➜ menu.html (automático)
```

---

### 2. menu.html → Menú Principal
**Propósito**: Crear o unirse a una sala  
**Script**: `dist/menu.js` (compilado de `src/menu.ts`)

**Funcionalidades**:
- Botón "Crear Sala Nueva" → Genera código de 6 caracteres
- Botón "Unirse a Sala" → Solicita código + nombre
- Validación de entrada de usuario
- Emisión de eventos Socket.IO: `create-room`, `join-room`

**Estado guardado**:
```typescript
{
  roomCode: string,
  playerName: string,
  playerId: string,
  isHost: boolean,
  players: Player[]
}
```

```
Flujo: menu.html ➜ lobby.html (tras crear/unirse)
```

---

### 3. lobby.html → Sala de Espera
**Propósito**: Esperar a que se unan más jugadores  
**Script**: `dist/lobby.js` (compilado de `src/lobby.ts`)

**Funcionalidades**:
- Mostrar código de sala (con botón copiar)
- Grid de jugadores conectados (avatares + nombres)
- Botón "Iniciar Juego" (solo visible para el host)
- Detección de jugadores que se unen/salen en tiempo real
- Mínimo 2 jugadores para iniciar

**Eventos Socket.IO escuchados**:
- `players-updated`: Actualiza lista de jugadores
- `game-started`: Navega a game.html
- `player-joined`: Muestra notificación
- `player-left`: Actualiza UI
- `room-closed`: Vuelve al menú

```
Flujo: lobby.html ➜ game.html (cuando host inicia)
       lobby.html ➜ menu.html (si se cierra sala o se sale)
```

---

### 4. game.html → Juego Activo
**Propósito**: Juego principal con ruleta y preguntas  
**Script**: `dist/game-page.js` (compilado de `src/game-page.ts`)

**Funcionalidades**:
- Ruleta SVG animada (8 segmentos: 50-500 puntos)
- Sistema de turnos (indicador visual del jugador actual)
- Panel de preguntas con 4 respuestas
- Timer de 30 segundos
- Scoreboard en tiempo real
- Rondas progresivas (1/10, 2/10... 10/10)

**Eventos Socket.IO escuchados**:
- `game-state-update`: Sincroniza estado del juego
- `wheel-spinning`: Anima ruleta con rotación específica
- `question-shown`: Muestra pregunta y respuestas
- `answer-result`: Procesa respuesta correcta/incorrecta
- `turn-changed`: Cambia al siguiente jugador
- `game-ended`: Navega a results.html

**Eventos Socket.IO emitidos**:
- `spin-wheel`: Jugador actual gira ruleta
- `show-question`: Host solicita pregunta
- `answer-question`: Jugador envía respuesta
- `next-turn`: Host avanza al siguiente turno
- `exit-game`: Jugador sale del juego

```
Flujo: game.html ➜ results.html (tras 10 rondas)
       game.html ➜ menu.html (si se sale o sala cerrada)
```

---

### 5. results.html → Resultados Finales
**Propósito**: Mostrar ganador y puntuaciones finales  
**Script**: `dist/results.js` (compilado de `src/results.ts`)

**Funcionalidades**:
- Podio visual (Top 3 con 🏆🥈🥉)
- Tabla completa de puntuaciones ordenadas
- Confetti animado (celebración automática)
- Botón "Jugar de Nuevo" (solo host)
- Botón "Nuevos Jugadores" (vuelve al menú)

**Eventos Socket.IO escuchados**:
- `game-restarted`: Vuelve a lobby.html
- `room-closed`: Vuelve al menú

```
Flujo: results.html ➜ lobby.html (si host reinicia)
       results.html ➜ menu.html (nuevos jugadores)
```

---

## 🔐 Gestión de Estado

### SocketManager (Singleton)

```typescript
// src/socket-manager.ts

class SocketManager {
  - socket: Socket.IO instance (compartida entre páginas)
  - gameState: Estado persistente en localStorage
  
  + getSocket(): Obtiene o crea conexión Socket.IO
  + saveState(state): Guarda estado en localStorage
  + getState(): Recupera estado actual
  + clearState(): Limpia estado (al salir)
  + disconnect(): Desconecta socket y limpia
}
```

### Estado Persistente (localStorage)

```typescript
interface GameState {
  roomCode: string;          // Ej: "ABC123"
  playerName: string;        // Ej: "Juan"
  playerId: string;          // Socket ID
  isHost: boolean;           // true si creó la sala
  players: Player[];         // Lista de jugadores
  currentRound?: number;     // Ronda actual (1-10)
  totalRounds?: number;      // Total de rondas (10)
  currentPlayerIndex?: number; // Índice del jugador activo
}
```

---

## 🌐 Comunicación Cliente-Servidor

### Eventos del Cliente → Servidor

| Evento | Emitido desde | Datos | Propósito |
|--------|---------------|-------|-----------|
| `create-room` | menu.html | `playerName` | Crear nueva sala |
| `join-room` | menu.html | `{roomCode, playerName}` | Unirse a sala existente |
| `start-game` | lobby.html | `roomCode` | Iniciar juego (host) |
| `spin-wheel` | game.html | `roomCode` | Girar ruleta |
| `show-question` | game.html | `{question, points}` | Solicitar pregunta |
| `answer-question` | game.html | `{isCorrect, correctIndex, points}` | Enviar respuesta |
| `next-turn` | game.html | (ninguno) | Avanzar turno (host) |
| `exit-game` | game.html | `roomCode` | Salir del juego |
| `leave-room` | lobby/results | `roomCode` | Abandonar sala |

### Eventos del Servidor → Cliente

| Evento | Recibido en | Datos | Acción |
|--------|-------------|-------|--------|
| `room-created` | menu.html | `{roomCode, playerId}` | Navegar a lobby |
| `room-joined` | menu.html | `{playerId, players}` | Navegar a lobby |
| `players-updated` | lobby.html | `players[]` | Actualizar grid |
| `game-started` | lobby.html | `{players, gameState}` | Navegar a game |
| `wheel-spinning` | game.html | `{rotation, points}` | Animar ruleta |
| `question-shown` | game.html | `{question, points}` | Mostrar pregunta |
| `answer-result` | game.html | `{isCorrect, correctIndex, players}` | Procesar respuesta |
| `turn-changed` | game.html | `{currentPlayerIndex, currentRound}` | Siguiente turno |
| `game-ended` | game.html | `{players}` | Navegar a results |
| `room-closed` | Cualquiera | (ninguno) | Volver al menú |
| `error` | Cualquiera | `message` | Mostrar notificación |

---

## 🎯 Validaciones Importantes

### Seguridad de Navegación

Cada página verifica el estado antes de renderizar:

```typescript
// Ejemplo en game-page.ts
constructor() {
  const state = socketManager.getState();
  
  if (!state || !state.roomCode) {
    // Si no hay estado válido, redirigir al menú
    window.location.href = 'menu.html';
    return;
  }
  
  // Continuar con inicialización...
}
```

### Control de Permisos

- **Solo el host puede**: Iniciar juego, reiniciar juego, controlar flujo de turnos
- **Solo el jugador del turno puede**: Girar ruleta, responder preguntas
- **Todos los jugadores pueden**: Ver estado en tiempo real, ver resultados

---

## 🔧 Debugging

### Ver estado actual en consola:

```javascript
// En cualquier página del juego
import { socketManager } from './socket-manager.js';

console.log(socketManager.getState());
```

### Ver eventos Socket.IO:

```javascript
// En server/index.js, todos los eventos están logueados
// Ejemplo de salida en servidor:
// Usuario conectado: xyz123
// Sala creada: ABC123 por Juan
// Usuario xyz123 se unió a sala ABC123
```

---

## 📱 Responsive Design

Todas las páginas son completamente responsivas:

- **Desktop** (> 768px): Layout horizontal, scoreboard fijo
- **Tablet** (481-768px): Layout ajustado, botones más grandes
- **Mobile** (≤ 480px): Layout vertical, una columna, rueda escalada

---

## 🚀 Próximas Mejoras Sugeridas

1. **PWA**: Convertir en Progressive Web App instalable
2. **Reconexión automática**: Manejar desconexiones temporales
3. **Chat en tiempo real**: Comunicación entre jugadores
4. **Avatares personalizados**: Selección de avatar en menú
5. **Historial de partidas**: Guardar estadísticas de juegos anteriores
6. **Modos de juego**: Añadir variantes (modo rápido, modo difícil, etc.)

---

## 📞 Soporte

Para reportar bugs o sugerir mejoras, crea un issue en el repositorio.
