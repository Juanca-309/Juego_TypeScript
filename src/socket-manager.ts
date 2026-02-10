// Socket Manager - Singleton para mantener la conexión del socket entre páginas
import type { Player } from './types.js';

export interface GameState {
    roomCode: string;
    playerName: string;
    playerId: string;
    isHost: boolean;
    players: Player[];
    currentRound?: number;
    totalRounds?: number;
    currentPlayerIndex?: number;
}

class SocketManager {
    private static instance: SocketManager;
    private socket: any = null;
    private gameState: GameState | null = null;
    
    private constructor() {
        this.loadState();
    }
    
    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }
    
    public getSocket(): any {
        if (!this.socket && typeof (window as any).io !== 'undefined') {
            this.socket = (window as any).io();
        }
        return this.socket;
    }
    
    public saveState(state: Partial<GameState>): void {
        this.gameState = { ...this.gameState, ...state } as GameState;
        localStorage.setItem('gameState', JSON.stringify(this.gameState));
    }
    
    public getState(): GameState | null {
        return this.gameState;
    }
    
    public loadState(): void {
        const saved = localStorage.getItem('gameState');
        if (saved) {
            this.gameState = JSON.parse(saved);
        }
    }
    
    public clearState(): void {
        this.gameState = null;
        localStorage.removeItem('gameState');
    }
    
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.clearState();
    }
}

export const socketManager = SocketManager.getInstance();
