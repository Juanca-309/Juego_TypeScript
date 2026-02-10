// Game Page - Lógica del juego principal
import { socketManager, GameState } from './socket-manager.js';
import { showNotification, launchConfetti, createParticles, sleep, formatTime, getRandomColor } from './utils.js';
import { getRandomQuestion } from './questions.js';
import type { Player, Question, WheelSegment } from './types.js';

class GamePage {
    private socket: any;
    private state!: GameState;
    private wheelSegments!: WheelSegment[];
    private currentQuestion: Question | null = null;
    private questionTimer: number | null = null;
    private questionTimeLeft: number = 30;
    private isSpinning: boolean = false;
    private currentPoints: number = 0;
    private usedQuestions: Set<number> = new Set();
    
    constructor() {
        // Cargar estado
        const savedState = socketManager.getState();
        
        if (!savedState || !savedState.roomCode) {
            window.location.href = 'menu.html';
            return;
        }
        
        this.state = savedState;
        this.socket = socketManager.getSocket();
        
        this.wheelSegments = this.createWheelSegments();
        
        // Setup
        this.renderWheel();
        this.setupEventListeners();
        this.setupSocketListeners();
        this.updateGameInfo();
        this.updateScoreboard();
        
        // Reconectar a la sala
        this.socket.emit('reconnect-to-room', {
            roomCode: this.state.roomCode,
            playerName: this.state.playerName,
            oldPlayerId: this.state.playerId
        });
    }
    
    private createWheelSegments(): WheelSegment[] {
        return [
            { points: 100, color: '#3b82f6', label: '100' },
            { points: 200, color: '#8b5cf6', label: '200' },
            { points: 300, color: '#ec4899', label: '300' },
            { points: 400, color: '#f59e0b', label: '400' },
            { points: 500, color: '#10b981', label: '500' },
            { points: 50, color: '#06b6d4', label: '50' },
            { points: 150, color: '#f97316', label: '150' },
            { points: 250, color: '#6366f1', label: '250' }
        ];
    }
    
