import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(join(__dirname, '..')));

// Estructura de datos para salas
const rooms = new Map();

// Generar código único de sala
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.IO eventos
io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Crear nueva sala
    socket.on('create-room', (playerName) => {
        const roomCode = generateRoomCode();
        const room = {
            code: roomCode,
            host: socket.id,
            players: [{
                id: socket.id,
                name: playerName,
                score: 0,
                isHost: true,
                connected: true
            }],
            gameState: {
                currentPlayerIndex: 0,
                currentRound: 1,
                totalRounds: 10,
                usedQuestions: [],
                isPlaying: false
            }
        };
        
        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.roomCode = roomCode;
        
        console.log(`Sala creada: ${roomCode} por ${playerName}`);
        socket.emit('room-created', { roomCode, playerId: socket.id });
    });

    // Unirse a sala existente
    socket.on('join-room', (data) => {
        const { roomCode, playerName } = data;
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', 'Sala no encontrada');
            return;
        }

        if (room.gameState.isPlaying) {
            socket.emit('error', 'El juego ya ha comenzado');
            return;
        }

        if (room.players.length >= 10) {
            socket.emit('error', 'Sala llena (máximo 10 jugadores)');
            return;
        }

        if (room.players.some(p => p.name === playerName)) {
            socket.emit('error', 'Ya existe un jugador con ese nombre');
            return;
        }

        const player = {
            id: socket.id,
            name: playerName,
            score: 0,
            isHost: false,
            connected: true
        };

        room.players.push(player);
        socket.join(roomCode);
        socket.roomCode = roomCode;

        console.log(`${playerName} se unió a sala ${roomCode}`);
        
        // Notificar al jugador que se unió
        socket.emit('room-joined', { playerId: socket.id, players: room.players });
        
        // Notificar a todos en la sala
        io.to(roomCode).emit('players-updated', room.players);
    });

    // Reconectar a una sala existente (tras navegación de páginas)
    socket.on('reconnect-to-room', (data) => {
        const { roomCode, playerName, oldPlayerId } = data;
        const room = rooms.get(roomCode);
        
        if (!room) {
            socket.emit('error', 'Sala no encontrada');
            return;
        }
        
        // Buscar al jugador por nombre o ID antiguo
        const playerIndex = room.players.findIndex(p => 
            p.name === playerName || p.id === oldPlayerId
        );
        
        if (playerIndex !== -1) {
            // Cancelar el timeout de desconexión si existe
            if (room.disconnectTimeouts && room.disconnectTimeouts.has(playerName)) {
                clearTimeout(room.disconnectTimeouts.get(playerName));
                room.disconnectTimeouts.delete(playerName);
            }
            
            // Actualizar el socket ID del jugador
            room.players[playerIndex].id = socket.id;
            room.players[playerIndex].connected = true;
            
            // Si era el host, actualizar host
            if (room.host === oldPlayerId || room.players[playerIndex].isHost) {
                room.host = socket.id;
            }
            
            socket.join(roomCode);
            socket.roomCode = roomCode;
            
            console.log(`${playerName} reconectado a sala ${roomCode}`);
            
            // Enviar estado actualizado
            socket.emit('reconnected', { 
                playerId: socket.id,
                players: room.players,
                gameState: room.gameState
            });
            
            // Notificar a los demás
            io.to(roomCode).emit('players-updated', room.players);
        } else {
            socket.emit('error', 'Jugador no encontrado en la sala');
        }
    });
    
    // Obtener estado actual de la sala
    socket.on('get-room-state', (roomCode) => {
        const room = rooms.get(roomCode);
        if (room) {
            socket.emit('room-state', { 
                players: room.players, 
                gameState: room.gameState 
            });
        } else {
            socket.emit('error', 'Sala no encontrada');
        }
    });
    
    // Salir de la sala
    socket.on('leave-room', (roomCode) => {
        if (!roomCode) roomCode = socket.roomCode;
        if (!roomCode) return;
        
        const room = rooms.get(roomCode);
        if (!room) return;
        
        // Remover jugador de la sala
        room.players = room.players.filter(p => p.id !== socket.id);
        socket.leave(roomCode);
        
        // Si era el host, cerrar la sala
        if (room.host === socket.id) {
            io.to(roomCode).emit('room-closed');
            rooms.delete(roomCode);
            console.log(`Sala ${roomCode} cerrada (host desconectado)`);
        } else {
            // Notificar a los demás
            io.to(roomCode).emit('players-updated', room.players);
        }
        
        socket.roomCode = null;
    });

    // Obtener información de la sala (deprecated - usar get-room-state)
    socket.on('get-room', (roomCode, callback) => {
        const room = rooms.get(roomCode);
        if (room) {
            callback({ success: true, room });
        } else {
            callback({ success: false, error: 'Sala no encontrada' });
        }
    });

    // Remover jugador de sala (antes de empezar)
    socket.on('remove-player', (playerId) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room || room.gameState.isPlaying) return;

        room.players = room.players.filter(p => p.id !== playerId);
        io.to(roomCode).emit('player-removed', { playerId, players: room.players });
    });

    // Iniciar juego
    socket.on('start-game', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room || socket.id !== room.host) return;

        if (room.players.length < 2) {
            socket.emit('error', { message: 'Se necesitan al menos 2 jugadores' });
            return;
        }

        room.gameState.isPlaying = true;
        room.gameState.currentRound = 1;
        room.gameState.currentPlayerIndex = 0;
        room.gameState.usedQuestions = [];
        room.players.forEach(p => p.score = 0);

        io.to(roomCode).emit('game-started', { gameState: room.gameState, players: room.players });
        console.log(`Juego iniciado en sala ${roomCode}`);
    });
    
    // Obtener estado del juego en progreso
    socket.on('get-game-state', (roomCode) => {
        const room = rooms.get(roomCode);
        if (room && room.gameState.isPlaying) {
            socket.emit('game-state-update', {
                players: room.players,
                currentRound: room.gameState.currentRound,
                totalRounds: room.gameState.totalRounds,
                currentPlayerIndex: room.gameState.currentPlayerIndex
            });
        } else if (room) {
            socket.emit('room-state', { 
                players: room.players, 
                gameState: room.gameState 
            });
        } else {
            socket.emit('error', 'Sala no encontrada');
        }
    });

    // Girar ruleta
    socket.on('spin-wheel', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        // Verificar que es el turno del jugador
        const currentPlayer = room.players[room.gameState.currentPlayerIndex];
        if (currentPlayer.id !== socket.id) {
            socket.emit('error', { message: 'No es tu turno' });
            return;
        }

        // Enviar resultado de la ruleta a todos
        io.to(roomCode).emit('wheel-spinning', data);
    });

    // Mostrar pregunta
    socket.on('show-question', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        room.gameState.usedQuestions.push(data.questionId);
        io.to(roomCode).emit('question-shown', data);
    });

    // Responder pregunta
    socket.on('answer-question', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        const currentPlayer = room.players[room.gameState.currentPlayerIndex];
        if (currentPlayer.id !== socket.id) return;

        // Actualizar puntuación
        if (data.isCorrect) {
            currentPlayer.score += data.points;
        }

        // Enviar resultado a todos
        io.to(roomCode).emit('answer-result', {
            playerId: socket.id,
            isCorrect: data.isCorrect,
            correctIndex: data.correctIndex,
            players: room.players
        });
    });

    // Siguiente turno
    socket.on('next-turn', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        // Siguiente jugador
        room.gameState.currentPlayerIndex = (room.gameState.currentPlayerIndex + 1) % room.players.length;

        // Verificar si la ronda terminó
        if (room.gameState.currentPlayerIndex === 0) {
            room.gameState.currentRound++;

            // Verificar si el juego terminó
            if (room.gameState.currentRound > room.gameState.totalRounds) {
                room.gameState.isPlaying = false;
                io.to(roomCode).emit('game-ended', { players: room.players });
                console.log(`Juego terminado en sala ${roomCode}`);
                return;
            }
        }

        io.to(roomCode).emit('turn-changed', {
            currentPlayerIndex: room.gameState.currentPlayerIndex,
            currentRound: room.gameState.currentRound,
            currentPlayer: room.players[room.gameState.currentPlayerIndex]
        });
    });

    // Salir del juego
    socket.on('exit-game', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        room.gameState.isPlaying = false;
        io.to(roomCode).emit('game-exited');
    });

    // Jugar de nuevo
    socket.on('play-again', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room || socket.id !== room.host) return;

        room.gameState.isPlaying = true;
        room.gameState.currentRound = 1;
        room.gameState.currentPlayerIndex = 0;
        room.gameState.usedQuestions = [];
        room.players.forEach(p => p.score = 0);

        io.to(roomCode).emit('game-started', { gameState: room.gameState, players: room.players });
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
        
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        player.connected = false;

        // Dar tiempo de reconexión (30 segundos) antes de eliminar la sala
        // Si el host se desconecta, esperar a ver si reconecta
        const disconnectTimeout = setTimeout(() => {
            const currentRoom = rooms.get(roomCode);
            if (!currentRoom) return;
            
            const currentPlayer = currentRoom.players.find(p => p.name === player.name);
            
            // Si después de 30 segundos sigue desconectado
            if (currentPlayer && !currentPlayer.connected) {
                // Si era el host y el juego no ha empezado, cerrar sala
                if (player.isHost && !currentRoom.gameState.isPlaying) {
                    rooms.delete(roomCode);
                    io.to(roomCode).emit('room-closed');
                    console.log(`Sala ${roomCode} cerrada (host no reconectó)`);
                } else {
                    // Remover jugador de la sala
                    currentRoom.players = currentRoom.players.filter(p => p.name !== player.name);
                    io.to(roomCode).emit('players-updated', currentRoom.players);
                }
            }
        }, 30000); // 30 segundos de gracia
        
        // Guardar el timeout para poder cancelarlo si reconecta
        if (!room.disconnectTimeouts) {
            room.disconnectTimeouts = new Map();
        }
        room.disconnectTimeouts.set(player.name, disconnectTimeout);
        
        // Notificar temporalmente
        io.to(roomCode).emit('player-disconnected', { playerId: socket.id, player });
    });
});

httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🎡 Ruleta TypeScript Server          ║
║                                        ║
║  🌐 Servidor corriendo en:            ║
║     http://localhost:${PORT}              ║
║                                        ║
║  📱 Acceso desde móviles:              ║
║     http://[TU_IP_LOCAL]:${PORT}          ║
║                                        ║
║  🎮 ¡Listo para jugar online!          ║
╚════════════════════════════════════════╝
    `);
});
