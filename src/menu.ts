// Menu Page - Página principal del menú
import { socketManager } from './socket-manager.js';
import { showNotification, createParticles } from './utils.js';

class MenuPage {
    private socket: any;
    
    constructor() {
        // Limpiar cualquier estado anterior
        socketManager.clearState();
        
        // Obtener/crear socket
        this.socket = socketManager.getSocket();
        
        // Inicializar partículas
        createParticles();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        const createRoomBtn = document.getElementById('createRoomBtn');
        const joinRoomBtn = document.getElementById('joinRoomBtn');
        const cancelCreateBtn = document.getElementById('cancelCreateBtn');
        const cancelJoinBtn = document.getElementById('cancelJoinBtn');
        const confirmCreateBtn = document.getElementById('confirmCreateBtn');
        const confirmJoinBtn = document.getElementById('confirmJoinBtn');
        
        createRoomBtn?.addEventListener('click', () => this.showCreateModal());
        joinRoomBtn?.addEventListener('click', () => this.showJoinModal());
        cancelCreateBtn?.addEventListener('click', () => this.hideCreateModal());
        cancelJoinBtn?.addEventListener('click', () => this.hideJoinModal());
        confirmCreateBtn?.addEventListener('click', () => this.createRoom());
        confirmJoinBtn?.addEventListener('click', () => this.joinRoom());
        
        // Enter key support
        document.getElementById('createPlayerName')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createRoom();
        });
        
        const joinPlayerName = document.getElementById('joinPlayerName');
        const joinRoomCode = document.getElementById('joinRoomCode');
        joinPlayerName?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') (joinRoomCode as HTMLInputElement)?.focus();
        });
        joinRoomCode?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        
        // Auto-uppercase para código de sala
        joinRoomCode?.addEventListener('input', (e) => {
            const input = e.target as HTMLInputElement;
            input.value = input.value.toUpperCase();
        });
    }
    
    private showCreateModal(): void {
        const modal = document.getElementById('createRoomModal');
        modal?.classList.remove('hidden');
        (document.getElementById('createPlayerName') as HTMLInputElement)?.focus();
    }
    
    private hideCreateModal(): void {
        const modal = document.getElementById('createRoomModal');
        modal?.classList.add('hidden');
        (document.getElementById('createPlayerName') as HTMLInputElement).value = '';
    }
    
    private showJoinModal(): void {
        const modal = document.getElementById('joinRoomModal');
        modal?.classList.remove('hidden');
        (document.getElementById('joinPlayerName') as HTMLInputElement)?.focus();
    }
    
    private hideJoinModal(): void {
        const modal = document.getElementById('joinRoomModal');
        modal?.classList.add('hidden');
        (document.getElementById('joinPlayerName') as HTMLInputElement).value = '';
        (document.getElementById('joinRoomCode') as HTMLInputElement).value = '';
    }
    
    private createRoom(): void {
        const input = document.getElementById('createPlayerName') as HTMLInputElement;
        const playerName = input.value.trim();
        
        if (!playerName) {
            showNotification({ message: 'Por favor ingresa tu nombre', type: 'error' });
            return;
        }
        
        // Emitir evento al servidor
        this.socket.emit('create-room', playerName);
        
        // Esperar respuesta del servidor
        this.socket.once('room-created', (data: { roomCode: string, playerId: string }) => {
            socketManager.saveState({
                roomCode: data.roomCode,
                playerName: playerName,
                playerId: data.playerId,
                isHost: true,
                players: []
            });
            
            // Navegar a lobby
            window.location.href = 'lobby.html';
        });
        
        this.socket.once('error', (message: string) => {
            showNotification({ message: message, type: 'error' });
        });
    }
    
    private joinRoom(): void {
        const nameInput = document.getElementById('joinPlayerName') as HTMLInputElement;
        const codeInput = document.getElementById('joinRoomCode') as HTMLInputElement;
        
        const playerName = nameInput.value.trim();
        const roomCode = codeInput.value.trim().toUpperCase();
        
        if (!playerName) {
            showNotification({ message: 'Por favor ingresa tu nombre', type: 'error' });
            return;
        }
        
        if (!roomCode || roomCode.length !== 6) {
            showNotification({ message: 'Por favor ingresa un código válido de 6 caracteres', type: 'error' });
            return;
        }
        
        // Emitir evento al servidor
        this.socket.emit('join-room', { roomCode, playerName });
        
        // Esperar respuesta
        this.socket.once('room-joined', (data: { playerId: string, players: any[] }) => {
            socketManager.saveState({
                roomCode: roomCode,
                playerName: playerName,
                playerId: data.playerId,
                isHost: false,
                players: data.players
            });
            
            // Navegar a lobby
            window.location.href = 'lobby.html';
        });
        
        this.socket.once('error', (message: string) => {
            showNotification({ message: message, type: 'error' });
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MenuPage();
});