    private setupEventListeners(): void {
        // Botón girar
        document.getElementById('spinBtn')?.addEventListener('click', () => this.spinWheel());
        
        // Botón salir
        document.getElementById('exitGameBtn')?.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres salir del juego?')) {
                this.socket.emit('exit-game', this.state.roomCode);
                socketManager.clearState();
                window.location.href = 'menu.html';
            }
        });
    }
    
    private setupSocketListeners(): void {
        // Cuando se reconecta exitosamente
        this.socket.on('reconnected', (data: any) => {
            this.state.playerId = data.playerId;
            this.state.players = data.players;
            socketManager.saveState(this.state);
            
            if (data.gameState) {
                this.state.currentRound = data.gameState.currentRound;
                this.state.currentPlayerIndex = data.gameState.currentPlayerIndex;
            }
            
            this.updateGameInfo();
            this.updateScoreboard();
        });
        
        // Actualización de estado del juego
        this.socket.on('game-state-update', (data: any) => {
            this.state.players = data.players;
            this.state.currentRound = data.currentRound;
            this.state.currentPlayerIndex = data.currentPlayerIndex;
            socketManager.saveState(this.state);
            this.updateGameInfo();
            this.updateScoreboard();
        });
        
        // Ruleta girando
        this.socket.on('wheel-spinning', (data: any) => {
            this.animateWheelSpin(data.rotation, data.points);
        });
        
        // Mostrar pregunta
        this.socket.on('question-shown', (data: any) => {
            this.currentPoints = data.points;
            this.displayQuestion(data.question);
        });
        
        // Resultado de respuesta
        this.socket.on('answer-result', (data: any) => {
            this.state.players = data.players;
            socketManager.saveState(this.state);
            this.handleAnswerResult(data);
        });
        
        // Cambio de turno
        this.socket.on('turn-changed', (data: any) => {
            this.state.currentPlayerIndex = data.currentPlayerIndex;
            this.state.currentRound = data.currentRound;
            socketManager.saveState(this.state);
            this.nextTurnUI();
        });
        
        // Juego terminado
        this.socket.on('game-ended', (data: any) => {
            this.state.players = data.players;
            socketManager.saveState(this.state);
            setTimeout(() => {
                window.location.href = 'results.html';
            }, 2000);
        });
        
        // Errores
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
    
    private updateGameInfo(): void {
        const currentRoundEl = document.getElementById('currentRound');
        const totalRoundsEl = document.getElementById('totalRounds');
        const currentPlayerEl = document.getElementById('currentPlayerName');
        
        if (currentRoundEl) currentRoundEl.textContent = (this.state.currentRound || 1).toString();
        if (totalRoundsEl) totalRoundsEl.textContent = (this.state.totalRounds || 10).toString();
        
        if (currentPlayerEl && this.state.players && this.state.currentPlayerIndex !== undefined) {
            const currentPlayer = this.state.players[this.state.currentPlayerIndex];
            if (currentPlayer) {
                currentPlayerEl.textContent = currentPlayer.name;
                currentPlayerEl.style.color = currentPlayer.color || getRandomColor();
            }
        }
    }
    
    private updateScoreboard(): void {
        const container = document.getElementById('scoreboardList');
        if (!container || !this.state.players) return;
        
        const sortedPlayers = [...this.state.players].sort((a, b) => b.score - a.score);
        
        container.innerHTML = sortedPlayers.map((player, index) => {
            const isActive = this.state.currentPlayerIndex !== undefined && 
                            player.id === this.state.players[this.state.currentPlayerIndex]?.id;
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
            
            return `
                <div class="score-item ${isActive ? 'active' : ''} ${rankClass}">
                    <div class="score-player-info">
                        <span class="score-rank">${index + 1}</span>
                        <span class="score-name" style="color: ${player.color || getRandomColor()}">${player.name}</span>
                    </div>
                    <span class="score-points">${player.score}</span>
                </div>
            `;
        }).join('');
    }
    
    private renderWheel(): void {
        const svg = document.getElementById('wheelSvg');
        if (!svg) return;
        
        const segments = this.wheelSegments.length;
        const anglePerSegment = 360 / segments;
        
        svg.innerHTML = '';
        
        this.wheelSegments.forEach((segment, index) => {
            const startAngle = index * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;
            
            const path = this.createSegmentPath(startAngle, endAngle);
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('d', path);
            pathElement.setAttribute('fill', segment.color);
            pathElement.setAttribute('stroke', '#ffffff');
            pathElement.setAttribute('stroke-width', '2');
            pathElement.classList.add('wheel-segment');
            
            svg.appendChild(pathElement);
            
            const textAngle = startAngle + anglePerSegment / 2;
            const textX = 250 + Math.cos((textAngle - 90) * Math.PI / 180) * 150;
            const textY = 250 + Math.sin((textAngle - 90) * Math.PI / 180) * 150;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX.toString());
            text.setAttribute('y', textY.toString());
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#ffffff');
            text.setAttribute('font-size', '24');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('transform', `rotate(${textAngle}, ${textX}, ${textY})`);
            text.textContent = segment.label;
            
            svg.appendChild(text);
        });
    }
    
    private createSegmentPath(startAngle: number, endAngle: number): string {
        const cx = 250;
        const cy = 250;
        const r = 240;
        
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
    }
    
    private spinWheel(): void {
        if (this.isSpinning) return;
        
        // Verificar que es el turno del jugador actual
        const currentPlayer = this.state.players[this.state.currentPlayerIndex!];
        if (currentPlayer.id !== this.state.playerId) {
            showNotification({ message: 'No es tu turno', type: 'info' });
            return;
        }
        
        const spinBtn = document.getElementById('spinBtn') as HTMLButtonElement;
        if (spinBtn) spinBtn.disabled = true;
        
        this.socket.emit('spin-wheel', this.state.roomCode);
    }
    
    private async animateWheelSpin(rotation: number, points: number): Promise<void> {
        this.isSpinning = true;
        
        const wheel = document.getElementById('wheelSvg');
        if (!wheel) return;
        
        wheel.style.transform = `rotate(0deg)`;
        wheel.classList.add('spinning');
        
        await sleep(100);
        
        wheel.style.transform = `rotate(${rotation}deg)`;
        
        await sleep(4000);
        
        wheel.classList.remove('spinning');
        this.isSpinning = false;
        
        await sleep(500);
        
        // Pedir pregunta si es el host
        if (this.state.isHost) {
            const question = getRandomQuestion(this.usedQuestions);
            if (question) {
                this.usedQuestions.add(question.id);
                this.socket.emit('show-question', {
                    question: question,
                    points: points
                });
            }
        }
    }
    
    private displayQuestion(question: Question): void {
        this.currentQuestion = question;
        
        const panel = document.getElementById('questionPanel');
        const questionText = document.getElementById('questionText');
        const answersGrid = document.getElementById('answersGrid');
        const categoryBadge = document.getElementById('categoryBadge');
        const pointsBadge = document.getElementById('pointsBadge');
        
        if (!panel || !questionText || !answersGrid || !categoryBadge || !pointsBadge) return;
        
        categoryBadge.textContent = question.category;
        pointsBadge.textContent = `${this.currentPoints} pts`;
        questionText.textContent = question.question;
        
        answersGrid.innerHTML = question.answers.map((answer, index) => `
            <button class="answer-btn" data-index="${index}">
                ${answer}
            </button>
        `).join('');
        
        // Solo el jugador actual puede responder
        const currentPlayer = this.state.players[this.state.currentPlayerIndex!];
        const canAnswer = currentPlayer && currentPlayer.id === this.state.playerId;
        
        answersGrid.querySelectorAll('.answer-btn').forEach(btn => {
            const button = btn as HTMLButtonElement;
            button.disabled = !canAnswer;
            
            if (canAnswer) {
                button.addEventListener('click', (e) => {
                    const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
                    this.answerQuestion(index);
                });
            }
        });
        
        panel.classList.remove('hidden');
        this.startQuestionTimer();
    }
    
    private startQuestionTimer(): void {
        this.questionTimeLeft = 30;
        this.updateTimerDisplay();
        
        this.questionTimer = window.setInterval(() => {
            this.questionTimeLeft--;
            this.updateTimerDisplay();
            
            if (this.questionTimeLeft <= 0) {
                this.timeOut();
            }
        }, 1000);
    }
    
    private updateTimerDisplay(): void {
        const timerBar = document.getElementById('timerBar');
        const timerText = document.getElementById('timerText');
        
        if (timerBar && timerText) {
            const percentage = (this.questionTimeLeft / 30) * 100;
            timerBar.style.width = `${percentage}%`;
            timerText.textContent = formatTime(this.questionTimeLeft);
        }
    }
    
    private stopQuestionTimer(): void {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    }
    
    private async answerQuestion(answerIndex: number): Promise<void> {
        if (!this.currentQuestion) return;
        
        this.stopQuestionTimer();
        
        const answersGrid = document.getElementById('answersGrid');
        if (!answersGrid) return;
        
        const buttons = answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => (btn as HTMLButtonElement).disabled = true);
        
        const isCorrect = answerIndex === this.currentQuestion.correctIndex;
        
        this.socket.emit('answer-question', {
            isCorrect: isCorrect,
            correctIndex: this.currentQuestion.correctIndex,
            points: this.currentPoints
        });
    }
    
    private async handleAnswerResult(data: any): Promise<void> {
        const answersGrid = document.getElementById('answersGrid');
        if (!answersGrid || !this.currentQuestion) return;
        
        const buttons = answersGrid.querySelectorAll('.answer-btn');
        const selectedBtn = buttons[data.correctIndex] as HTMLElement;
        
        if (data.isCorrect) {
            selectedBtn.classList.add('correct');
            showNotification({ message: `¡Correcto! +${this.currentPoints} puntos`, type: 'success' });
            launchConfetti();
            setTimeout(() => launchConfetti(), 1000);
        } else {
            selectedBtn.classList.add('correct');
            showNotification({ message: '¡Incorrecto! La respuesta correcta se muestra', type: 'error' });
        }
        
        this.updateScoreboard();
        
        await sleep(3000);
        document.getElementById('questionPanel')?.classList.add('hidden');
        this.currentQuestion = null;
        
        if (this.state.isHost) {
            this.socket.emit('next-turn');
        }
    }
    
    private async timeOut(): Promise<void> {
        this.stopQuestionTimer();
        
        if (!this.currentQuestion) return;
        
        const answersGrid = document.getElementById('answersGrid');
        if (!answersGrid) return;
        
        const buttons = answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => (btn as HTMLButtonElement).disabled = true);
        
        const correctBtn = buttons[this.currentQuestion.correctIndex] as HTMLElement;
        correctBtn.classList.add('correct');
        
        showNotification({ message: '¡Tiempo agotado!', type: 'error' });
        
        await sleep(3000);
        document.getElementById('questionPanel')?.classList.add('hidden');
        this.currentQuestion = null;
        
        if (this.state.isHost) {
            this.socket.emit('next-turn');
        }
    }
    
    private nextTurnUI(): void {
        const spinBtn = document.getElementById('spinBtn') as HTMLButtonElement;
        if (spinBtn) spinBtn.disabled = false;
        
        this.updateGameInfo();
        this.updateScoreboard();
        
        const currentPlayer = this.state.players[this.state.currentPlayerIndex!];
        if (currentPlayer) {
            showNotification({ message: `Turno de ${currentPlayer.name}`, type: 'info' });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new GamePage();
});
