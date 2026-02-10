// Lobby Page - Sala de espera
import { socketManager } from './socket-manager.js';
import { showNotification, createParticles } from './utils.js';
import type { Player } from './types.js';

class LobbyPage {
    private socket: any;
    private state: any;
    
    constructor() {
        // Cargar estado
        this.state = socketManager.getState();
        
        if (!this.state || !this.state.roomCode) {
            // Si no hay estado, volver al menú
            window.location.href = 'menu.html';
            return;
        }
        
        // Obtener socket
        this.socket = socketManager.getSocket();
        
        // Inicializar partículas
        createParticles();
        
        // Setup UI
        this.setupUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup socket listeners
        this.setupSocketListeners();
        
        // Reconectar a la sala con los datos guardados
        this.socket.emit('reconnect-to-room', {
            roomCode: this.state.roomCode,
            playerName: this.state.playerName,
            oldPlayerId: this.state.playerId
        });
    }
    
    private setupUI(): void {
        // Mostrar código de sala
        const roomCodeDisplay = document.getElementById('roomCodeDisplay');
        if (roomCodeDisplay) {
            roomCodeDisplay.textContent = this.state.roomCode;
        }
        
        // Actualizar grid de jugadores
        this.updatePlayersGrid(this.state.players || []);
    }
    
    private setupEventListeners(): void {
        // Botón de volver
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres salir de la sala?')) {
                this.socket.emit('leave-room', this.state.roomCode);
                socketManager.clearState();
                window.location.href = 'menu.html';
            }
        });
        
        // Botón de copiar código
        document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(this.state.roomCode).then(() => {
                showNotification({ message: 'Código copiado al portapapeles', type: 'success' });
            });
        });
        
        // Botón de iniciar juego (solo host)
        document.getElementById('startGameBtnLobby')?.addEventListener('click', () => {
            if (this.state.isHost) {
                this.socket.emit('start-game', this.state.roomCode);
            }
        });
    }
    
    private setupSocketListeners(): void {
        // Cuando se reconecta exitosamente
        this.socket.on('reconnected', (data: any) => {
            this.state.playerId = data.playerId;
            this.state.players = data.players;
            socketManager.saveState(this.state);
            this.updatePlayersGrid(data.players);
            this.updateStartButton(data.players.length);
        });
        
        // Cuando se actualiza la lista de jugadores
        this.socket.on('players-updated', (players: Player[]) => {
            this.state.players = players;
            socketManager.saveState({ players });
            this.updatePlayersGrid(players);
            this.updateStartButton(players.length);
        });
        
        // Cuando el juego comienza
        this.socket.on('game-started', () => {
            window.location.href = 'game.html';
        });
        
        // Cuando un jugador se une
        this.socket.on('player-joined', (data: { playerName: string }) => {
            showNotification({ message: `${data.playerName} se ha unido`, type: 'info' });
        });
        
        // Cuando un jugador se va
        this.socket.on('player-left', (data: { playerName: string }) => {
            showNotification({ message: `${data.playerName} se ha ido`, type: 'info' });
        });
        
        // Error o sala cerrada
        this.socket.on('room-closed', () => {
            showNotification({ message: 'La sala ha sido cerrada', type: 'error' });
            socketManager.clearState();
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 2000);
        });
        
        this.socket.on('error', (message: string) => {
            showNotification({ message: message, type: 'error' });
        });
    }
    
    private updatePlayersGrid(players: Player[]): void {
        const grid = document.getElementById('playersGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        players.forEach((player, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            if (player.isHost) playerCard.classList.add('host');
            if (!player.connected) playerCard.classList.add('disconnected');
            
            // Array extendido de avatares más variados
            const avatarEmojis = [
                '👨‍💻', '👩‍💻', '🧑‍💻', 
                '👨‍🚀', '👩‍🚀', '🧑‍🚀',
                '👨‍🎨', '👩‍🎨', '🧑‍🎨',
                '🦸‍♂️', '🦸‍♀️', '🦹‍♂️', '🦹‍♀️',
                '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️',
                '🤖', '👾', '👽', '🎮'
            ];
            const emoji = avatarEmojis[index % avatarEmojis.length];
            
            const isYou = this.state.playerId === player.id;
            
            playerCard.innerHTML = `
                <div class="player-avatar" title="${player.name}">
                    ${emoji}
                </div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-badges">
                        ${player.isHost ? '<span class="host-badge">👑 Host</span>' : ''}
                        ${isYou ? '<span class="you-badge">✨ Tú</span>' : ''}
                    </div>
                    ${!player.connected ? '<div class="disconnected-badge">🔌 Desconectado</div>' : ''}
                </div>
            `;
            
            grid.appendChild(playerCard);
        });
    }
    
    private updateStartButton(playerCount: number): void {
        const startBtn = document.getElementById('startGameBtnLobby') as HTMLButtonElement;
        const hint = document.getElementById('lobbyHint');
        
        if (!this.state.isHost) {
            if (startBtn) startBtn.style.display = 'none';
            if (hint) hint.textContent = 'Esperando a que el host inicie el juego...';
            return;
        }
        
        if (playerCount >= 2) {
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.classList.add('pulse');
            }
            if (hint) hint.textContent = `${playerCount} jugadores listos. ¡Puedes iniciar!`;
        } else {
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.classList.remove('pulse');
            }
            if (hint) hint.textContent = 'Se necesitan al menos 2 jugadores';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LobbyPage();
});
