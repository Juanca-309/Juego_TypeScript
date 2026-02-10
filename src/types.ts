// ============================
// INTERFACES Y TIPOS
// ============================

export interface Player {
    id: number;
    name: string;
    score: number;
    color: string;
}

export interface Question {
    id: number;
    question: string;
    answers: string[];
    correctIndex: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string;
}

export interface WheelSegment {
    points: number;
    color: string;
    label: string;
}

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    currentRound: number;
    totalRounds: number;
    usedQuestions: Set<number>;
}

export type GameScreen = 'start' | 'game' | 'results';

export interface NotificationOptions {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}
