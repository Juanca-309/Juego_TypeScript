// Results Page - Página de resultados finales
import { socketManager } from './socket-manager.js';
import { showNotification, launchConfetti, createParticles } from './utils.js';
import type { Player } from './types.js';

class ResultsPage {
    private socket: any;
    private state: any;
    
    constructor() {
        // Cargar estado
        this.state = socketManager.getState();
        
        if (!this.state || !this.state.players) {
            window.location.href = 'menu.html';
            return;
        }
        
        this.socket = socketManager.getSocket();
        
        // Inicializar partículas
        createParticles();
        
        // Setup
        this.displayResults();
        this.setupEventListeners();
        this.setupSocketListeners();
        
        // Confeti para celebrar
        launchConfetti();
        setTimeout(() => launchConfetti(), 1000);
        setTimeout(() => launchConfetti(), 2000);
    }
    
    private setupEventListeners(): void {
        // Jugar de nuevo
        document.getElementById('playAgainBtn')?.addEventListener('click', () => {
            if (this.state.isHost) {
                this.socket.emit('restart-game', this.state.roomCode);
            } else {
                showNotification({ message: 'Solo el host puede reiniciar el juego', type: 'info' });
            }
        });
        
        // Nuevos jugadores
        document.getElementById('newPlayersBtn')?.addEventListener('click', () => {
            if (confirm('¿Volver al menú? Esto cerrará la sala actual.')) {
                this.socket.emit('leave-room', this.state.roomCode);
                socketManager.clearState();
                window.location.href = 'menu.html';
            }
        });
    }
    
    private setupSocketListeners(): void {
        // Si el juego se reinicia
        this.socket.on('game-restarted', () => {
            showNotification({ message: '¡El juego se reiniciará!', type: 'success' });
            setTimeout(() => {
                window.location.href = 'lobby.html';
            }, 1000);
        });
        
        // Si la sala se cierra
        this.socket.on('room-closed', () => {
            showNotification({ message: 'La sala ha sido cerrada', type: 'info' });
            socketManager.clearState();
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 2000);
        });
    }
    
    private displayResults(): void {
        const players = this.state.players || [];
        const sortedPlayers = [...players].sort((a: Player, b: Player) => b.score - a.score);
        
        this.displayPodium(sortedPlayers);
        this.displayScoresTable(sortedPlayers);
    }
    
    private displayPodium(sortedPlayers: Player[]): void {
        const podium = document.getElementById('podium');
        if (!podium) return;
        
        const top3 = sortedPlayers.slice(0, 3);
        const positions = [
            { index: 1, height: '150px', order: 2, emoji: '🥈', className: 'silver' },
            { index: 0, height: '200px', order: 1, emoji: '🏆', className: 'gold' },
            { index: 2, height: '120px', order: 3, emoji: '🥉', className: 'bronze' }
        ];
        
        podium.innerHTML = positions.map(pos => {
            const player = top3[pos.index];
            if (!player) return '';
            
            return `
                <div class="podium-place ${pos.className}" style="height: ${pos.height}; order: ${pos.order}">
                    <div class="podium-rank">${pos.emoji}</div>
                    <div class="podium-player">
                        <div class="podium-name">${player.name}</div>
                        <div class="podium-score">${player.score} pts</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    private displayScoresTable(sortedPlayers: Player[]): void {
        const container = document.getElementById('finalScores');
        if (!container) return;
        
        container.innerHTML = `
            <table class="scores-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Jugador</th>
                        <th>Puntos</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedPlayers.map((player, index) => {
                        const medal = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                        return `
                            <tr class="${this.state.playerId === player.id ? 'highlight' : ''}">
                                <td>${index + 1} ${medal}</td>
                                <td style="color: ${player.color}">${player.name}</td>
                                <td><strong>${player.score}</strong></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ResultsPage();
});
