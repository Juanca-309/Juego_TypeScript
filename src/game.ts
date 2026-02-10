import { Player, Question, WheelSegment, GameState, GameScreen } from './types.js';
import { getRandomQuestion } from './questions.js';
import {
    $, show, hide, showNotification, getRandomColor, formatTime,
    launchConfetti, stopConfetti, createParticles, sleep
} from './utils.js';

// ============================
// GAME CLASS
// ============================

class WheelOfTypeScript {
    private gameState: GameState;
    private wheelSegments: WheelSegment[];
    private currentQuestion: Question | null = null;
    private questionTimer: number | null = null;
    private questionTimeLeft: number = 30;
    private isSpinning: boolean = false;

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
        this.setupEventListeners();
        this.renderWheel();
        this.showScreen('start');
    }

    private setupEventListeners(): void {
        // Start screen
        $('#addPlayerBtn')?.addEventListener('click', () => this.addPlayer());
        $('#playerNameInput')?.addEventListener('keypress', (e) => {
            if ((e as KeyboardEvent).key === 'Enter') this.addPlayer();
        });
        $('#startGameBtn')?.addEventListener('click', () => this.startGame());

        // Game screen
        $('#spinBtn')?.addEventListener('click', () => this.spinWheel());
        $('#exitGameBtn')?.addEventListener('click', () => this.exitGame());

        // Results screen
        $('#playAgainBtn')?.addEventListener('click', () => this.playAgain());
        $('#newPlayersBtn')?.addEventListener('click', () => this.newPlayers());
    }

    // ============================
    // PLAYER MANAGEMENT
    // ============================

    private addPlayer(): void {
        const input = $('#playerNameInput') as HTMLInputElement;
        if (!input) return;

        const name = input.value.trim();
        
        if (!name) {
            showNotification({
                message: '¡Ingresa un nombre!',
                type: 'error'
            });
            return;
        }

        if (this.gameState.players.some(p => p.name === name)) {
            showNotification({
                message: 'Ya existe un jugador con ese nombre',
                type: 'error'
            });
            return;
        }

        if (this.gameState.players.length >= 10) {
            showNotification({
                message: 'Máximo 10 jugadores',
                type: 'error'
            });
            return;
        }

        const player: Player = {
            id: Date.now(),
            name,
            score: 0,
            color: getRandomColor()
        };

        this.gameState.players.push(player);
        input.value = '';
        this.renderPlayersList();
        this.updateStartButton();

        showNotification({
            message: `${name} se ha unido al juego!`,
            type: 'success'
        });
    }

    private removePlayer(id: number): void {
        this.gameState.players = this.gameState.players.filter(p => p.id !== id);
        this.renderPlayersList();
        this.updateStartButton();
    }

    private renderPlayersList(): void {
        const container = $('#playersList');
        if (!container) return;

        if (this.gameState.players.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay jugadores aún</p>';
            return;
        }

        container.innerHTML = this.gameState.players.map(player => `
            <div class="player-item">
                <span class="player-name" style="color: ${player.color}">${player.name}</span>
                <button class="player-remove" data-id="${player.id}">✕</button>
            </div>
        `).join('');

        // Add event listeners to remove buttons
        container.querySelectorAll('.player-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.target as HTMLElement).dataset.id || '0');
                this.removePlayer(id);
            });
        });
    }

    private updateStartButton(): void {
        const btn = $('#startGameBtn') as HTMLButtonElement;
        if (!btn) return;

        btn.disabled = this.gameState.players.length < 2;
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

            // Text position
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

        this.isSpinning = true;
        const spinBtn = $('#spinBtn') as HTMLButtonElement;
        if (spinBtn) spinBtn.disabled = true;

        const wheel = $('#wheelSvg');
        if (!wheel) return;

        // Random rotation (multiple full spins + random position)
        const spins = 5 + Math.random() * 3; // 5-8 spins
        const randomDegree = Math.random() * 360;
        const totalRotation = spins * 360 + randomDegree;

        wheel.classList.add('spinning');
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        // Play sound effect (optional, can be added)
        showNotification({
            message: '¡Girando la ruleta!',
            type: 'info'
        });

        await sleep(4000);

        // Calculate which segment was selected
        const finalAngle = totalRotation % 360;
        const adjustedAngle = (360 - finalAngle + 90) % 360; // Adjust for pointer at top
        const segmentAngle = 360 / this.wheelSegments.length;
        const segmentIndex = Math.floor(adjustedAngle / segmentAngle);
        const selectedSegment = this.wheelSegments[segmentIndex];

        wheel.classList.remove('spinning');
        this.isSpinning = false;

        // Show question
        await sleep(500);
        this.showQuestion(selectedSegment.points);
    }

    // ============================
    // QUESTION MANAGEMENT
    // ============================

    private showQuestion(points: number): void {
        this.currentQuestion = getRandomQuestion(this.gameState.usedQuestions);

        if (!this.currentQuestion) {
            showNotification({
                message: '¡No hay más preguntas disponibles!',
                type: 'error'
            });
            this.endGame();
            return;
        }

        this.gameState.usedQuestions.add(this.currentQuestion.id);

        const panel = $('#questionPanel');
        const questionText = $('#questionText');
        const answersGrid = $('#answersGrid');
        const categoryBadge = $('#categoryBadge');
        const pointsBadge = $('#pointsBadge');

        if (!panel || !questionText || !answersGrid || !categoryBadge || !pointsBadge) return;

        categoryBadge.textContent = this.currentQuestion.category;
        pointsBadge.textContent = `${points} pts`;
        questionText.textContent = this.currentQuestion.question;

        answersGrid.innerHTML = this.currentQuestion.answers.map((answer, index) => `
            <button class="answer-btn" data-index="${index}">
                ${answer}
            </button>
        `).join('');

        // Add event listeners to answer buttons
        answersGrid.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.index || '0');
                this.answerQuestion(index, points);
            });
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

    private async answerQuestion(answerIndex: number, points: number): Promise<void> {
        if (!this.currentQuestion) return;

        this.stopQuestionTimer();

        const answersGrid = $('#answersGrid');
        if (!answersGrid) return;

        const buttons = answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => (btn as HTMLButtonElement).disabled = true);

        const isCorrect = answerIndex === this.currentQuestion.correctIndex;
        const selectedBtn = buttons[answerIndex] as HTMLElement;
        const correctBtn = buttons[this.currentQuestion.correctIndex] as HTMLElement;

        if (isCorrect) {
            selectedBtn.classList.add('correct');
            this.gameState.players[this.gameState.currentPlayerIndex].score += points;
            
            showNotification({
                message: `¡Correcto! +${points} puntos`,
                type: 'success',
                duration: 2000
            });
        } else {
            selectedBtn.classList.add('incorrect');
            correctBtn.classList.add('correct');
            
            showNotification({
                message: '¡Incorrecto! La respuesta era: ' + this.currentQuestion.answers[this.currentQuestion.correctIndex],
                type: 'error',
                duration: 3000
            });
        }

        this.updateScoreboard();

        await sleep(3000);
        this.nextTurn();
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
            message: '¡Tiempo agotado! La respuesta era: ' + this.currentQuestion.answers[this.currentQuestion.correctIndex],
            type: 'error',
            duration: 3000
        });

        await sleep(3000);
        this.nextTurn();
    }

    // ============================
    // GAME FLOW
    // ============================

    private startGame(): void {
        if (this.gameState.players.length < 2) {
            showNotification({
                message: 'Se necesitan al menos 2 jugadores',
                type: 'error'
            });
            return;
        }

        this.gameState.currentRound = 1;
        this.gameState.currentPlayerIndex = 0;
        this.gameState.usedQuestions.clear();
        this.gameState.players.forEach(p => p.score = 0);

        this.showScreen('game');
        this.updateGameInfo();
        this.updateScoreboard();

        showNotification({
            message: '¡Que comience el juego!',
            type: 'success'
        });
    }

    private nextTurn(): void {
        hide($('#questionPanel'));
        this.currentQuestion = null;

        // Next player
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;

        // Check if round is complete
        if (this.gameState.currentPlayerIndex === 0) {
            this.gameState.currentRound++;

            if (this.gameState.currentRound > this.gameState.totalRounds) {
                this.endGame();
                return;
            }
        }

        this.updateGameInfo();
        const spinBtn = $('#spinBtn') as HTMLButtonElement;
        if (spinBtn) spinBtn.disabled = false;

        showNotification({
            message: `Turno de ${this.gameState.players[this.gameState.currentPlayerIndex].name}`,
            type: 'info'
        });
    }

    private updateGameInfo(): void {
        const currentRoundEl = $('#currentRound');
        const totalRoundsEl = $('#totalRounds');
        const currentPlayerEl = $('#currentPlayerName');

        if (currentRoundEl) currentRoundEl.textContent = this.gameState.currentRound.toString();
        if (totalRoundsEl) totalRoundsEl.textContent = this.gameState.totalRounds.toString();
        if (currentPlayerEl) {
            const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
            currentPlayerEl.textContent = currentPlayer.name;
            currentPlayerEl.style.color = currentPlayer.color;
        }
    }

    private updateScoreboard(): void {
        const container = $('#scoreboardList');
        if (!container) return;

        // Sort players by score
        const sortedPlayers = [...this.gameState.players].sort((a, b) => b.score - a.score);

        container.innerHTML = sortedPlayers.map((player, index) => {
            const isActive = player.id === this.gameState.players[this.gameState.currentPlayerIndex].id;
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
            
            return `
                <div class="score-item ${isActive ? 'active' : ''} ${rankClass}">
                    <div class="score-player-info">
                        <span class="score-rank">${index + 1}</span>
                        <span class="score-name" style="color: ${player.color}">${player.name}</span>
                    </div>
                    <span class="score-points">${player.score}</span>
                </div>
            `;
        }).join('');
    }

    private endGame(): void {
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

        // Sort players by score
        const sortedPlayers = [...this.gameState.players].sort((a, b) => b.score - a.score);

        // Render podium (top 3)
        const top3 = sortedPlayers.slice(0, 3);
        const podiumOrder = [1, 0, 2]; // Display order: 2nd, 1st, 3rd

        podium.innerHTML = podiumOrder.map(index => {
            if (!top3[index]) return '';
            
            const player = top3[index];
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

            return `
                <div class="podium-place" data-rank="${rank}">
                    <div class="podium-player">
                        <div class="podium-rank">${medal}</div>
                        <div class="podium-name" style="color: ${player.color}">${player.name}</div>
                        <div class="podium-score">${player.score}</div>
                    </div>
                    <div class="podium-stand">${rank}</div>
                </div>
            `;
        }).join('');

        // Render all scores
        finalScores.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 1rem; font-family: 'Orbitron', sans-serif;">
                📊 Puntuaciones Finales
            </h3>
            ${sortedPlayers.map((player, index) => `
                <div class="final-score-item">
                    <span>
                        <strong>${index + 1}.</strong>
                        <span style="color: ${player.color}">${player.name}</span>
                    </span>
                    <span style="font-family: 'Orbitron', sans-serif; font-weight: 700; color: var(--primary)">
                        ${player.score}
                    </span>
                </div>
            `).join('')}
        `;
    }

    private exitGame(): void {
        if (confirm('¿Estás seguro de que quieres salir del juego?')) {
            this.showScreen('start');
            this.resetGame();
        }
    }

    private playAgain(): void {
        stopConfetti();
        this.startGame();
    }

    private newPlayers(): void {
        stopConfetti();
        this.resetGame();
        this.showScreen('start');
    }

    private resetGame(): void {
        this.gameState.currentRound = 1;
        this.gameState.currentPlayerIndex = 0;
        this.gameState.usedQuestions.clear();
        this.gameState.players.forEach(p => p.score = 0);
        this.stopQuestionTimer();
        hide($('#questionPanel'));
    }

    // ============================
    // SCREEN MANAGEMENT
    // ============================

    private showScreen(screen: GameScreen): void {
        hide($('#startScreen'));
        hide($('#gameScreen'));
        hide($('#resultsScreen'));

        switch (screen) {
            case 'start':
                show($('#startScreen'));
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
    new WheelOfTypeScript();
});
