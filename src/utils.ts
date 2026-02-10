import { NotificationOptions } from './types.js';

// ============================
// UTILIDADES GENERALES
// ============================

export function $(selector: string): HTMLElement | null {
    return document.querySelector(selector);
}

export function $all(selector: string): NodeListOf<Element> {
    return document.querySelectorAll(selector);
}

export function show(element: HTMLElement | null): void {
    if (element) {
        element.classList.remove('hidden');
    }
}

export function hide(element: HTMLElement | null): void {
    if (element) {
        element.classList.add('hidden');
    }
}

export function showNotification(options: NotificationOptions): void {
    const { message, type, duration = 3000 } = options;
    
    const container = $('#notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function getRandomColor(): string {
    const colors = [
        '#3b82f6', // blue
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#f59e0b', // amber
        '#10b981', // green
        '#06b6d4', // cyan
        '#f97316', // orange
        '#6366f1', // indigo
        '#14b8a6', // teal
        '#8b5cf6'  // violet
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

export function formatTime(seconds: number): string {
    return `${seconds}s`;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================
// CONFETTI ANIMATION
// ============================

interface Confetti {
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngleIncremental: number;
    tiltAngle: number;
}

let confettiParticles: Confetti[] = [];
let animationFrame: number | null = null;

export function launchConfetti(): void {
    const canvas = $('#confettiCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
    confettiParticles = [];
    
    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 3,
            d: Math.random() * 150 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    function drawConfetti() {
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach((particle, index) => {
            ctx.beginPath();
            ctx.lineWidth = particle.r / 2;
            ctx.strokeStyle = particle.color;
            ctx.moveTo(particle.x + particle.tilt + particle.r, particle.y);
            ctx.lineTo(particle.x + particle.tilt, particle.y + particle.tilt + particle.r);
            ctx.stroke();
            
            particle.tiltAngle += particle.tiltAngleIncremental;
            particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
            particle.tilt = Math.sin(particle.tiltAngle - index / 3) * 15;
            
            if (particle.y > canvas.height) {
                confettiParticles.splice(index, 1);
            }
        });
        
        if (confettiParticles.length > 0) {
            animationFrame = requestAnimationFrame(drawConfetti);
        } else {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    drawConfetti();
}

export function stopConfetti(): void {
    confettiParticles = [];
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

// ============================
// PARTICLES BACKGROUND
// ============================

export function createParticles(): void {
    const particlesContainer = $('#particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 4 + 1}px`;
        particle.style.height = particle.style.width;
        particle.style.background = Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6';
        particle.style.borderRadius = '50%';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS animation if not exists
    if (!document.querySelector('#particles-animation')) {
        const style = document.createElement('style');
        style.id = 'particles-animation';
        style.textContent = `
            @keyframes float {
                0%, 100% {
                    transform: translateY(0) translateX(0);
                }
                25% {
                    transform: translateY(-20px) translateX(10px);
                }
                50% {
                    transform: translateY(-40px) translateX(-10px);
                }
                75% {
                    transform: translateY(-20px) translateX(5px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}
