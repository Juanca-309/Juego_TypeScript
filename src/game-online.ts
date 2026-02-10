import { Player, Question, WheelSegment, GameState, GameScreen } from './types.js';
import { getRandomQuestion } from './questions.js';
import {
    $, show, hide, showNotification, getRandomColor, formatTime,
    launchConfetti, stopConfetti, createParticles, sleep
} from './utils.js';

// ============================
// SOCKET.IO CLIENT
// ============================

declare const io: any;

class OnlineWheelOfTypeScript {
    private socket: any;
    private roomCode: string | null = null;
    private playerId: string | null = null;
    private playerName: string | null = null;
    private isHost: boolean = false;
    private players: Player[] = [];
    private wheelSegments: WheelSegment[];
    private currentQuestion: Question | null = null;
    private questionTimer: number | null = null;
    private questionTimeLeft: number = 30;
    private isSpinning: boolean = false;
    private gameState: GameState;
    private currentPoints: number = 0;

    constructor() {
        this.gameState = {
            players: [],
            currentPlayerIndex: 0,
            currentRound: 1,
            totalRounds: 10,
            usedQuestions: new Set()
        };

        this.wheelSegments = this.createWheelSegments();
        this.init();
    }

    private init(): void {
        createParticles();
        this.connectSocket();
        this.setupEventListeners();
        this.renderWheel();
        this.showScreen('menu');
    }

