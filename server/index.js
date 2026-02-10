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
    socket.on('create-room', (playerName, callback) => {
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
        callback({ success: true, roomCode, room });
    });

    // Unirse a sala existente
    socket.on('join-room', (data, callback) => {
        const { roomCode, playerName } = data;
        const room = rooms.get(roomCode);

        if (!room) {
            callback({ success: false, error: 'Sala no encontrada' });
            return;
        }

        if (room.gameState.isPlaying) {
            callback({ success: false, error: 'El juego ya ha comenzado' });
            return;
        }

        if (room.players.length >= 10) {
            callback({ success: false, error: 'Sala llena (máximo 10 jugadores)' });
            return;
        }

        if (room.players.some(p => p.name === playerName)) {
            callback({ success: false, error: 'Ya existe un jugador con ese nombre' });
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
        
        // Notificar a todos en la sala
        io.to(roomCode).emit('player-joined', { player, players: room.players });
        callback({ success: true, room });
    });

    // Obtener información de la sala
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

        // Si el host se desconecta y el juego no ha empezado, eliminar la sala
        if (socket.id === room.host && !room.gameState.isPlaying) {
            rooms.delete(roomCode);
            io.to(roomCode).emit('room-closed');
            console.log(`Sala ${roomCode} cerrada (host desconectado)`);
        } else {
            io.to(roomCode).emit('player-disconnected', { playerId: socket.id, player });
        }
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