    private connectSocket(): void {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Conectado al servidor');
            this.playerId = this.socket.id;
        });

        this.socket.on('disconnect', () => {
            console.log('Desconectado del servidor');
            showNotification({
                message: 'Desconectado del servidor',
                type: 'error'
            });
        });

        // Eventos del juego
        this.socket.on('player-joined', (data: any) => {
            this.players = data.players;
            this.renderPlayersGrid();
            showNotification({
                message: `${data.player.name} se ha unido`,
                type: 'success'
            });
        });

        this.socket.on('player-removed', (data: any) => {
            this.players = data.players;
            this.renderPlayersGrid();
        });

        this.socket.on('player-disconnected', (data: any) => {
            showNotification({
                message: `${data.player.name} se ha desconectado`,
                type: 'info'
            });
            this.renderPlayersGrid();
        });

        this.socket.on('game-started', (data: any) => {
            this.players = data.players;
            this.gameState = data.gameState;
            this.startGameUI();
        });

        this.socket.on('wheel-spinning', (data: any) => {
            this.animateWheelSpin(data.rotation, data.points);
        });

        this.socket.on('question-shown', (data: any) => {
            this.currentPoints = data.points;
            this.displayQuestion(data.question);
        });

        this.socket.on('answer-result', (data: any) => {
            this.players = data.players;
            this.handleAnswerResult(data);
        });

        this.socket.on('turn-changed', (data: any) => {
            this.gameState.currentPlayerIndex = data.currentPlayerIndex;
            this.gameState.currentRound = data.currentRound;
            this.nextTurnUI();
        });

        this.socket.on('game-ended', (data: any) => {
            this.players = data.players;
            this.endGameUI();
        });

        this.socket.on('game-exited', () => {
            this.showScreen('lobby');
            this.resetGameUI();
        });

        this.socket.on('room-closed', () => {
            showNotification({
                message: 'La sala ha sido cerrada',
                type: 'error'
            });
            this.showScreen('menu');
        });

        this.socket.on('error', (data: any) => {
            showNotification({
                message: data.message,
                type: 'error'
            });
        });
    }

    private setupEventListeners(): void {
        // Menu screen
        $('#createRoomBtn')?.addEventListener('click', () => this.showCreateRoomModal());
        $('#joinRoomBtn')?.addEventListener('click', () => this.showJoinRoomModal());

        // Create room modal
        $('#confirmCreateBtn')?.addEventListener('click', () => this.createRoom());
        $('#cancelCreateBtn')?.addEventListener('click', () => hide($('#createRoomModal')));
        $('#createPlayerName')?.addEventListener('keypress', (e) => {
            if ((e as KeyboardEvent).key === 'Enter') this.createRoom();
        });

        // Join room modal
        $('#confirmJoinBtn')?.addEventListener('click', () => this.joinRoom());
        $('#cancelJoinBtn')?.addEventListener('click', () => hide($('#joinRoomModal')));
        $('#joinRoomCode')?.addEventListener('keypress', (e) => {
            if ((e as KeyboardEvent).key === 'Enter') this.joinRoom();
        });

        // Lobby screen
        $('#backToMenuBtn')?.addEventListener('click', () => this.backToMenu());
        $('#copyCodeBtn')?.addEventListener('click', () => this.copyRoomCode());
        $('#startGameBtnLobby')?.addEventListener('click', () => this.startGame());

        // Game screen
        $('#spinBtn')?.addEventListener('click', () => this.spinWheel());
        $('#exitGameBtn')?.addEventListener('click', () => this.exitGame());

        // Results screen
        $('#playAgainBtn')?.addEventListener('click', () => this.playAgain());
        $('#newPlayersBtn')?.addEventListener('click', () => this.backToLobby());
    }

    // ============================
    // ROOM MANAGEMENT
    // ============================

    private showCreateRoomModal(): void {
        const modal = $('#createRoomModal');
        const input = $('#createPlayerName') as HTMLInputElement;
        if (input) input.value = '';
        show(modal);
        input?.focus();
    }

    private showJoinRoomModal(): void {
        const modal = $('#joinRoomModal');
        const nameInput = $('#joinPlayerName') as HTMLInputElement;
        const codeInput = $('#joinRoomCode') as HTMLInputElement;
        if (nameInput) nameInput.value = '';
        if (codeInput) codeInput.value = '';
        show(modal);
        nameInput?.focus();
    }

    private createRoom(): void {
        const input = $('#createPlayerName') as HTMLInputElement;
        if (!input) return;

        const name = input.value.trim();
        if (!name) {
            showNotification({ message: '¡Ingresa tu nombre!', type: 'error' });
            return;
        }

        this.socket.emit('create-room', name, (response: any) => {
            if (response.success) {
                this.roomCode = response.roomCode;
                this.playerName = name;
                this.isHost = true;
                this.players = response.room.players;
                hide($('#createRoomModal'));
                this.showLobby();
            } else {
                showNotification({ message: 'Error al crear sala', type: 'error' });
            }
        });
    }

    private joinRoom(): void {
        const nameInput = $('#joinPlayerName') as HTMLInputElement;
        const codeInput = $('#joinRoomCode') as HTMLInputElement;
        
        if (!nameInput || !codeInput) return;

        const name = nameInput.value.trim();
        const code = codeInput.value.trim().toUpperCase();

        if (!name || !code) {
            showNotification({ message: '¡Completa todos los campos!', type: 'error' });
            return;
        }

        this.socket.emit('join-room', { roomCode: code, playerName: name }, (response: any) => {
            if (response.success) {
                this.roomCode = code;
                this.playerName = name;
                this.isHost = false;
                this.players = response.room.players;
                hide($('#joinRoomModal'));
                this.showLobby();
            } else {
                showNotification({ message: response.error, type: 'error' });
            }
        });
    }

    private showLobby(): void {
        this.showScreen('lobby');
        const roomCodeDisplay = $('#roomCodeDisplay');
        if (roomCodeDisplay && this.roomCode) {
            roomCodeDisplay.textContent = this.roomCode;
        }
        this.renderPlayersGrid();
    }

    private renderPlayersGrid(): void {
        const container = $('#playersGrid');
        if (!container) return;

        container.innerHTML = this.players.map(player => {
            const isMe = player.id === this.playerId;
            const avatarEmoji = this.getPlayerEmoji(player.name);
            
            return `
                <div class="player-card ${player.isHost ? 'host' : ''} ${!player.connected ? 'disconnected' : ''}">
                    <div class="player-card-avatar" style="background: ${player.color || getRandomColor()}">
                        ${avatarEmoji}
                    </div>
                    <div class="player-card-name">
                        ${player.name} ${isMe ? '(Tú)' : ''}
                    </div>
                    ${player.isHost ? '<div class="player-card-badge">👑 Anfitrión</div>' : ''}
                    ${!player.connected ? '<div class="player-card-badge" style="background: var(--danger)">⚠️ Desconectado</div>' : ''}
                </div>
            `;
        }).join('');

        // Update start button
        const startBtn = $('#startGameBtnLobby') as HTMLButtonElement;
        const hint = $('#lobbyHint');
        if (startBtn) {
            startBtn.disabled = !this.isHost || this.players.length < 2;
            startBtn.style.display = this.isHost ? 'inline-flex' : 'none';
        }
        if (hint) {
            if (!this.isHost) {
                hint.textContent = 'Esperando a que el anfitrión inicie el juego...';
            } else if (this.players.length < 2) {
                hint.textContent = 'Se necesitan al menos 2 jugadores';
            } else {
                hint.textContent = `${this.players.length} jugadores listos`;
            }
        }
    }

    private getPlayerEmoji(name: string): string {
        const emojis = ['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '🦸'];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return emojis[index % emojis.length];
    }

    private copyRoomCode(): void {
        if (!this.roomCode) return;

        navigator.clipboard.writeText(this.roomCode).then(() => {
            showNotification({
                message: '¡Código copiado al portapapeles!',
                type: 'success'
            });
        }).catch(() => {
            showNotification({
                message: 'No se pudo copiar el código',
                type: 'error'
            });
        });
    }

    private backToMenu(): void {
        if (confirm('¿Salir de la sala?')) {
            this.socket.disconnect();
            this.socket.connect();
            this.roomCode = null;
            this.playerName = null;
            this.isHost = false;
            this.players = [];
            this.showScreen('menu');
        }
    }

    // ============================
    // GAME FLOW
    // ============================

    private startGame(): void {
        this.socket.emit('start-game');
    }

    private startGameUI(): void {
        this.showScreen('game');
        this.updateGameInfo();
        this.updateScoreboard();

        showNotification({
            message: '¡Que comience el juego!',
            type: 'success'
        });
    }

    private updateGameInfo(): void {
        const currentRoundEl = $('#currentRound');
        const totalRoundsEl = $('#totalRounds');
        const currentPlayerEl = $('#currentPlayerName');

        if (currentRoundEl) currentRoundEl.textContent = this.gameState.currentRound.toString();
        if (totalRoundsEl) totalRoundsEl.textContent = this.gameState.totalRounds.toString();
        if (currentPlayerEl && this.players[this.gameState.currentPlayerIndex]) {
            const currentPlayer = this.players[this.gameState.currentPlayerIndex];
            currentPlayerEl.textContent = currentPlayer.name;
            currentPlayerEl.style.color = currentPlayer.color || getRandomColor();
        }
    }

    private updateScoreboard(): void {
        const container = $('#scoreboardList');
        if (!container) return;

        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);

        container.innerHTML = sortedPlayers.map((player, index) => {
            const isActive = player.id === this.players[this.gameState.currentPlayerIndex]?.id;
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

    // ============================
    // WHEEL MANAGEMENT
    // ============================

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

    private renderWheel(): void {
        const svg = $('#wheelSvg');
        if (!svg) return;

        const centerX = 250;
        const centerY = 250;
        const radius = 230;
        const segments = this.wheelSegments.length;
        const anglePerSegment = 360 / segments;

        let html = '';

        for (let i = 0; i < segments; i++) {
            const startAngle = i * anglePerSegment - 90;
            const endAngle = (i + 1) * anglePerSegment - 90;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = anglePerSegment > 180 ? 1 : 0;

            const pathData = `
                M ${centerX} ${centerY}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
            `;

            const textAngle = startAngle + anglePerSegment / 2;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
            const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);

            html += `
                <g>
                    <path d="${pathData}" fill="${this.wheelSegments[i].color}" 
                          stroke="#0f172a" stroke-width="3" opacity="0.9"/>
                    <text x="${textX}" y="${textY}" 
                          fill="white" 
                          font-family="Orbitron, sans-serif" 
                          font-size="28" 
                          font-weight="700" 
                          text-anchor="middle" 
                          dominant-baseline="middle"
                          style="text-shadow: 0 2px 10px rgba(0,0,0,0.8)">
                        ${this.wheelSegments[i].label}
                    </text>
                </g>
            `;
        }

        svg.innerHTML = html;
    }

    private async spinWheel(): Promise<void> {
        if (this.isSpinning) return;

        const currentPlayer = this.players[this.gameState.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== this.playerId) {
            showNotification({ message: 'No es tu turno', type: 'error' });
            return;
        }

        this.isSpinning = true;
        const spinBtn = $('#spinBtn') as HTMLButtonElement;
        if (spinBtn) spinBtn.disabled = true;

        const spins = 5 + Math.random() * 3;
        const randomDegree = Math.random() * 360;
        const totalRotation = spins * 360 + randomDegree;

        const finalAngle = totalRotation % 360;
        const adjustedAngle = (360 - finalAngle + 90) % 360;
        const segmentAngle = 360 / this.wheelSegments.length;
        const segmentIndex = Math.floor(adjustedAngle / segmentAngle);
        const selectedSegment = this.wheelSegments[segmentIndex];

        this.socket.emit('spin-wheel', {
            rotation: totalRotation,
            points: selectedSegment.points
        });
    }

    private async animateWheelSpin(rotation: number, points: number): Promise<void> {
        const wheel = $('#wheelSvg');
        if (!wheel) return;

        wheel.classList.add('spinning');
        wheel.style.transform = `rotate(${rotation}deg)`;

        showNotification({
            message: '¡Girando la ruleta!',
            type: 'info'
        });

        await sleep(4000);

        wheel.classList.remove('spinning');
        this.isSpinning = false;

        await sleep(500);
        this.showQuestionRequest(points);
    }

    // ============================
    // QUESTION MANAGEMENT
    // ============================

    private showQuestionRequest(points: number): void {
        const question = getRandomQuestion(this.gameState.usedQuestions);

        if (!question) {
            showNotification({ message: '¡No hay más preguntas!', type: 'error' });
            return;
        }

        this.socket.emit('show-question', {
            questionId: question.id,
            question: question,
            points: points
        });
    }

    private displayQuestion(question: Question): void {
        this.currentQuestion = question;

        const panel = $('#questionPanel');
        const questionText = $('#questionText');
        const answersGrid = $('#answersGrid');
        const categoryBadge = $('#categoryBadge');
        const pointsBadge = $('#pointsBadge');

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
        const currentPlayer = this.players[this.gameState.currentPlayerIndex];
        const canAnswer = currentPlayer && currentPlayer.id === this.playerId;

        answersGrid.querySelectorAll('.answer-btn').forEach(btn => {
            const button = btn as HTMLButtonElement;
            button.disabled = !canAnswer;
            
            if (canAnswer) {
                button.addEventListener('click', (e) => {
                    const index = parseInt((e.target as HTMLElement).dataset.index || '0');
                    this.answerQuestion(index);
                });
            }
        });

        show(panel);
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
        const timerBar = $('#timerBar');
        const timerText = $('#timerText');

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

        const answersGrid = $('#answersGrid');
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
        const answersGrid = $('#answersGrid');
        if (!answersGrid || !this.currentQuestion) return;

        const buttons = answersGrid.querySelectorAll('.answer-btn');
        const selectedBtn = buttons[data.correctIndex] as HTMLElement;
        
        if (data.isCorrect) {
            selectedBtn.classList.add('correct');
            showNotification({
                message: `¡Correcto! +${this.currentPoints} puntos`,
                type: 'success',
                duration: 2000
            });
        } else {
            selectedBtn.classList.add('correct');
            showNotification({
                message: '¡Incorrecto! La respuesta correcta se muestra',
                type: 'error',
                duration: 3000
            });
        }

        this.updateScoreboard();

        await sleep(3000);
        hide($('#questionPanel'));
        this.currentQuestion = null;
        
        // Solo el host envía el siguiente turno
        if (this.isHost) {
            this.socket.emit('next-turn');
        }
    }

    private async timeOut(): Promise<void> {
        this.stopQuestionTimer();

        if (!this.currentQuestion) return;

        const answersGrid = $('#answersGrid');
        if (!answersGrid) return;

        const buttons = answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => (btn as HTMLButtonElement).disabled = true);

        const correctBtn = buttons[this.currentQuestion.correctIndex] as HTMLElement;
        correctBtn.classList.add('correct');

        showNotification({
            message: '¡Tiempo agotado!',
            type: 'error',
            duration: 3000
        });

        await sleep(3000);
        hide($('#questionPanel'));
        this.currentQuestion = null;

        if (this.isHost) {
            this.socket.emit('next-turn');
        }
    }

    private nextTurnUI(): void {
        const spinBtn = $('#spinBtn') as HTMLButtonElement;
        if (spinBtn) spinBtn.disabled = false;

        this.updateGameInfo();
        this.updateScoreboard();

        const currentPlayer = this.players[this.gameState.currentPlayerIndex];
        if (currentPlayer) {
            showNotification({
                message: `Turno de ${currentPlayer.name}`,
                type: 'info'
            });
        }
    }

    private exitGame(): void {
        if (confirm('¿Salir del juego?')) {
            this.socket.emit('exit-game');
        }
    }

    private playAgain(): void {
        stopConfetti();
        if (this.isHost) {
            this.socket.emit('play-again');
        }
    }

    private backToLobby(): void {
        stopConfetti();
        this.showScreen('lobby');
        this.renderPlayersGrid();
    }

    private endGameUI(): void {
        this.showScreen('results');
        this.renderResults();
        launchConfetti();

        setTimeout(() => {
            stopConfetti();
        }, 5000);
    }

    private renderResults(): void {
        const podium = $('#podium');
        const finalScores = $('#finalScores');

        if (!podium || !finalScores) return;

        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);

        const top3 = sortedPlayers.slice(0, 3);
        const podiumOrder = [1, 0, 2];

        podium.innerHTML = podiumOrder.map(index => {
            if (!top3[index]) return '';
            
            const player = top3[index];
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

            return `
                <div class="podium-place" data-rank="${rank}">
                    <div class="podium-player">
                        <div class="podium-rank">${medal}</div>
                        <div class="podium-name" style="color: ${player.color || getRandomColor()}">${player.name}</div>
                        <div class="podium-score">${player.score}</div>
                    </div>
                    <div class="podium-stand">${rank}</div>
                </div>
            `;
        }).join('');

        finalScores.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 1rem; font-family: 'Orbitron', sans-serif;">
                📊 Puntuaciones Finales
            </h3>
            ${sortedPlayers.map((player, index) => `
                <div class="final-score-item">
                    <span>
                        <strong>${index + 1}.</strong>
                        <span style="color: ${player.color || getRandomColor()}">${player.name}</span>
                    </span>
                    <span style="font-family: 'Orbitron', sans-serif; font-weight: 700; color: var(--primary)">
                        ${player.score}
                    </span>
                </div>
            `).join('')}
        `;

        // Mostrar botones según rol
        const playAgainBtn = $('#playAgainBtn');
        const newPlayersBtn = $('#newPlayersBtn');
        
        if (playAgainBtn) {
            playAgainBtn.style.display = this.isHost ? 'inline-flex' : 'none';
        }
        if (newPlayersBtn) {
            newPlayersBtn.style.display = this.isHost ? 'inline-flex' : 'none';
        }
    }

    private resetGameUI(): void {
        this.stopQuestionTimer();
        hide($('#questionPanel'));
        const spinBtn = $('#spinBtn') as HTMLButtonElement;
        if (spinBtn) spinBtn.disabled = false;
    }

    // ============================
    // SCREEN MANAGEMENT
    // ============================

    private showScreen(screen: string): void {
        hide($('#menuScreen'));
        hide($('#lobbyScreen'));
        hide($('#gameScreen'));
        hide($('#resultsScreen'));
        hide($('#startScreen'));

        switch (screen) {
            case 'menu':
                show($('#menuScreen'));
                break;
            case 'lobby':
                show($('#lobbyScreen'));
                break;
            case 'game':
                show($('#gameScreen'));
                break;
            case 'results':
                show($('#resultsScreen'));
                break;
        }
    }
}

// ============================
// INITIALIZE GAME
// ============================

document.addEventListener('DOMContentLoaded', () => {
    new OnlineWheelOfTypeScript();
});
